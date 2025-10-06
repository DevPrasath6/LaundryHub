import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import { Home, Calendar, Search, Bell, User, Settings, Menu, ChevronDown } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const Navigation = () => {
    const location = useLocation();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const mainNavItems = [
        { path: "/booking", label: "Book Laundry", icon: Calendar },
        { path: "/tracking", label: "Track Order", icon: Search },
        { path: "/lost-found", label: "Lost & Found", icon: Bell },
    ];

    const managementItems = [
        { path: "/admin", label: "Admin Dashboard" },
        { path: "/staff", label: "Staff Portal" },
        { path: "/analytics", label: "Analytics" },
        { path: "/payment", label: "Payment" },
    ];

    const isActive = (path: string) => location.pathname === path;

    return (
        <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container mx-auto px-4">
                <div className="flex h-16 items-center justify-between">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                        <img src="/logo.svg" alt="LaundryHub Logo" className="w-9 h-9" />
                        <span className="font-bold text-xl tracking-tight">LaundryHub</span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden lg:flex items-center gap-1">
                        <Link to="/">
                            <Button
                                variant={isActive("/") ? "default" : "ghost"}
                                size="sm"
                                className="gap-2"
                            >
                                <Home className="w-4 h-4" />
                                Home
                            </Button>
                        </Link>

                        {mainNavItems.map((item) => {
                            const Icon = item.icon;
                            return (
                                <Link key={item.path} to={item.path}>
                                    <Button
                                        variant={isActive(item.path) ? "default" : "ghost"}
                                        size="sm"
                                        className="gap-2"
                                    >
                                        <Icon className="w-4 h-4" />
                                        {item.label}
                                    </Button>
                                </Link>
                            );
                        })}

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="gap-1">
                                    <Settings className="w-4 h-4" />
                                    Management
                                    <ChevronDown className="w-3 h-3 opacity-50" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                                <DropdownMenuLabel>Management</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                {managementItems.map((item) => (
                                    <DropdownMenuItem key={item.path} asChild>
                                        <Link to={item.path} className="cursor-pointer">
                                            {item.label}
                                        </Link>
                                    </DropdownMenuItem>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>

                    {/* Desktop Profile/Notifications */}
                    <div className="hidden lg:flex items-center gap-2">
                        <Link to="/notifications">
                            <Button variant="ghost" size="sm">
                                <Bell className="w-4 h-4" />
                            </Button>
                        </Link>
                        <Link to="/profile">
                            <Button variant="ghost" size="sm">
                                <User className="w-4 h-4" />
                            </Button>
                        </Link>
                    </div>

                    {/* Mobile Menu */}
                    <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                        <SheetTrigger asChild>
                            <Button variant="ghost" size="sm" className="lg:hidden">
                                <Menu className="w-5 h-5" />
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="right">
                            <SheetHeader>
                                <SheetTitle>Menu</SheetTitle>
                            </SheetHeader>
                            <div className="flex flex-col gap-2 mt-6">
                                <Link to="/" onClick={() => setMobileMenuOpen(false)}>
                                    <Button
                                        variant={isActive("/") ? "default" : "ghost"}
                                        className="w-full justify-start gap-2"
                                    >
                                        <Home className="w-4 h-4" />
                                        Home
                                    </Button>
                                </Link>

                                {mainNavItems.map((item) => {
                                    const Icon = item.icon;
                                    return (
                                        <Link key={item.path} to={item.path} onClick={() => setMobileMenuOpen(false)}>
                                            <Button
                                                variant={isActive(item.path) ? "default" : "ghost"}
                                                className="w-full justify-start gap-2"
                                            >
                                                <Icon className="w-4 h-4" />
                                                {item.label}
                                            </Button>
                                        </Link>
                                    );
                                })}

                                <div className="h-px bg-border my-4" />

                                <p className="text-sm font-semibold px-3 mb-2">Management</p>
                                {managementItems.map((item) => (
                                    <Link key={item.path} to={item.path} onClick={() => setMobileMenuOpen(false)}>
                                        <Button
                                            variant={isActive(item.path) ? "default" : "ghost"}
                                            className="w-full justify-start"
                                        >
                                            {item.label}
                                        </Button>
                                    </Link>
                                ))}

                                <div className="h-px bg-border my-4" />

                                <Link to="/notifications" onClick={() => setMobileMenuOpen(false)}>
                                    <Button variant="ghost" className="w-full justify-start gap-2">
                                        <Bell className="w-4 h-4" />
                                        Notifications
                                    </Button>
                                </Link>
                                <Link to="/profile" onClick={() => setMobileMenuOpen(false)}>
                                    <Button variant="ghost" className="w-full justify-start gap-2">
                                        <User className="w-4 h-4" />
                                        Profile
                                    </Button>
                                </Link>
                            </div>
                        </SheetContent>
                    </Sheet>
                </div>
            </div>
        </nav>
    );
};

export default Navigation;
