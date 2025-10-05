import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Settings, History, Award, Edit } from "lucide-react";
import Navigation from "@/components/Navigation";

const Profile = () => {
  return (
    <div className="min-h-screen bg-gradient-hero">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">My Profile</h1>
            <p className="text-muted-foreground">Manage your account and view history</p>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Profile Card */}
            <Card className="p-6 shadow-card border-0 lg:col-span-1">
              <div className="text-center">
                <div className="w-24 h-24 rounded-full bg-gradient-primary mx-auto mb-4 flex items-center justify-center">
                  <User className="w-12 h-12 text-white" />
                </div>
                <h2 className="text-2xl font-bold mb-1">John Doe</h2>
                <p className="text-muted-foreground mb-4">john.doe@hostel.edu</p>
                <Badge className="mb-4">Premium Member</Badge>
                
                <div className="space-y-3 mt-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Room</span>
                    <span className="font-medium">305B</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Member Since</span>
                    <span className="font-medium">Jan 2024</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Total Orders</span>
                    <span className="font-medium">42</span>
                  </div>
                </div>

                <Button className="w-full mt-6" variant="outline">
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Profile
                </Button>
              </div>
            </Card>

            {/* Main Content */}
            <div className="lg:col-span-2">
              <Tabs defaultValue="bookings" className="space-y-6">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="bookings">Bookings</TabsTrigger>
                  <TabsTrigger value="items">Lost Items</TabsTrigger>
                  <TabsTrigger value="settings">Settings</TabsTrigger>
                </TabsList>

                {/* Bookings Tab */}
                <TabsContent value="bookings">
                  <Card className="p-6 shadow-card border-0">
                    <div className="flex items-center gap-2 mb-6">
                      <History className="w-5 h-5" />
                      <h3 className="text-xl font-semibold">Booking History</h3>
                    </div>

                    <div className="space-y-4">
                      {[
                        { id: "LH-001", date: "Jan 5, 2025", status: "completed", machine: "A" },
                        { id: "LH-002", date: "Jan 4, 2025", status: "completed", machine: "B" },
                        { id: "LH-003", date: "Jan 3, 2025", status: "completed", machine: "C" },
                      ].map((booking) => (
                        <div 
                          key={booking.id}
                          className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                        >
                          <div>
                            <div className="font-medium">{booking.id}</div>
                            <div className="text-sm text-muted-foreground">{booking.date} • Machine {booking.machine}</div>
                          </div>
                          <Badge variant="outline" className="capitalize">{booking.status}</Badge>
                        </div>
                      ))}
                    </div>
                  </Card>
                </TabsContent>

                {/* Lost Items Tab */}
                <TabsContent value="items">
                  <Card className="p-6 shadow-card border-0">
                    <h3 className="text-xl font-semibold mb-6">My Claimed Items</h3>
                    
                    <div className="space-y-4">
                      {[
                        { name: "Blue Jeans", date: "Jan 2, 2025", status: "claimed" },
                        { name: "Red Hoodie", date: "Dec 28, 2024", status: "claimed" },
                      ].map((item, idx) => (
                        <div 
                          key={idx}
                          className="flex items-center justify-between p-4 rounded-lg border"
                        >
                          <div>
                            <div className="font-medium">{item.name}</div>
                            <div className="text-sm text-muted-foreground">Claimed on {item.date}</div>
                          </div>
                          <Badge className="bg-secondary">Verified</Badge>
                        </div>
                      ))}
                    </div>
                  </Card>
                </TabsContent>

                {/* Settings Tab */}
                <TabsContent value="settings">
                  <Card className="p-6 shadow-card border-0">
                    <div className="flex items-center gap-2 mb-6">
                      <Settings className="w-5 h-5" />
                      <h3 className="text-xl font-semibold">Account Settings</h3>
                    </div>

                    <div className="space-y-6">
                      <div>
                        <label className="text-sm font-medium mb-2 block">Full Name</label>
                        <Input defaultValue="John Doe" />
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-2 block">Email</label>
                        <Input type="email" defaultValue="john.doe@hostel.edu" />
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-2 block">Room Number</label>
                        <Input defaultValue="305B" />
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-2 block">Phone</label>
                        <Input type="tel" defaultValue="+1 (555) 123-4567" />
                      </div>

                      <Button className="w-full bg-gradient-primary">
                        Save Changes
                      </Button>
                    </div>
                  </Card>
                </TabsContent>
              </Tabs>

              {/* Achievements */}
              <Card className="p-6 shadow-card border-0 mt-6">
                <div className="flex items-center gap-2 mb-4">
                  <Award className="w-5 h-5 text-accent" />
                  <h3 className="text-xl font-semibold">Achievements</h3>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-4 rounded-lg bg-gradient-primary text-white">
                    <div className="text-2xl font-bold">42</div>
                    <div className="text-sm opacity-90">Total Orders</div>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-gradient-secondary text-white">
                    <div className="text-2xl font-bold">2</div>
                    <div className="text-sm opacity-90">Items Found</div>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-accent text-white">
                    <div className="text-2xl font-bold">98%</div>
                    <div className="text-sm opacity-90">On-Time Rate</div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
