import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, Package, AlertCircle, TrendingUp, Settings } from "lucide-react";
import Navigation from "@/components/Navigation";

const Admin = () => {
  return (
    <div className="min-h-screen bg-gradient-hero">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">Admin Dashboard</h1>
            <p className="text-muted-foreground">Manage all system operations</p>
          </div>

          {/* Stats Overview */}
          <div className="grid md:grid-cols-4 gap-4 mb-8">
            <Card className="p-6 shadow-card border-0">
              <div className="flex items-center justify-between mb-2">
                <Users className="w-8 h-8 text-primary" />
                <Badge>+12%</Badge>
              </div>
              <div className="text-3xl font-bold mb-1">248</div>
              <div className="text-sm text-muted-foreground">Active Users</div>
            </Card>

            <Card className="p-6 shadow-card border-0">
              <div className="flex items-center justify-between mb-2">
                <Package className="w-8 h-8 text-secondary" />
                <Badge className="bg-secondary">+8%</Badge>
              </div>
              <div className="text-3xl font-bold mb-1">42</div>
              <div className="text-sm text-muted-foreground">Active Orders</div>
            </Card>

            <Card className="p-6 shadow-card border-0">
              <div className="flex items-center justify-between mb-2">
                <AlertCircle className="w-8 h-8 text-accent" />
                <Badge variant="outline">3 New</Badge>
              </div>
              <div className="text-3xl font-bold mb-1">15</div>
              <div className="text-sm text-muted-foreground">Lost Items</div>
            </Card>

            <Card className="p-6 shadow-card border-0">
              <div className="flex items-center justify-between mb-2">
                <TrendingUp className="w-8 h-8 text-primary" />
                <Badge className="bg-gradient-primary">+18%</Badge>
              </div>
              <div className="text-3xl font-bold mb-1">$2.4K</div>
              <div className="text-sm text-muted-foreground">Revenue Today</div>
            </Card>
          </div>

          {/* Main Content */}
          <Tabs defaultValue="bookings" className="space-y-6">
            <TabsList>
              <TabsTrigger value="bookings">Bookings</TabsTrigger>
              <TabsTrigger value="users">Users</TabsTrigger>
              <TabsTrigger value="machines">Machines</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>

            <TabsContent value="bookings">
              <Card className="p-6 shadow-card border-0">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-semibold">All Bookings</h3>
                  <Button variant="outline">Export Data</Button>
                </div>

                <div className="space-y-3">
                  {[
                    { id: "LH-001", user: "John Doe", machine: "A", status: "active", time: "2:30 PM" },
                    { id: "LH-002", user: "Jane Smith", machine: "B", status: "active", time: "3:00 PM" },
                    { id: "LH-003", user: "Mike Johnson", machine: "C", status: "completed", time: "1:45 PM" },
                    { id: "LH-004", user: "Sarah Wilson", machine: "D", status: "pending", time: "4:00 PM" },
                  ].map((booking) => (
                    <div key={booking.id} className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-4">
                        <div>
                          <div className="font-medium">{booking.id}</div>
                          <div className="text-sm text-muted-foreground">{booking.user}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-sm">Machine {booking.machine}</span>
                        <span className="text-sm text-muted-foreground">{booking.time}</span>
                        <Badge variant={booking.status === "active" ? "default" : "outline"}>
                          {booking.status}
                        </Badge>
                        <Button size="sm" variant="ghost">Manage</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="users">
              <Card className="p-6 shadow-card border-0">
                <h3 className="text-2xl font-semibold mb-6">User Management</h3>
                <div className="space-y-3">
                  {[
                    { name: "John Doe", room: "305B", orders: 42, status: "premium" },
                    { name: "Jane Smith", room: "201A", orders: 28, status: "standard" },
                    { name: "Mike Johnson", room: "412C", orders: 15, status: "standard" },
                  ].map((user, idx) => (
                    <div key={idx} className="flex items-center justify-between p-4 rounded-lg border">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center text-white font-semibold">
                          {user.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <div className="font-medium">{user.name}</div>
                          <div className="text-sm text-muted-foreground">Room {user.room} • {user.orders} orders</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant={user.status === "premium" ? "default" : "outline"}>
                          {user.status}
                        </Badge>
                        <Button size="sm" variant="outline">View Details</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="machines">
              <Card className="p-6 shadow-card border-0">
                <h3 className="text-2xl font-semibold mb-6">Machine Status</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  {[
                    { id: "A", status: "in-use", user: "John Doe", remaining: "15 mins" },
                    { id: "B", status: "in-use", user: "Jane Smith", remaining: "25 mins" },
                    { id: "C", status: "available", user: null, remaining: null },
                    { id: "D", status: "maintenance", user: null, remaining: null },
                  ].map((machine) => (
                    <Card key={machine.id} className="p-4 border-2">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-lg font-semibold">Machine {machine.id}</h4>
                        <Badge 
                          variant={machine.status === "available" ? "default" : "outline"}
                          className={
                            machine.status === "available" ? "bg-secondary" :
                            machine.status === "maintenance" ? "bg-accent" : ""
                          }
                        >
                          {machine.status}
                        </Badge>
                      </div>
                      {machine.user && (
                        <div className="text-sm text-muted-foreground">
                          <div>User: {machine.user}</div>
                          <div>Remaining: {machine.remaining}</div>
                        </div>
                      )}
                      <Button size="sm" variant="outline" className="w-full mt-3">
                        <Settings className="w-4 h-4 mr-2" />
                        Configure
                      </Button>
                    </Card>
                  ))}
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="settings">
              <Card className="p-6 shadow-card border-0">
                <h3 className="text-2xl font-semibold mb-6">System Settings</h3>
                <div className="space-y-6">
                  <div className="p-4 rounded-lg border">
                    <h4 className="font-semibold mb-2">Booking Settings</h4>
                    <p className="text-sm text-muted-foreground mb-3">Configure slot durations and availability</p>
                    <Button variant="outline" size="sm">Configure</Button>
                  </div>
                  <div className="p-4 rounded-lg border">
                    <h4 className="font-semibold mb-2">AI & IoT Integration</h4>
                    <p className="text-sm text-muted-foreground mb-3">Manage sensor connections and AI models</p>
                    <Button variant="outline" size="sm">Manage</Button>
                  </div>
                  <div className="p-4 rounded-lg border">
                    <h4 className="font-semibold mb-2">Blockchain Settings</h4>
                    <p className="text-sm text-muted-foreground mb-3">Configure smart contracts and verification</p>
                    <Button variant="outline" size="sm">Configure</Button>
                  </div>
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Admin;
