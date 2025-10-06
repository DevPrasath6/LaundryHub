import { Link } from "react-router-dom";
import { Mail, Phone, MapPin, Github, Twitter, Linkedin } from "lucide-react";

const Footer = () => {
    return (
        <footer className="border-t bg-card mt-auto">
            <div className="container mx-auto px-4 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {/* Brand */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
                            <img src="/logo.svg" alt="LaundryHub Logo" className="w-8 h-8" />
                            <span className="font-bold text-xl">LaundryHub</span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            AI-powered laundry management with IoT tracking and intelligent lost & found portal
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="font-semibold mb-4">Quick Links</h3>
                        <ul className="space-y-2">
                            <li>
                                <Link to="/booking" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                                    Book Laundry
                                </Link>
                            </li>
                            <li>
                                <Link to="/tracking" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                                    Track Orders
                                </Link>
                            </li>
                            <li>
                                <Link to="/lost-found" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                                    Lost & Found
                                </Link>
                            </li>
                            <li>
                                <Link to="/profile" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                                    My Profile
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Support */}
                    <div>
                        <h3 className="font-semibold mb-4">Support</h3>
                        <ul className="space-y-2">
                            <li>
                                <Link to="/notifications" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                                    Notifications
                                </Link>
                            </li>
                            <li>
                                <Link to="/admin" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                                    Admin Portal
                                </Link>
                            </li>
                            <li>
                                <Link to="/staff" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                                    Staff Portal
                                </Link>
                            </li>
                            <li>
                                <Link to="/analytics" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                                    Analytics
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h3 className="font-semibold mb-4">Contact Us</h3>
                        <ul className="space-y-3">
                            <li className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Mail className="w-4 h-4" />
                                <span>support@laundryhub.com</span>
                            </li>
                            <li className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Phone className="w-4 h-4" />
                                <span>+91 73736 17171</span>
                            </li>
                            <li className="flex items-center gap-2 text-sm text-muted-foreground">
                                <MapPin className="w-4 h-4" />
                                <span>Sri Eshwar College of Engineering</span>
                            </li>
                        </ul>

                        <div className="flex gap-3 mt-4">
                            <a href="#" className="w-8 h-8 rounded-lg bg-muted hover:bg-primary hover:text-primary-foreground flex items-center justify-center transition-colors">
                                <Twitter className="w-4 h-4" />
                            </a>
                            <a href="#" className="w-8 h-8 rounded-lg bg-muted hover:bg-primary hover:text-primary-foreground flex items-center justify-center transition-colors">
                                <Linkedin className="w-4 h-4" />
                            </a>
                            <a href="#" className="w-8 h-8 rounded-lg bg-muted hover:bg-primary hover:text-primary-foreground flex items-center justify-center transition-colors">
                                <Github className="w-4 h-4" />
                            </a>
                        </div>
                    </div>
                </div>

                <div className="border-t mt-8 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-sm text-muted-foreground">
                        © 2025 LaundryHub. All rights reserved.
                    </p>
                    <div className="flex gap-6 text-sm text-muted-foreground">
                        <a href="#" className="hover:text-primary transition-colors">Privacy Policy</a>
                        <a href="#" className="hover:text-primary transition-colors">Terms of Service</a>
                        <a href="#" className="hover:text-primary transition-colors">Cookie Policy</a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
