import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CreditCard, Wallet, Smartphone, History } from "lucide-react";
import Navigation from "@/components/Navigation";
import { toast } from "sonner";

const Payment = () => {
  const [selectedMethod, setSelectedMethod] = useState<string>("card");

  const handlePayment = () => {
    toast.success("Payment processed successfully!");
  };

  return (
    <div className="min-h-screen bg-gradient-hero">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">Payment</h1>
            <p className="text-muted-foreground">Secure payment processing with blockchain verification</p>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Payment Methods */}
            <div className="lg:col-span-2 space-y-6">
              <Card className="p-6 shadow-card border-0">
                <h2 className="text-2xl font-semibold mb-4">Payment Method</h2>
                
                <div className="space-y-3 mb-6">
                  <div 
                    onClick={() => setSelectedMethod("card")}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      selectedMethod === "card" ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg bg-gradient-primary flex items-center justify-center">
                        <CreditCard className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold">Credit/Debit Card</div>
                        <div className="text-sm text-muted-foreground">Visa, Mastercard, Amex</div>
                      </div>
                      {selectedMethod === "card" && <Badge>Selected</Badge>}
                    </div>
                  </div>

                  <div 
                    onClick={() => setSelectedMethod("wallet")}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      selectedMethod === "wallet" ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg bg-gradient-secondary flex items-center justify-center">
                        <Wallet className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold">Digital Wallet</div>
                        <div className="text-sm text-muted-foreground">Balance: $45.00</div>
                      </div>
                      {selectedMethod === "wallet" && <Badge className="bg-secondary">Selected</Badge>}
                    </div>
                  </div>

                  <div 
                    onClick={() => setSelectedMethod("upi")}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      selectedMethod === "upi" ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg bg-accent flex items-center justify-center">
                        <Smartphone className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold">UPI / Mobile Payment</div>
                        <div className="text-sm text-muted-foreground">PhonePe, Google Pay</div>
                      </div>
                      {selectedMethod === "upi" && <Badge variant="outline">Selected</Badge>}
                    </div>
                  </div>
                </div>

                {/* Card Details Form */}
                {selectedMethod === "card" && (
                  <div className="space-y-4 pt-4 border-t">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Card Number</label>
                      <Input placeholder="1234 5678 9012 3456" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium mb-2 block">Expiry Date</label>
                        <Input placeholder="MM/YY" />
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-2 block">CVV</label>
                        <Input type="password" placeholder="123" />
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Cardholder Name</label>
                      <Input placeholder="John Doe" />
                    </div>
                  </div>
                )}
              </Card>

              {/* Blockchain Verification */}
              <Card className="p-6 shadow-card border-0 bg-gradient-primary text-white">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center flex-shrink-0">
                    🔐
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Blockchain Secured</h3>
                    <p className="text-sm opacity-90">
                      This transaction will be recorded on the blockchain for complete transparency and security.
                      View transaction history anytime.
                    </p>
                  </div>
                </div>
              </Card>
            </div>

            {/* Order Summary */}
            <div className="space-y-6">
              <Card className="p-6 shadow-card border-0">
                <h3 className="text-xl font-semibold mb-4">Order Summary</h3>
                
                <div className="space-y-3 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Laundry Service</span>
                    <span className="font-medium">$12.00</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Express Processing</span>
                    <span className="font-medium">$3.00</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Service Fee</span>
                    <span className="font-medium">$1.00</span>
                  </div>
                  <div className="border-t pt-3 flex justify-between">
                    <span className="font-semibold">Total</span>
                    <span className="text-2xl font-bold">$16.00</span>
                  </div>
                </div>

                <Button onClick={handlePayment} className="w-full bg-gradient-primary">
                  Pay Now
                </Button>

                <p className="text-xs text-center text-muted-foreground mt-4">
                  By confirming payment, you agree to our terms and conditions
                </p>
              </Card>

              {/* Payment History */}
              <Card className="p-6 shadow-card border-0">
                <div className="flex items-center gap-2 mb-4">
                  <History className="w-5 h-5" />
                  <h3 className="text-lg font-semibold">Recent Payments</h3>
                </div>
                <div className="space-y-3">
                  {[
                    { date: "Jan 4, 2025", amount: "$15.00", status: "completed" },
                    { date: "Jan 2, 2025", amount: "$12.00", status: "completed" },
                    { date: "Dec 30, 2024", amount: "$18.00", status: "completed" },
                  ].map((payment, idx) => (
                    <div key={idx} className="flex items-center justify-between text-sm pb-3 border-b last:border-0">
                      <div>
                        <div className="font-medium">{payment.amount}</div>
                        <div className="text-xs text-muted-foreground">{payment.date}</div>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {payment.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Payment;
