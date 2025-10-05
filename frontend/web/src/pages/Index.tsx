import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Sparkles, Shirt, Search, Clock, Shield, Zap } from "lucide-react";
import { Link } from "react-router-dom";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-hero">
      {/* Hero Section */}
      <section className="container mx-auto px-4 pt-20 pb-32">
        <div className="text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full mb-6">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">Smart Hostel Management</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-primary">
            LaundryHub
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            AI-powered laundry management with IoT tracking and an intelligent lost & found portal
          </p>
          
          <div className="flex flex-wrap gap-4 justify-center">
            <Link to="/booking">
              <Button size="lg" className="bg-gradient-primary shadow-lg hover:shadow-xl transition-all">
                Book Laundry
              </Button>
            </Link>
            <Link to="/lost-found">
              <Button size="lg" variant="outline">
                Lost & Found Portal
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container mx-auto px-4 pb-20">
        <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          <Card className="p-6 shadow-card hover:shadow-lg transition-all border-0">
            <div className="w-12 h-12 rounded-lg bg-gradient-primary flex items-center justify-center mb-4">
              <Shirt className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Smart Booking</h3>
            <p className="text-muted-foreground">
              Book time slots, track machine availability, and get real-time updates via IoT sensors
            </p>
          </Card>

          <Card className="p-6 shadow-card hover:shadow-lg transition-all border-0">
            <div className="w-12 h-12 rounded-lg bg-gradient-secondary flex items-center justify-center mb-4">
              <Search className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-semibold mb-2">AI Image Matching</h3>
            <p className="text-muted-foreground">
              Upload photos of lost items and let AI find potential matches instantly
            </p>
          </Card>

          <Card className="p-6 shadow-card hover:shadow-lg transition-all border-0">
            <div className="w-12 h-12 rounded-lg bg-accent flex items-center justify-center mb-4">
              <Clock className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Live Tracking</h3>
            <p className="text-muted-foreground">
              Real-time status updates with QR codes and RFID technology
            </p>
          </Card>
        </div>
      </section>

      {/* Stats Section */}
      <section className="container mx-auto px-4 pb-20">
        <Card className="max-w-4xl mx-auto p-8 shadow-lg border-0">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-primary mb-2">99%</div>
              <div className="text-muted-foreground">Items Tracked</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-secondary mb-2">24/7</div>
              <div className="text-muted-foreground">Smart Monitoring</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-accent mb-2">5min</div>
              <div className="text-muted-foreground">Avg Response Time</div>
            </div>
          </div>
        </Card>
      </section>

      {/* Advanced Features */}
      <section className="container mx-auto px-4 pb-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Powered by Advanced Tech</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Combining AI, IoT, and blockchain for the most secure and efficient laundry system
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          <Card className="p-6 shadow-card border-0">
            <Shield className="w-8 h-8 text-primary mb-4" />
            <h3 className="text-lg font-semibold mb-2">Blockchain Verified</h3>
            <p className="text-sm text-muted-foreground">
              Immutable records and smart contracts for complete transparency
            </p>
          </Card>

          <Card className="p-6 shadow-card border-0">
            <Zap className="w-8 h-8 text-secondary mb-4" />
            <h3 className="text-lg font-semibold mb-2">Predictive Analytics</h3>
            <p className="text-sm text-muted-foreground">
              ML models forecast demand and optimize scheduling automatically
            </p>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default Index;
