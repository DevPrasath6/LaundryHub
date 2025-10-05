import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { Clock, CheckCircle2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import Navigation from "@/components/Navigation";

const timeSlots = [
  { time: "08:00 AM", available: true },
  { time: "10:00 AM", available: true },
  { time: "12:00 PM", available: false },
  { time: "02:00 PM", available: true },
  { time: "04:00 PM", available: true },
  { time: "06:00 PM", available: false },
  { time: "08:00 PM", available: true },
];

const machines = [
  { id: 1, name: "Machine A", status: "available", nextAvailable: null },
  { id: 2, name: "Machine B", status: "in-use", nextAvailable: "5 mins" },
  { id: 3, name: "Machine C", status: "available", nextAvailable: null },
  { id: 4, name: "Machine D", status: "in-use", nextAvailable: "15 mins" },
];

const Booking = () => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [selectedMachine, setSelectedMachine] = useState<number | null>(null);

  const handleBooking = () => {
    if (!date || !selectedTime || !selectedMachine) {
      toast.error("Please select date, time, and machine");
      return;
    }

    toast.success("Booking confirmed! You'll receive a QR code shortly.");
  };

  return (
    <div className="min-h-screen bg-gradient-hero">
      <Navigation />
      <div className="container mx-auto px-4 py-8">

        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-2">Book Your Laundry Slot</h1>
            <p className="text-muted-foreground">Select date, time, and machine for your laundry</p>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Calendar & Time Selection */}
            <Card className="p-6 shadow-card border-0">
              <h2 className="text-xl font-semibold mb-4">Select Date & Time</h2>
              
              <div className="mb-6">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  className="rounded-lg border shadow-soft"
                />
              </div>

              <div>
                <h3 className="text-sm font-medium mb-3">Available Time Slots</h3>
                <div className="grid grid-cols-2 gap-2">
                  {timeSlots.map((slot) => (
                    <Button
                      key={slot.time}
                      variant={selectedTime === slot.time ? "default" : "outline"}
                      disabled={!slot.available}
                      onClick={() => setSelectedTime(slot.time)}
                      className="w-full"
                    >
                      <Clock className="w-4 h-4 mr-2" />
                      {slot.time}
                    </Button>
                  ))}
                </div>
              </div>
            </Card>

            {/* Machine Selection */}
            <div className="space-y-6">
              <Card className="p-6 shadow-card border-0">
                <h2 className="text-xl font-semibold mb-4">Select Machine</h2>
                <div className="space-y-3">
                  {machines.map((machine) => (
                    <div
                      key={machine.id}
                      onClick={() => machine.status === "available" && setSelectedMachine(machine.id)}
                      className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        selectedMachine === machine.id
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      } ${machine.status === "in-use" ? "opacity-50 cursor-not-allowed" : ""}`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-3 h-3 rounded-full ${
                            machine.status === "available" ? "bg-secondary" : "bg-accent"
                          }`} />
                          <span className="font-medium">{machine.name}</span>
                        </div>
                        {machine.status === "available" ? (
                          <Badge variant="secondary">Available</Badge>
                        ) : (
                          <Badge variant="outline">
                            <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                            {machine.nextAvailable}
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Booking Summary */}
              <Card className="p-6 shadow-card border-0 bg-gradient-primary text-white">
                <h2 className="text-xl font-semibold mb-4">Booking Summary</h2>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="opacity-90">Date:</span>
                    <span className="font-medium">{date?.toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="opacity-90">Time:</span>
                    <span className="font-medium">{selectedTime || "Not selected"}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="opacity-90">Machine:</span>
                    <span className="font-medium">
                      {selectedMachine ? `Machine ${String.fromCharCode(64 + selectedMachine)}` : "Not selected"}
                    </span>
                  </div>
                </div>
                
                <Button
                  onClick={handleBooking}
                  className="w-full mt-6 bg-white text-primary hover:bg-white/90"
                  disabled={!date || !selectedTime || !selectedMachine}
                >
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Confirm Booking
                </Button>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Booking;
