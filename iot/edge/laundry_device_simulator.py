import paho.mqtt.client as mqtt
import json
import time
import random
import logging
from datetime import datetime
from typing import Dict, Any

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class LaundryIoTDevice:
    """
    Simulated IoT device for laundry machines
    """

    def __init__(self, device_id: str, device_type: str, mqtt_broker: str, mqtt_port: int = 1883):
        self.device_id = device_id
        self.device_type = device_type  # "washer" or "dryer"
        self.mqtt_broker = mqtt_broker
        self.mqtt_port = mqtt_port
        self.client = mqtt.Client()

        # Device state
        self.is_running = False
        self.current_program = None
        self.time_remaining = 0
        self.temperature = 20.0
        self.water_level = 0
        self.vibration_level = 0
        self.door_open = False
        self.error_status = None

        # Setup MQTT callbacks
        self.client.on_connect = self.on_connect
        self.client.on_message = self.on_message

    def on_connect(self, client, userdata, flags, rc):
        """Callback for MQTT connection"""
        if rc == 0:
            logger.info(f"Device {self.device_id} connected to MQTT broker")
            # Subscribe to command topics
            client.subscribe(f"laundry/{self.device_id}/commands")
            client.subscribe(f"laundry/broadcast/commands")
        else:
            logger.error(f"Failed to connect to MQTT broker: {rc}")

    def on_message(self, client, userdata, msg):
        """Handle incoming MQTT messages"""
        try:
            topic = msg.topic
            payload = json.loads(msg.payload.decode())

            logger.info(f"Received command on {topic}: {payload}")

            if "commands" in topic:
                self.handle_command(payload)

        except Exception as e:
            logger.error(f"Error processing message: {e}")

    def handle_command(self, command: Dict[str, Any]):
        """Handle device commands"""
        cmd_type = command.get("type")

        if cmd_type == "start_cycle":
            self.start_cycle(command.get("program", "normal"))
        elif cmd_type == "stop_cycle":
            self.stop_cycle()
        elif cmd_type == "open_door":
            self.open_door()
        elif cmd_type == "close_door":
            self.close_door()
        elif cmd_type == "get_status":
            self.publish_status()
        else:
            logger.warning(f"Unknown command type: {cmd_type}")

    def start_cycle(self, program: str):
        """Start a laundry cycle"""
        if self.door_open:
            logger.warning("Cannot start cycle - door is open")
            return

        if self.is_running:
            logger.warning("Device is already running")
            return

        self.is_running = True
        self.current_program = program

        # Set cycle duration based on program
        cycle_durations = {
            "quick": 30,
            "normal": 60,
            "heavy": 90,
            "delicate": 45
        }
        self.time_remaining = cycle_durations.get(program, 60)

        logger.info(f"Started {program} cycle on {self.device_id}")
        self.publish_status()

    def stop_cycle(self):
        """Stop the current cycle"""
        self.is_running = False
        self.current_program = None
        self.time_remaining = 0

        logger.info(f"Stopped cycle on {self.device_id}")
        self.publish_status()

    def open_door(self):
        """Open the device door"""
        if self.is_running:
            logger.warning("Cannot open door while cycle is running")
            return

        self.door_open = True
        logger.info(f"Door opened on {self.device_id}")
        self.publish_status()

    def close_door(self):
        """Close the device door"""
        self.door_open = False
        logger.info(f"Door closed on {self.device_id}")
        self.publish_status()

    def simulate_sensor_data(self):
        """Simulate sensor readings"""
        if self.is_running:
            # Simulate temperature variations
            if self.device_type == "washer":
                self.temperature = random.uniform(30, 60)
                self.water_level = random.uniform(50, 100)
            else:  # dryer
                self.temperature = random.uniform(40, 80)
                self.water_level = 0

            # Simulate vibration
            self.vibration_level = random.uniform(1, 5)

            # Simulate time countdown
            if self.time_remaining > 0:
                self.time_remaining -= 1

            # End cycle when time is up
            if self.time_remaining <= 0:
                self.stop_cycle()
                self.publish_event("cycle_completed")
        else:
            # Device at rest
            self.temperature = random.uniform(18, 25)
            self.water_level = 0 if self.device_type == "dryer" else random.uniform(0, 10)
            self.vibration_level = 0

    def publish_status(self):
        """Publish device status to MQTT"""
        status = {
            "device_id": self.device_id,
            "device_type": self.device_type,
            "timestamp": datetime.now().isoformat(),
            "is_running": self.is_running,
            "current_program": self.current_program,
            "time_remaining": self.time_remaining,
            "temperature": round(self.temperature, 1),
            "water_level": round(self.water_level, 1),
            "vibration_level": round(self.vibration_level, 1),
            "door_open": self.door_open,
            "error_status": self.error_status
        }

        topic = f"laundry/{self.device_id}/status"
        self.client.publish(topic, json.dumps(status))
        logger.info(f"Published status for {self.device_id}")

    def publish_event(self, event_type: str, data: Dict = None):
        """Publish device events"""
        event = {
            "device_id": self.device_id,
            "device_type": self.device_type,
            "timestamp": datetime.now().isoformat(),
            "event_type": event_type,
            "data": data or {}
        }

        topic = f"laundry/{self.device_id}/events"
        self.client.publish(topic, json.dumps(event))
        logger.info(f"Published event {event_type} for {self.device_id}")

    def connect(self):
        """Connect to MQTT broker"""
        try:
            self.client.connect(self.mqtt_broker, self.mqtt_port, 60)
            self.client.loop_start()
            return True
        except Exception as e:
            logger.error(f"Failed to connect to MQTT broker: {e}")
            return False

    def disconnect(self):
        """Disconnect from MQTT broker"""
        self.client.loop_stop()
        self.client.disconnect()

    def run_simulation(self, duration_minutes: int = 60):
        """Run device simulation"""
        logger.info(f"Starting simulation for {self.device_id}")

        if not self.connect():
            return

        try:
            # Initial status publish
            self.publish_status()

            end_time = time.time() + (duration_minutes * 60)

            while time.time() < end_time:
                # Simulate sensor data and publish status every 30 seconds
                self.simulate_sensor_data()
                self.publish_status()

                # Random events
                if random.random() < 0.01:  # 1% chance per iteration
                    if not self.door_open and not self.is_running:
                        self.open_door()
                    elif self.door_open and not self.is_running:
                        self.close_door()

                time.sleep(30)  # Update every 30 seconds

        except KeyboardInterrupt:
            logger.info("Simulation interrupted by user")
        finally:
            self.disconnect()
            logger.info(f"Simulation ended for {self.device_id}")

if __name__ == "__main__":
    # Example usage
    import sys

    device_id = sys.argv[1] if len(sys.argv) > 1 else "washer_001"
    device_type = sys.argv[2] if len(sys.argv) > 2 else "washer"
    mqtt_broker = sys.argv[3] if len(sys.argv) > 3 else "localhost"

    device = LaundryIoTDevice(device_id, device_type, mqtt_broker)
    device.run_simulation(duration_minutes=10)  # Run for 10 minutes
