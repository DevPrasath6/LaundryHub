import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Calendar, Clock } from "lucide-react";
import Navigation from "@/components/Navigation";

const Analytics = () => {
  return (
    <div className="min-h-screen bg-gradient-hero">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">Analytics Dashboard</h1>
            <p className="text-muted-foreground">Real-time insights powered by ML & predictive analytics</p>
          </div>

          {/* Key Metrics */}
          <div className="grid md:grid-cols-4 gap-4 mb-8">
            <Card className="p-6 shadow-card border-0">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Total Revenue</span>
                <TrendingUp className="w-4 h-4 text-secondary" />
              </div>
              <div className="text-3xl font-bold mb-1">$12.4K</div>
              <div className="text-sm text-secondary">+18% from last week</div>
            </Card>

            <Card className="p-6 shadow-card border-0">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Orders</span>
                <TrendingUp className="w-4 h-4 text-primary" />
              </div>
              <div className="text-3xl font-bold mb-1">1,248</div>
              <div className="text-sm text-primary">+12% from last week</div>
            </Card>

            <Card className="p-6 shadow-card border-0">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Avg Duration</span>
                <Clock className="w-4 h-4 text-accent" />
              </div>
              <div className="text-3xl font-bold mb-1">42min</div>
              <div className="text-sm text-muted-foreground">-5min from avg</div>
            </Card>

            <Card className="p-6 shadow-card border-0">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Efficiency</span>
                <TrendingDown className="w-4 h-4 text-destructive" />
              </div>
              <div className="text-3xl font-bold mb-1">94%</div>
              <div className="text-sm text-destructive">-2% from last week</div>
            </Card>
          </div>

          {/* Charts Section */}
          <div className="grid lg:grid-cols-2 gap-6 mb-8">
            <Card className="p-6 shadow-card border-0">
              <h3 className="text-xl font-semibold mb-4">Usage Over Time</h3>
              <div className="h-64 flex items-end justify-between gap-2">
                {[65, 78, 45, 89, 92, 67, 85].map((height, idx) => (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                    <div 
                      className="w-full bg-gradient-primary rounded-t-lg transition-all hover:opacity-80 cursor-pointer"
                      style={{ height: `${height}%` }}
                    />
                    <span className="text-xs text-muted-foreground">
                      {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][idx]}
                    </span>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-6 shadow-card border-0">
              <h3 className="text-xl font-semibold mb-4">Peak Hours Analysis</h3>
              <div className="space-y-4">
                {[
                  { time: "8:00 AM - 10:00 AM", usage: 85, label: "Peak" },
                  { time: "10:00 AM - 12:00 PM", usage: 72, label: "High" },
                  { time: "12:00 PM - 2:00 PM", usage: 45, label: "Medium" },
                  { time: "2:00 PM - 4:00 PM", usage: 65, label: "Medium" },
                  { time: "4:00 PM - 6:00 PM", usage: 90, label: "Peak" },
                  { time: "6:00 PM - 8:00 PM", usage: 55, label: "Low" },
                ].map((slot, idx) => (
                  <div key={idx}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">{slot.time}</span>
                      <Badge variant={slot.label === "Peak" ? "default" : "outline"}>
                        {slot.label}
                      </Badge>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div 
                        className="bg-gradient-primary h-2 rounded-full transition-all"
                        style={{ width: `${slot.usage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* ML Predictions */}
          <Card className="p-6 shadow-card border-0 mb-8">
            <h3 className="text-xl font-semibold mb-4">AI Predictive Insights</h3>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-5 h-5 text-primary" />
                  <h4 className="font-semibold">Next Week Forecast</h4>
                </div>
                <p className="text-sm text-muted-foreground mb-2">
                  Expected 15% increase in demand due to upcoming exam week
                </p>
                <div className="text-2xl font-bold text-primary">+320 orders</div>
              </div>

              <div className="p-4 rounded-lg bg-secondary/5 border border-secondary/20">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-5 h-5 text-secondary" />
                  <h4 className="font-semibold">Optimal Slot</h4>
                </div>
                <p className="text-sm text-muted-foreground mb-2">
                  Best time for booking: 2:00 PM - 4:00 PM weekdays
                </p>
                <div className="text-2xl font-bold text-secondary">60% available</div>
              </div>

              <div className="p-4 rounded-lg bg-accent/5 border border-accent/20">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-5 h-5 text-accent" />
                  <h4 className="font-semibold">Resource Planning</h4>
                </div>
                <p className="text-sm text-muted-foreground mb-2">
                  Recommend adding 1 more machine for weekend demand
                </p>
                <div className="text-2xl font-bold text-accent">+25% capacity</div>
              </div>
            </div>
          </Card>

          {/* Machine Performance */}
          <Card className="p-6 shadow-card border-0">
            <h3 className="text-xl font-semibold mb-4">Machine Performance</h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { id: "A", uptime: 98, loads: 142, efficiency: 96 },
                { id: "B", uptime: 95, loads: 138, efficiency: 94 },
                { id: "C", uptime: 99, loads: 145, efficiency: 98 },
                { id: "D", uptime: 92, loads: 128, efficiency: 90 },
              ].map((machine) => (
                <div key={machine.id} className="p-4 rounded-lg border">
                  <h4 className="text-lg font-semibold mb-3">Machine {machine.id}</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Uptime</span>
                      <span className="font-medium">{machine.uptime}%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Total Loads</span>
                      <span className="font-medium">{machine.loads}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Efficiency</span>
                      <span className="font-medium">{machine.efficiency}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
