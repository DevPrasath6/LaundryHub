import { Button } from "@/components/ui/button";
import { Home, Calendar, Search, Bell, BarChart3, CreditCard, Users, Clock } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const Navigation = () => {
  const location = useLocation();
  
  const navItems = [
    { path: "/", label: "Home", icon: Home },
    { path: "/booking", label: "Book", icon: Calendar },
    { path: "/tracking", label: "Track", icon: Clock },
    { path: "/lost-found", label: "Lost & Found", icon: Search },
    { path: "/notifications", label: "Alerts", icon: Bell },
    { path: "/profile", label: "Profile", icon: Users },
  ];

  const adminItems = [
    { path: "/admin", label: "Admin", icon: BarChart3 },
    { path: "/staff", label: "Staff", icon: Users },
    { path: "/analytics", label: "Analytics", icon: BarChart3 },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-primary" />
          <span className="font-bold text-xl">LaundryHub</span>
        </Link>

        <div className="hidden md:flex items-center gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link key={item.path} to={item.path}>
                <Button 
                  variant={isActive ? "default" : "ghost"}
                  size="sm"
                  className="gap-2"
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </Button>
              </Link>
            );
          })}
          
          <div className="w-px h-6 bg-border mx-2" />
          
          {adminItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link key={item.path} to={item.path}>
                <Button 
                  variant={isActive ? "default" : "ghost"}
                  size="sm"
                  className="gap-2"
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </Button>
              </Link>
            );
          })}
        </div>

        <Link to="/payment">
          <Button size="sm" className="bg-gradient-primary">
            <CreditCard className="w-4 h-4 mr-2" />
            Payment
          </Button>
        </Link>
      </div>
    </nav>
  );
};

export default Navigation;
