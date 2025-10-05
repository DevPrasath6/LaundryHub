"""
IoT Firmware Simulation for Smart Laundry Devices
This simulates the embedded firmware behavior of laundry machines
"""

import time
import json
import random
import threading
from typing import Dict, Any, Optional
from dataclasses import dataclass, asdict
from enum import Enum
import paho.mqtt.client as mqtt


class DeviceType(Enum):
    WASHER = "washer"
    DRYER = "dryer"
    DISPENSER = "dispenser"


class DeviceStatus(Enum):
    IDLE = "idle"
    RUNNING = "running"
    PAUSED = "paused"
    COMPLETED = "completed"
    ERROR = "error"
    MAINTENANCE = "maintenance"


@dataclass
class SensorReading:
    temperature: float
    humidity: float
    vibration: float
    water_level: float
    door_status: bool
    timestamp: float


@dataclass
class DeviceState:
    device_id: str
    device_type: DeviceType
    status: DeviceStatus
    cycle_time_remaining: int
    current_program: str
    error_code: Optional[str] = None
    last_maintenance: Optional[float] = None


class LaundryDeviceFirmware:
    """Simulates firmware behavior of a smart laundry device"""

    def __init__(self, device_id: str, device_type: DeviceType, mqtt_host: str = "localhost"):
        self.device_id = device_id
        self.device_type = device_type
        self.state = DeviceState(
            device_id=device_id,
            device_type=device_type,
            status=DeviceStatus.IDLE,
            cycle_time_remaining=0,
            current_program="none"
        )

        # MQTT Configuration
        self.mqtt_client = mqtt.Client()
        self.mqtt_host = mqtt_host
        self.mqtt_port = 1883
        self.connected = False

        # Device configuration
        self.programs = self._get_device_programs()
        self.sensor_thread = None
        self.running = False

        # Setup MQTT callbacks
        self.mqtt_client.on_connect = self._on_connect
        self.mqtt_client.on_message = self._on_message
        self.mqtt_client.on_disconnect = self._on_disconnect

    def _get_device_programs(self) -> Dict[str, int]:
        """Return available programs for the device type"""
        if self.device_type == DeviceType.WASHER:
            return {
                "quick_wash": 30,
                "normal_wash": 45,
                "heavy_duty": 60,
                "delicate": 40,
                "eco_wash": 75
            }
        elif self.device_type == DeviceType.DRYER:
            return {
                "quick_dry": 25,
                "normal_dry": 40,
                "heavy_dry": 55,
                "delicate_dry": 35,
                "air_dry": 20
            }
        else:  # DISPENSER
            return {
                "dispense_detergent": 2,
                "dispense_softener": 1,
                "dispense_bleach": 1
            }

    def _on_connect(self, client, userdata, flags, rc):
        """Called when MQTT client connects"""
        if rc == 0:
            self.connected = True
            print(f"Device {self.device_id} connected to MQTT broker")

            # Subscribe to command topic
            command_topic = f"laundry/{self.device_id}/commands"
            client.subscribe(command_topic)
            print(f"Subscribed to {command_topic}")

            # Send initial status
            self._publish_status()
        else:
            print(f"Failed to connect to MQTT broker: {rc}")

    def _on_disconnect(self, client, userdata, rc):
        """Called when MQTT client disconnects"""
        self.connected = False
        print(f"Device {self.device_id} disconnected from MQTT broker")

    def _on_message(self, client, userdata, msg):
        """Handle incoming MQTT commands"""
        try:
            command = json.loads(msg.payload.decode())
            self._process_command(command)
        except Exception as e:
            print(f"Error processing command: {e}")

    def _process_command(self, command: Dict[str, Any]):
        """Process incoming commands"""
        action = command.get("action")

        if action == "start_cycle":
            program = command.get("program")
            self._start_cycle(program)
        elif action == "pause_cycle":
            self._pause_cycle()
        elif action == "resume_cycle":
            self._resume_cycle()
        elif action == "stop_cycle":
            self._stop_cycle()
        elif action == "get_status":
            self._publish_status()
        elif action == "maintenance_mode":
            self._enter_maintenance()
        else:
            print(f"Unknown command: {action}")

    def _start_cycle(self, program: str):
        """Start a laundry cycle"""
        if self.state.status != DeviceStatus.IDLE:
            self._publish_error("Device not idle")
            return

        if program not in self.programs:
            self._publish_error(f"Unknown program: {program}")
            return

        self.state.status = DeviceStatus.RUNNING
        self.state.current_program = program
        self.state.cycle_time_remaining = self.programs[program]

        self._publish_status()
        self._publish_event("cycle_started", {"program": program})

        # Start cycle timer
        threading.Thread(target=self._run_cycle, daemon=True).start()

    def _run_cycle(self):
        """Simulate running a cycle"""
        while self.state.cycle_time_remaining > 0 and self.state.status == DeviceStatus.RUNNING:
            time.sleep(60)  # 1 minute intervals
            self.state.cycle_time_remaining -= 1
            self._publish_status()

            # Simulate random events during cycle
            if random.random() < 0.1:  # 10% chance of event
                event_types = ["water_fill", "spin_start", "rinse_cycle", "drain"]
                event = random.choice(event_types)
                self._publish_event("cycle_event", {"event": event})

        if self.state.cycle_time_remaining <= 0:
            self.state.status = DeviceStatus.COMPLETED
            self.state.current_program = "none"
            self._publish_status()
            self._publish_event("cycle_completed", {})

    def _pause_cycle(self):
        """Pause current cycle"""
        if self.state.status == DeviceStatus.RUNNING:
            self.state.status = DeviceStatus.PAUSED
            self._publish_status()
            self._publish_event("cycle_paused", {})

    def _resume_cycle(self):
        """Resume paused cycle"""
        if self.state.status == DeviceStatus.PAUSED:
            self.state.status = DeviceStatus.RUNNING
            self._publish_status()
            self._publish_event("cycle_resumed", {})
            threading.Thread(target=self._run_cycle, daemon=True).start()

    def _stop_cycle(self):
        """Stop current cycle"""
        if self.state.status in [DeviceStatus.RUNNING, DeviceStatus.PAUSED]:
            self.state.status = DeviceStatus.IDLE
            self.state.current_program = "none"
            self.state.cycle_time_remaining = 0
            self._publish_status()
            self._publish_event("cycle_stopped", {})

    def _enter_maintenance(self):
        """Enter maintenance mode"""
        self.state.status = DeviceStatus.MAINTENANCE
        self.state.last_maintenance = time.time()
        self._publish_status()
        self._publish_event("maintenance_mode", {})

    def _publish_status(self):
        """Publish device status to MQTT"""
        if not self.connected:
            return

        topic = f"laundry/{self.device_id}/status"
        payload = json.dumps(asdict(self.state), default=str)
        self.mqtt_client.publish(topic, payload)

    def _publish_event(self, event_type: str, data: Dict[str, Any]):
        """Publish device event to MQTT"""
        if not self.connected:
            return

        topic = f"laundry/{self.device_id}/events"
        event = {
            "event_type": event_type,
            "timestamp": time.time(),
            "device_id": self.device_id,
            "data": data
        }
        payload = json.dumps(event)
        self.mqtt_client.publish(topic, payload)

    def _publish_error(self, error_message: str):
        """Publish error event"""
        self.state.status = DeviceStatus.ERROR
        self.state.error_code = error_message
        self._publish_status()
        self._publish_event("error", {"message": error_message})

    def _generate_sensor_reading(self) -> SensorReading:
        """Generate simulated sensor readings"""
        base_temp = 25.0
        base_humidity = 50.0

        # Adjust readings based on device state
        if self.state.status == DeviceStatus.RUNNING:
            if self.device_type == DeviceType.WASHER:
                base_temp += random.uniform(10, 30)
                base_humidity += random.uniform(20, 40)
            elif self.device_type == DeviceType.DRYER:
                base_temp += random.uniform(30, 60)
                base_humidity -= random.uniform(10, 30)

        return SensorReading(
            temperature=base_temp + random.uniform(-2, 2),
            humidity=max(0, base_humidity + random.uniform(-5, 5)),
            vibration=random.uniform(0, 1) if self.state.status == DeviceStatus.RUNNING else 0,
            water_level=random.uniform(0, 100) if self.device_type == DeviceType.WASHER else 0,
            door_status=random.choice([True, False]) if self.state.status == DeviceStatus.IDLE else False,
            timestamp=time.time()
        )

    def _sensor_loop(self):
        """Continuous sensor reading loop"""
        while self.running:
            if self.connected:
                reading = self._generate_sensor_reading()
                topic = f"laundry/{self.device_id}/sensors"
                payload = json.dumps(asdict(reading))
                self.mqtt_client.publish(topic, payload)

            time.sleep(30)  # Send sensor data every 30 seconds

    def start(self):
        """Start the device firmware"""
        print(f"Starting device firmware for {self.device_id}")

        # Connect to MQTT broker
        try:
            self.mqtt_client.username_pw_set("device", "device123")
            self.mqtt_client.connect(self.mqtt_host, self.mqtt_port, 60)
            self.mqtt_client.loop_start()
        except Exception as e:
            print(f"Failed to connect to MQTT broker: {e}")
            return

        # Start sensor thread
        self.running = True
        self.sensor_thread = threading.Thread(target=self._sensor_loop, daemon=True)
        self.sensor_thread.start()

        print(f"Device {self.device_id} firmware started")

    def stop(self):
        """Stop the device firmware"""
        print(f"Stopping device firmware for {self.device_id}")
        self.running = False

        if self.mqtt_client:
            self.mqtt_client.loop_stop()
            self.mqtt_client.disconnect()

        print(f"Device {self.device_id} firmware stopped")


def main():
    """Main function to run device firmware simulation"""
    import sys

    if len(sys.argv) < 3:
        print("Usage: python firmware_simulation.py <device_id> <device_type> [mqtt_host]")
        print("Device types: washer, dryer, dispenser")
        sys.exit(1)

    device_id = sys.argv[1]
    device_type_str = sys.argv[2].lower()
    mqtt_host = sys.argv[3] if len(sys.argv) > 3 else "localhost"

    try:
        device_type = DeviceType(device_type_str)
    except ValueError:
        print(f"Invalid device type: {device_type_str}")
        print("Valid types: washer, dryer, dispenser")
        sys.exit(1)

    # Create and start device firmware
    firmware = LaundryDeviceFirmware(device_id, device_type, mqtt_host)

    try:
        firmware.start()

        # Keep running until interrupted
        print("Device firmware running. Press Ctrl+C to stop.")
        while True:
            time.sleep(1)

    except KeyboardInterrupt:
        print("\nShutting down device firmware...")
        firmware.stop()


if __name__ == "__main__":
    main()
