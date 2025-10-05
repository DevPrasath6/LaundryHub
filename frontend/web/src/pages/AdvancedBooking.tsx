import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Clock, CheckCircle2, Loader2, Washing, Timer, Users, MapPin, Wifi, WifiOff } from "lucide-react";
import { toast } from "sonner";
import Navigation from "@/components/Navigation";

interface Machine {
  id: string;
  name: string;
  type: 'washer' | 'dryer';
  status: 'available' | 'in-use' | 'maintenance' | 'offline';
  location: string;
  currentCycle?: {
    timeRemaining: number;
    userId: string;
  };
  isOnline: boolean;
  capacity: string;
  estimatedTime: number; // in minutes
}

interface TimeSlot {
  time: string;
  available: boolean;
  machineCount: number;
}

interface BookingFormData {
  date: Date | undefined;
  timeSlot: string;
  machineId: string;
  duration: number;
  serviceType: 'wash' | 'dry' | 'wash-dry';
  specialInstructions: string;
}

const machines: Machine[] = [
  {
    id: '1',
    name: 'Washer A1',
    type: 'washer',
    status: 'available',
    location: 'Block A - Floor 1',
    isOnline: true,
    capacity: '8kg',
    estimatedTime: 45
  },
  {
    id: '2',
    name: 'Washer A2',
    type: 'washer',
    status: 'in-use',
    location: 'Block A - Floor 1',
    currentCycle: {
      timeRemaining: 23,
      userId: 'user123'
    },
    isOnline: true,
    capacity: '8kg',
    estimatedTime: 45
  },
  {
    id: '3',
    name: 'Dryer B1',
    type: 'dryer',
    status: 'available',
    location: 'Block B - Floor 1',
    isOnline: true,
    capacity: '10kg',
    estimatedTime: 60
  },
  {
    id: '4',
    name: 'Dryer B2',
    type: 'dryer',
    status: 'maintenance',
    location: 'Block B - Floor 1',
    isOnline: false,
    capacity: '10kg',
    estimatedTime: 60
  }
];

const timeSlots: TimeSlot[] = [
  { time: "08:00", available: true, machineCount: 3 },
  { time: "10:00", available: true, machineCount: 2 },
  { time: "12:00", available: false, machineCount: 0 },
  { time: "14:00", available: true, machineCount: 4 },
  { time: "16:00", available: true, machineCount: 3 },
  { time: "18:00", available: false, machineCount: 0 },
  { time: "20:00", available: true, machineCount: 2 },
];

const AdvancedBooking = () => {
  const [formData, setFormData] = useState<BookingFormData>({
    date: new Date(),
    timeSlot: '',
    machineId: '',
    duration: 45,
    serviceType: 'wash',
    specialInstructions: ''
  });
  const [loading, setLoading] = useState(false);
  const [filteredMachines, setFilteredMachines] = useState<Machine[]>(machines);

  useEffect(() => {
    // Filter machines based on selected service type
    if (formData.serviceType === 'wash') {
      setFilteredMachines(machines.filter(m => m.type === 'washer'));
    } else if (formData.serviceType === 'dry') {
      setFilteredMachines(machines.filter(m => m.type === 'dryer'));
    } else {
      setFilteredMachines(machines);
    }
  }, [formData.serviceType]);

  const getMachineStatusColor = (status: Machine['status']) => {
    switch (status) {
      case 'available': return 'bg-green-500';
      case 'in-use': return 'bg-yellow-500';
      case 'maintenance': return 'bg-red-500';
      case 'offline': return 'bg-gray-500';
    }
  };

  const getMachineStatusText = (status: Machine['status']) => {
    switch (status) {
      case 'available': return 'Available';
      case 'in-use': return 'In Use';
      case 'maintenance': return 'Maintenance';
      case 'offline': return 'Offline';
    }
  };

  const handleBooking = async () => {
    if (!formData.date || !formData.timeSlot || !formData.machineId) {
      toast.error("Please fill in all required fields");
      return;
    }

    setLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast.success("Booking confirmed! You'll receive a QR code and confirmation email shortly.");
      
      // Reset form
      setFormData({
        date: new Date(),
        timeSlot: '',
        machineId: '',
        duration: 45,
        serviceType: 'wash',
        specialInstructions: ''
      });
      
    } catch (error) {
      toast.error("Booking failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-2">Smart Laundry Booking</h1>
            <p className="text-muted-foreground text-lg">
              Book your laundry slot with AI-powered scheduling and real-time machine monitoring
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            
            {/* Booking Form */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Service Type Selection */}
              <Card>
                <CardHeader>
                  <CardTitle>Select Service Type</CardTitle>
                  <CardDescription>Choose the type of laundry service you need</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4">
                    {['wash', 'dry', 'wash-dry'].map((type) => (
                      <Button
                        key={type}
                        variant={formData.serviceType === type ? 'default' : 'outline'}
                        className="h-20 flex flex-col gap-2"
                        onClick={() => setFormData({...formData, serviceType: type as any})}
                      >
                        <Washing className="w-6 h-6" />
                        <span className="capitalize">{type.replace('-', ' & ')}</span>
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Date and Time Selection */}
              <Card>
                <CardHeader>
                  <CardTitle>Select Date & Time</CardTitle>
                  <CardDescription>Choose your preferred date and time slot</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6">
                    
                    {/* Calendar */}
                    <div>
                      <Label>Select Date</Label>
                      <Calendar
                        mode="single"
                        selected={formData.date}
                        onSelect={(date) => setFormData({...formData, date})}
                        disabled={(date) => date < new Date() || date > new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)}
                        className="rounded-md border"
                      />
                    </div>

                    {/* Time Slots */}
                    <div>
                      <Label>Available Time Slots</Label>
                      <div className="grid grid-cols-2 gap-2 mt-3">
                        {timeSlots.map((slot) => (
                          <Button
                            key={slot.time}
                            variant={formData.timeSlot === slot.time ? 'default' : 'outline'}
                            disabled={!slot.available}
                            className="h-16 flex flex-col gap-1"
                            onClick={() => setFormData({...formData, timeSlot: slot.time})}
                          >
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              <span>{slot.time}</span>
                            </div>
                            <span className="text-xs text-muted-foreground">
                              {slot.machineCount} machines
                            </span>
                          </Button>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Machine Selection */}
              <Card>
                <CardHeader>
                  <CardTitle>Select Machine</CardTitle>
                  <CardDescription>Choose from available machines based on your service type</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-4">
                    {filteredMachines.map((machine) => (
                      <Card 
                        key={machine.id}
                        className={`cursor-pointer transition-all ${
                          formData.machineId === machine.id ? 'ring-2 ring-primary' : ''
                        } ${machine.status !== 'available' ? 'opacity-60' : ''}`}
                        onClick={() => machine.status === 'available' && setFormData({...formData, machineId: machine.id})}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h4 className="font-semibold">{machine.name}</h4>
                              <p className="text-sm text-muted-foreground flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                {machine.location}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              {machine.isOnline ? (
                                <Wifi className="w-4 h-4 text-green-500" />
                              ) : (
                                <WifiOff className="w-4 h-4 text-red-500" />
                              )}
                              <Badge 
                                variant="secondary" 
                                className={`${getMachineStatusColor(machine.status)} text-white`}
                              >
                                {getMachineStatusText(machine.status)}
                              </Badge>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-muted-foreground">Capacity:</span>
                              <span className="ml-1 font-medium">{machine.capacity}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Duration:</span>
                              <span className="ml-1 font-medium">{machine.estimatedTime} min</span>
                            </div>
                          </div>

                          {machine.currentCycle && (
                            <div className="mt-3 p-2 bg-yellow-50 rounded-md">
                              <div className="flex items-center gap-2 text-sm text-yellow-800">
                                <Timer className="w-4 h-4" />
                                <span>Available in {machine.currentCycle.timeRemaining} minutes</span>
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Additional Options */}
              <Card>
                <CardHeader>
                  <CardTitle>Additional Options</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="duration">Duration (minutes)</Label>
                      <Select value={formData.duration.toString()} onValueChange={(value) => setFormData({...formData, duration: parseInt(value)})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="30">30 minutes</SelectItem>
                          <SelectItem value="45">45 minutes</SelectItem>
                          <SelectItem value="60">1 hour</SelectItem>
                          <SelectItem value="90">1.5 hours</SelectItem>
                          <SelectItem value="120">2 hours</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="instructions">Special Instructions (Optional)</Label>
                    <Textarea
                      id="instructions"
                      placeholder="Any special care instructions for your laundry..."
                      value={formData.specialInstructions}
                      onChange={(e) => setFormData({...formData, specialInstructions: e.target.value})}
                      className="mt-1"
                    />
                  </div>

                </CardContent>
              </Card>

              {/* Book Button */}
              <Button 
                onClick={handleBooking} 
                disabled={loading || !formData.date || !formData.timeSlot || !formData.machineId}
                className="w-full h-12 text-lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Processing Booking...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-5 h-5 mr-2" />
                    Confirm Booking
                  </>
                )}
              </Button>
            </div>

            {/* Summary Sidebar */}
            <div className="space-y-6">
              
              {/* Booking Summary */}
              <Card>
                <CardHeader>
                  <CardTitle>Booking Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Service:</span>
                      <span className="font-medium capitalize">{formData.serviceType.replace('-', ' & ')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Date:</span>
                      <span className="font-medium">
                        {formData.date ? formData.date.toLocaleDateString() : 'Not selected'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Time:</span>
                      <span className="font-medium">{formData.timeSlot || 'Not selected'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Machine:</span>
                      <span className="font-medium">
                        {formData.machineId ? filteredMachines.find(m => m.id === formData.machineId)?.name : 'Not selected'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Duration:</span>
                      <span className="font-medium">{formData.duration} minutes</span>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="flex justify-between text-lg font-semibold">
                    <span>Total Cost:</span>
                    <span>$5.00</span>
                  </div>
                </CardContent>
              </Card>

              {/* Real-time Status */}
              <Card>
                <CardHeader>
                  <CardTitle>Live Machine Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {machines.slice(0, 3).map((machine) => (
                      <div key={machine.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${getMachineStatusColor(machine.status)}`} />
                          <span className="text-sm">{machine.name}</span>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {machine.currentCycle ? `${machine.currentCycle.timeRemaining}m left` : 'Available'}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdvancedBooking;