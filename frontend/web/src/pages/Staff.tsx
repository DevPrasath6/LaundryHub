import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Package, AlertCircle, CheckCircle2, Clock, Users } from "lucide-react";
import Navigation from "@/components/Navigation";
import { toast } from "sonner";

const Staff = () => {
  const handleStatusUpdate = (orderId: string, newStatus: string) => {
    toast.success(`Order ${orderId} marked as ${newStatus}`);
  };

  return (
    <div className="min-h-screen bg-gradient-hero">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">Staff Portal</h1>
            <p className="text-muted-foreground">Manage laundry operations and update statuses</p>
          </div>

          {/* Quick Stats */}
          <div className="grid md:grid-cols-4 gap-4 mb-8">
            <Card className="p-4 shadow-card border-0">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold">12</div>
                  <div className="text-sm text-muted-foreground">Pending Pickup</div>
                </div>
                <Clock className="w-8 h-8 text-accent" />
              </div>
            </Card>

            <Card className="p-4 shadow-card border-0">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold">8</div>
                  <div className="text-sm text-muted-foreground">In Progress</div>
                </div>
                <Package className="w-8 h-8 text-primary" />
              </div>
            </Card>

            <Card className="p-4 shadow-card border-0">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold">5</div>
                  <div className="text-sm text-muted-foreground">Ready</div>
                </div>
                <CheckCircle2 className="w-8 h-8 text-secondary" />
              </div>
            </Card>

            <Card className="p-4 shadow-card border-0">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold">3</div>
                  <div className="text-sm text-muted-foreground">Issues</div>
                </div>
                <AlertCircle className="w-8 h-8 text-destructive" />
              </div>
            </Card>
          </div>

          {/* Main Content */}
          <Tabs defaultValue="pending" className="space-y-6">
            <TabsList>
              <TabsTrigger value="pending">Pending</TabsTrigger>
              <TabsTrigger value="processing">Processing</TabsTrigger>
              <TabsTrigger value="ready">Ready</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
            </TabsList>

            <TabsContent value="pending">
              <Card className="p-6 shadow-card border-0">
                <h3 className="text-2xl font-semibold mb-6">Pending Orders</h3>
                <div className="space-y-4">
                  {[
                    { id: "LH-001", user: "John Doe", room: "305B", items: 12, time: "10:30 AM", priority: "normal" },
                    { id: "LH-002", user: "Jane Smith", room: "201A", items: 8, time: "11:00 AM", priority: "express" },
                    { id: "LH-003", user: "Mike Johnson", room: "412C", items: 15, time: "11:30 AM", priority: "normal" },
                  ].map((order) => (
                    <div key={order.id} className="p-4 rounded-lg border hover:bg-muted/50 transition-colors">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center">
                            <Package className="w-6 h-6 text-accent" />
                          </div>
                          <div>
                            <div className="font-semibold">{order.id}</div>
                            <div className="text-sm text-muted-foreground">
                              {order.user} • Room {order.room} • {order.items} items
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge variant={order.priority === "express" ? "default" : "outline"}>
                            {order.priority}
                          </Badge>
                          <span className="text-sm text-muted-foreground">{order.time}</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          className="bg-gradient-primary"
                          onClick={() => handleStatusUpdate(order.id, "processing")}
                        >
                          Start Processing
                        </Button>
                        <Button size="sm" variant="outline">View Details</Button>
                        <Button size="sm" variant="outline">Scan QR</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="processing">
              <Card className="p-6 shadow-card border-0">
                <h3 className="text-2xl font-semibold mb-6">In Progress</h3>
                <div className="space-y-4">
                  {[
                    { id: "LH-004", user: "Sarah Wilson", machine: "A", progress: 45, remaining: "25 mins" },
                    { id: "LH-005", user: "Tom Brown", machine: "B", progress: 70, remaining: "10 mins" },
                  ].map((order) => (
                    <div key={order.id} className="p-4 rounded-lg border">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                            <Clock className="w-6 h-6 text-primary animate-pulse" />
                          </div>
                          <div>
                            <div className="font-semibold">{order.id}</div>
                            <div className="text-sm text-muted-foreground">
                              {order.user} • Machine {order.machine}
                            </div>
                          </div>
                        </div>
                        <Badge className="bg-primary">Processing</Badge>
                      </div>
                      
                      <div className="space-y-2 mb-3">
                        <div className="flex justify-between text-sm">
                          <span>Progress</span>
                          <span>{order.remaining} remaining</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div 
                            className="bg-gradient-primary h-2 rounded-full transition-all"
                            style={{ width: `${order.progress}%` }}
                          />
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          className="bg-gradient-secondary"
                          onClick={() => handleStatusUpdate(order.id, "ready")}
                        >
                          Mark as Ready
                        </Button>
                        <Button size="sm" variant="outline">Report Issue</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="ready">
              <Card className="p-6 shadow-card border-0">
                <h3 className="text-2xl font-semibold mb-6">Ready for Pickup</h3>
                <div className="space-y-4">
                  {[
                    { id: "LH-006", user: "Alice Cooper", room: "508A", readyTime: "2:30 PM" },
                    { id: "LH-007", user: "Bob Dylan", room: "302B", readyTime: "3:00 PM" },
                  ].map((order) => (
                    <div key={order.id} className="p-4 rounded-lg border hover:bg-muted/50 transition-colors">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-lg bg-secondary/10 flex items-center justify-center">
                            <CheckCircle2 className="w-6 h-6 text-secondary" />
                          </div>
                          <div>
                            <div className="font-semibold">{order.id}</div>
                            <div className="text-sm text-muted-foreground">
                              {order.user} • Room {order.room} • Ready at {order.readyTime}
                            </div>
                          </div>
                        </div>
                        <Badge className="bg-secondary">Ready</Badge>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="default"
                          onClick={() => handleStatusUpdate(order.id, "completed")}
                        >
                          Confirm Pickup
                        </Button>
                        <Button size="sm" variant="outline">Send Notification</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="completed">
              <Card className="p-6 shadow-card border-0">
                <h3 className="text-2xl font-semibold mb-6">Completed Today</h3>
                <div className="space-y-3">
                  {[
                    { id: "LH-008", user: "Emma Watson", time: "1:45 PM", items: 10 },
                    { id: "LH-009", user: "Chris Evans", time: "12:30 PM", items: 8 },
                    { id: "LH-010", user: "Ryan Reynolds", time: "11:15 AM", items: 12 },
                  ].map((order) => (
                    <div key={order.id} className="flex items-center justify-between p-3 rounded-lg border">
                      <div className="flex items-center gap-3">
                        <CheckCircle2 className="w-5 h-5 text-secondary" />
                        <div>
                          <div className="font-medium">{order.id}</div>
                          <div className="text-sm text-muted-foreground">{order.user} • {order.items} items</div>
                        </div>
                      </div>
                      <span className="text-sm text-muted-foreground">{order.time}</span>
                    </div>
                  ))}
                </div>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Staff Info */}
          <Card className="p-6 shadow-card border-0 mt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-gradient-primary flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold">Staff Member: Sarah Johnson</h3>
                <p className="text-sm text-muted-foreground">Shift: 8:00 AM - 4:00 PM • Orders handled today: 18</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Staff;
