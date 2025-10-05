import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bell, CheckCircle2, AlertCircle, Info, Sparkles } from "lucide-react";
import Navigation from "@/components/Navigation";

const notifications = [
  {
    id: 1,
    type: "success",
    title: "Laundry Ready for Pickup",
    message: "Your laundry from Machine A is now ready. Please collect within 2 hours.",
    time: "5 mins ago",
    read: false,
  },
  {
    id: 2,
    type: "info",
    title: "Lost Item Match Found",
    message: "AI detected a potential match for your lost black hoodie. View in Lost & Found portal.",
    time: "1 hour ago",
    read: false,
  },
  {
    id: 3,
    type: "warning",
    title: "Booking Reminder",
    message: "Your laundry slot for tomorrow at 2:00 PM has been confirmed.",
    time: "3 hours ago",
    read: true,
  },
  {
    id: 4,
    type: "success",
    title: "Payment Confirmed",
    message: "Your payment of $15.00 for laundry service has been processed successfully.",
    time: "1 day ago",
    read: true,
  },
  {
    id: 5,
    type: "info",
    title: "New Features Available",
    message: "Check out our new blockchain-verified tracking for complete transparency.",
    time: "2 days ago",
    read: true,
  },
];

const Notifications = () => {
  const getIcon = (type: string) => {
    switch (type) {
      case "success": return <CheckCircle2 className="w-5 h-5 text-secondary" />;
      case "warning": return <AlertCircle className="w-5 h-5 text-accent" />;
      case "info": return <Info className="w-5 h-5 text-primary" />;
      default: return <Bell className="w-5 h-5" />;
    }
  };

  const getBgColor = (type: string) => {
    switch (type) {
      case "success": return "bg-secondary/10";
      case "warning": return "bg-accent/10";
      case "info": return "bg-primary/10";
      default: return "bg-muted";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-hero">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold mb-2">Notifications</h1>
              <p className="text-muted-foreground">Stay updated with real-time alerts</p>
            </div>
            <Button variant="outline">
              Mark All as Read
            </Button>
          </div>

          {/* Notification Stats */}
          <div className="grid md:grid-cols-3 gap-4 mb-8">
            <Card className="p-4 shadow-card border-0">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold">2</div>
                  <div className="text-sm text-muted-foreground">Unread</div>
                </div>
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Bell className="w-6 h-6 text-primary" />
                </div>
              </div>
            </Card>

            <Card className="p-4 shadow-card border-0">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold">12</div>
                  <div className="text-sm text-muted-foreground">This Week</div>
                </div>
                <div className="w-12 h-12 rounded-lg bg-secondary/10 flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6 text-secondary" />
                </div>
              </div>
            </Card>

            <Card className="p-4 shadow-card border-0">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold">AI</div>
                  <div className="text-sm text-muted-foreground">Smart Alerts</div>
                </div>
                <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-accent" />
                </div>
              </div>
            </Card>
          </div>

          {/* Notifications List */}
          <Card className="p-6 shadow-card border-0">
            <div className="space-y-4">
              {notifications.map((notif) => (
                <div
                  key={notif.id}
                  className={`p-4 rounded-lg border transition-all hover:shadow-soft ${
                    !notif.read ? "bg-primary/5 border-primary/20" : "hover:bg-muted/50"
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-10 h-10 rounded-lg ${getBgColor(notif.type)} flex items-center justify-center flex-shrink-0`}>
                      {getIcon(notif.type)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h3 className="font-semibold">{notif.title}</h3>
                        {!notif.read && (
                          <Badge className="bg-primary text-xs">New</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {notif.message}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">{notif.time}</span>
                        {!notif.read && (
                          <Button variant="ghost" size="sm">
                            Mark as Read
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Notification Settings */}
          <Card className="p-6 shadow-card border-0 mt-6">
            <h3 className="text-xl font-semibold mb-4">Notification Preferences</h3>
            <div className="space-y-4">
              {[
                { label: "Laundry Status Updates", enabled: true },
                { label: "Lost & Found Matches", enabled: true },
                { label: "Booking Reminders", enabled: true },
                { label: "Payment Confirmations", enabled: true },
                { label: "Marketing & Updates", enabled: false },
              ].map((pref, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 rounded-lg border">
                  <span className="font-medium">{pref.label}</span>
                  <Badge variant={pref.enabled ? "default" : "outline"}>
                    {pref.enabled ? "Enabled" : "Disabled"}
                  </Badge>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Notifications;
