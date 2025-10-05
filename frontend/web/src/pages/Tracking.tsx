import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { QrCode, MapPin, Clock, CheckCircle2, Loader2 } from "lucide-react";
import Navigation from "@/components/Navigation";

const activeOrders = [
  {
    id: "LH-2025-001",
    status: "washing",
    machine: "Machine A",
    progress: 45,
    timeRemaining: "25 mins",
    location: "Floor 2, Room 201",
    qrCode: "QR-001-2025",
  },
  {
    id: "LH-2025-002", 
    status: "drying",
    machine: "Dryer B",
    progress: 70,
    timeRemaining: "10 mins",
    location: "Floor 3, Room 305",
    qrCode: "QR-002-2025",
  },
];

const orderHistory = [
  { id: "LH-2025-003", date: "Jan 4, 2025", status: "completed", items: 12 },
  { id: "LH-2025-004", date: "Jan 3, 2025", status: "completed", items: 8 },
  { id: "LH-2025-005", date: "Jan 1, 2025", status: "completed", items: 15 },
];

const Tracking = () => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "washing": return "bg-primary";
      case "drying": return "bg-accent";
      case "ready": return "bg-secondary";
      default: return "bg-muted";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "washing": return <Loader2 className="w-4 h-4 animate-spin" />;
      case "drying": return <Loader2 className="w-4 h-4 animate-spin" />;
      case "ready": return <CheckCircle2 className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-hero">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">Live Tracking</h1>
            <p className="text-muted-foreground">Real-time status updates for your laundry</p>
          </div>

          {/* Active Orders */}
          <div className="space-y-6 mb-8">
            <h2 className="text-2xl font-semibold">Active Orders</h2>
            
            {activeOrders.map((order) => (
              <Card key={order.id} className="p-6 shadow-card border-0">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-semibold">{order.id}</h3>
                      <Badge className={getStatusColor(order.status)}>
                        {getStatusIcon(order.status)}
                        <span className="ml-1 capitalize">{order.status}</span>
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {order.location}
                      </span>
                      <span>•</span>
                      <span>{order.machine}</span>
                    </div>
                  </div>
                  
                  <Button variant="outline" size="sm">
                    <QrCode className="w-4 h-4 mr-2" />
                    View QR
                  </Button>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-medium">{order.timeRemaining} remaining</span>
                  </div>
                  <Progress value={order.progress} className="h-2" />
                </div>

                <div className="mt-4 p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
                      <span className="text-sm">IoT sensors tracking in real-time</span>
                    </div>
                    <span className="text-xs text-muted-foreground">QR: {order.qrCode}</span>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Order History */}
          <div>
            <h2 className="text-2xl font-semibold mb-4">Recent History</h2>
            <Card className="p-6 shadow-card border-0">
              <div className="space-y-4">
                {orderHistory.map((order) => (
                  <div 
                    key={order.id}
                    className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center">
                        <CheckCircle2 className="w-5 h-5 text-secondary" />
                      </div>
                      <div>
                        <div className="font-medium">{order.id}</div>
                        <div className="text-sm text-muted-foreground">{order.date}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant="outline">{order.items} items</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Tracking;
