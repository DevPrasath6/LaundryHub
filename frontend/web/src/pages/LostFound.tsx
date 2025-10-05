import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, Search, Package, CheckCircle2, XCircle } from "lucide-react";
import { toast } from "sonner";
import Navigation from "@/components/Navigation";

const lostItems = [
  { id: 1, name: "Black Hoodie", category: "Clothing", date: "2 days ago", matched: false },
  { id: 2, name: "Blue Jeans", category: "Clothing", date: "5 days ago", matched: true },
  { id: 3, name: "AirPods", category: "Electronics", date: "1 week ago", matched: false },
];

const foundItems = [
  { id: 1, name: "Red T-Shirt", category: "Clothing", location: "Machine B", date: "Today" },
  { id: 2, name: "White Sneakers", category: "Footwear", location: "Drying Area", date: "Yesterday" },
  { id: 3, name: "Black Wallet", category: "Accessories", location: "Lost & Found Desk", date: "2 days ago" },
];

const LostFound = () => {
  const [activeTab, setActiveTab] = useState("report");
  const [itemName, setItemName] = useState("");
  const [description, setDescription] = useState("");

  const handleReportLost = () => {
    if (!itemName || !description) {
      toast.error("Please fill in all fields");
      return;
    }
    toast.success("Lost item reported! We'll notify you if we find a match.");
    setItemName("");
    setDescription("");
  };

  const handleReportFound = () => {
    if (!itemName || !description) {
      toast.error("Please fill in all fields");
      return;
    }
    toast.success("Found item registered! AI is searching for potential owners.");
    setItemName("");
    setDescription("");
  };

  return (
    <div className="min-h-screen bg-gradient-hero">
      <Navigation />
      <div className="container mx-auto px-4 py-8">

        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-2">Lost & Found Portal</h1>
            <p className="text-muted-foreground">AI-powered item matching system</p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-3">
              <TabsTrigger value="report">Report</TabsTrigger>
              <TabsTrigger value="lost">Lost Items</TabsTrigger>
              <TabsTrigger value="found">Found Items</TabsTrigger>
            </TabsList>

            {/* Report Tab */}
            <TabsContent value="report" className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                {/* Report Lost Item */}
                <Card className="p-6 shadow-card border-0">
                  <div className="flex items-center gap-2 mb-4">
                    <XCircle className="w-5 h-5 text-accent" />
                    <h2 className="text-xl font-semibold">Report Lost Item</h2>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Item Name</label>
                      <Input
                        placeholder="e.g., Black Hoodie"
                        value={itemName}
                        onChange={(e) => setItemName(e.target.value)}
                      />
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium mb-2 block">Description</label>
                      <Textarea
                        placeholder="Describe your item in detail..."
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows={4}
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 block">Upload Photo (Optional)</label>
                      <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary transition-colors cursor-pointer">
                        <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">Click to upload or drag and drop</p>
                      </div>
                    </div>

                    <Button onClick={handleReportLost} className="w-full bg-gradient-primary">
                      Report Lost Item
                    </Button>
                  </div>
                </Card>

                {/* Report Found Item */}
                <Card className="p-6 shadow-card border-0">
                  <div className="flex items-center gap-2 mb-4">
                    <CheckCircle2 className="w-5 h-5 text-secondary" />
                    <h2 className="text-xl font-semibold">Report Found Item</h2>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Item Name</label>
                      <Input
                        placeholder="e.g., Red T-Shirt"
                        value={itemName}
                        onChange={(e) => setItemName(e.target.value)}
                      />
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium mb-2 block">Description</label>
                      <Textarea
                        placeholder="Describe the found item..."
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows={4}
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 block">Upload Photo</label>
                      <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-secondary transition-colors cursor-pointer">
                        <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">AI will match with lost items</p>
                      </div>
                    </div>

                    <Button onClick={handleReportFound} className="w-full bg-gradient-secondary">
                      Register Found Item
                    </Button>
                  </div>
                </Card>
              </div>
            </TabsContent>

            {/* Lost Items Tab */}
            <TabsContent value="lost">
              <Card className="p-6 shadow-card border-0">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-semibold">Lost Items</h2>
                  <div className="relative w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input placeholder="Search lost items..." className="pl-9" />
                  </div>
                </div>

                <div className="space-y-4">
                  {lostItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-4 rounded-lg border hover:border-primary transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center">
                          <Package className="w-6 h-6 text-muted-foreground" />
                        </div>
                        <div>
                          <h3 className="font-semibold">{item.name}</h3>
                          <p className="text-sm text-muted-foreground">{item.category} • {item.date}</p>
                        </div>
                      </div>
                      {item.matched ? (
                        <Badge className="bg-secondary">Match Found</Badge>
                      ) : (
                        <Badge variant="outline">Searching...</Badge>
                      )}
                    </div>
                  ))}
                </div>
              </Card>
            </TabsContent>

            {/* Found Items Tab */}
            <TabsContent value="found">
              <Card className="p-6 shadow-card border-0">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-semibold">Found Items</h2>
                  <div className="relative w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input placeholder="Search found items..." className="pl-9" />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  {foundItems.map((item) => (
                    <div
                      key={item.id}
                      className="p-4 rounded-lg border hover:border-secondary transition-colors"
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center">
                          <Package className="w-8 h-8 text-muted-foreground" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold mb-1">{item.name}</h3>
                          <p className="text-sm text-muted-foreground mb-2">{item.category}</p>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span>📍 {item.location}</span>
                            <span>🕐 {item.date}</span>
                          </div>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" className="w-full mt-4">
                        Claim Item
                      </Button>
                    </div>
                  ))}
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default LostFound;
