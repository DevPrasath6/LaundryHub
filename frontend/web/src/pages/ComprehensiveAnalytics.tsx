import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
    TrendingUp,
    TrendingDown,
    Calendar,
    Clock,
    DollarSign,
    Users,
    Activity,
    Zap,
    AlertTriangle,
    CheckCircle2,
    BarChart3,
    PieChart,
    LineChart,
    RefreshCw,
    Download,
    Filter
} from "lucide-react";
import Navigation from "@/components/Navigation";

interface MetricCard {
    title: string;
    value: string;
    change: string;
    changeType: 'positive' | 'negative' | 'neutral';
    icon: React.ReactNode;
}

interface MachineStatus {
    id: string;
    name: string;
    status: 'available' | 'in-use' | 'maintenance' | 'offline';
    utilization: number;
    revenue: number;
    cycles: number;
}

interface DemandForecast {
    hour: number;
    predicted: number;
    actual?: number;
    confidence: number;
}

const ComprehensiveAnalytics = () => {
    const [timeRange, setTimeRange] = useState('7d');
    const [selectedMetric, setSelectedMetric] = useState('revenue');
    const [isLoading, setIsLoading] = useState(false);
    const [lastUpdated, setLastUpdated] = useState(new Date());

    // Mock data - replace with actual API calls
    const keyMetrics: MetricCard[] = [
        {
            title: 'Total Revenue',
            value: '$24,847',
            change: '+18.2%',
            changeType: 'positive',
            icon: <DollarSign className="w-5 h-5" />
        },
        {
            title: 'Active Users',
            value: '1,247',
            change: '+12.5%',
            changeType: 'positive',
            icon: <Users className="w-5 h-5" />
        },
        {
            title: 'Machine Utilization',
            value: '78.4%',
            change: '-2.1%',
            changeType: 'negative',
            icon: <Activity className="w-5 h-5" />
        },
        {
            title: 'Avg Cycle Time',
            value: '42 min',
            change: '-5 min',
            changeType: 'positive',
            icon: <Clock className="w-5 h-5" />
        },
        {
            title: 'Energy Efficiency',
            value: '92.1%',
            change: '+3.2%',
            changeType: 'positive',
            icon: <Zap className="w-5 h-5" />
        },
        {
            title: 'Customer Satisfaction',
            value: '4.7/5',
            change: '+0.2',
            changeType: 'positive',
            icon: <CheckCircle2 className="w-5 h-5" />
        }
    ];

    const machineStatus: MachineStatus[] = [
        { id: 'W001', name: 'Washer A1', status: 'in-use', utilization: 85, revenue: 247, cycles: 12 },
        { id: 'W002', name: 'Washer A2', status: 'available', utilization: 67, revenue: 189, cycles: 9 },
        { id: 'D001', name: 'Dryer B1', status: 'in-use', utilization: 92, revenue: 312, cycles: 15 },
        { id: 'D002', name: 'Dryer B2', status: 'maintenance', utilization: 0, revenue: 0, cycles: 0 },
        { id: 'W003', name: 'Washer C1', status: 'available', utilization: 73, revenue: 198, cycles: 10 },
        { id: 'D003', name: 'Dryer C1', status: 'offline', utilization: 0, revenue: 0, cycles: 0 }
    ];

    const demandForecast: DemandForecast[] = [
        { hour: 6, predicted: 2, actual: 3, confidence: 0.8 },
        { hour: 7, predicted: 5, actual: 4, confidence: 0.85 },
        { hour: 8, predicted: 12, actual: 11, confidence: 0.9 },
        { hour: 9, predicted: 18, actual: 19, confidence: 0.88 },
        { hour: 10, predicted: 15, actual: 16, confidence: 0.82 },
        { hour: 11, predicted: 8, actual: 7, confidence: 0.87 },
        { hour: 12, predicted: 22, confidence: 0.91 },
        { hour: 13, predicted: 25, confidence: 0.89 },
        { hour: 14, predicted: 20, confidence: 0.85 },
        { hour: 15, predicted: 18, confidence: 0.83 },
        { hour: 16, predicted: 24, confidence: 0.92 },
        { hour: 17, predicted: 28, confidence: 0.94 }
    ];

    const getStatusColor = (status: MachineStatus['status']) => {
        switch (status) {
            case 'available': return 'bg-green-500';
            case 'in-use': return 'bg-blue-500';
            case 'maintenance': return 'bg-yellow-500';
            case 'offline': return 'bg-red-500';
        }
    };

    const getStatusText = (status: MachineStatus['status']) => {
        switch (status) {
            case 'available': return 'Available';
            case 'in-use': return 'In Use';
            case 'maintenance': return 'Maintenance';
            case 'offline': return 'Offline';
        }
    };

    const getChangeIcon = (changeType: MetricCard['changeType']) => {
        switch (changeType) {
            case 'positive': return <TrendingUp className="w-4 h-4 text-green-600" />;
            case 'negative': return <TrendingDown className="w-4 h-4 text-red-600" />;
            default: return <Activity className="w-4 h-4 text-gray-600" />;
        }
    };

    const refreshData = async () => {
        setIsLoading(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        setLastUpdated(new Date());
        setIsLoading(false);
    };

    return (
        <div className="min-h-screen bg-background">
            <Navigation />

            <div className="container mx-auto px-4 py-8">
                <div className="max-w-7xl mx-auto">

                    {/* Header */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
                        <div>
                            <h1 className="text-4xl font-bold mb-2">Analytics Dashboard</h1>
                            <p className="text-muted-foreground">
                                Real-time insights powered by AI/ML predictive analytics
                            </p>
                            <p className="text-sm text-muted-foreground mt-1">
                                Last updated: {lastUpdated.toLocaleTimeString()}
                            </p>
                        </div>

                        <div className="flex gap-3 mt-4 sm:mt-0">
                            <Select value={timeRange} onValueChange={setTimeRange}>
                                <SelectTrigger className="w-[140px]">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="1d">Last 24 hours</SelectItem>
                                    <SelectItem value="7d">Last 7 days</SelectItem>
                                    <SelectItem value="30d">Last 30 days</SelectItem>
                                    <SelectItem value="90d">Last 3 months</SelectItem>
                                </SelectContent>
                            </Select>

                            <Button
                                variant="outline"
                                size="sm"
                                onClick={refreshData}
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <RefreshCw className="w-4 h-4 animate-spin" />
                                ) : (
                                    <RefreshCw className="w-4 h-4" />
                                )}
                            </Button>

                            <Button variant="outline" size="sm">
                                <Download className="w-4 h-4 mr-2" />
                                Export
                            </Button>
                        </div>
                    </div>

                    {/* Key Metrics Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
                        {keyMetrics.map((metric, index) => (
                            <Card key={index} className="hover:shadow-lg transition-shadow">
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="p-2 bg-primary/10 rounded-lg">
                                            {metric.icon}
                                        </div>
                                        {getChangeIcon(metric.changeType)}
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-sm text-muted-foreground">{metric.title}</p>
                                        <p className="text-2xl font-bold">{metric.value}</p>
                                        <p className={`text-sm ${metric.changeType === 'positive' ? 'text-green-600' :
                                                metric.changeType === 'negative' ? 'text-red-600' :
                                                    'text-gray-600'
                                            }`}>
                                            {metric.change} vs last period
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    <Tabs value={selectedMetric} onValueChange={setSelectedMetric} className="space-y-6">
                        <TabsList className="grid w-full grid-cols-4">
                            <TabsTrigger value="revenue">Revenue</TabsTrigger>
                            <TabsTrigger value="utilization">Utilization</TabsTrigger>
                            <TabsTrigger value="demand">Demand Forecast</TabsTrigger>
                            <TabsTrigger value="performance">Performance</TabsTrigger>
                        </TabsList>

                        {/* Revenue Tab */}
                        <TabsContent value="revenue" className="space-y-6">
                            <div className="grid lg:grid-cols-3 gap-6">
                                <Card className="lg:col-span-2">
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <BarChart3 className="w-5 h-5" />
                                            Revenue Trend
                                        </CardTitle>
                                        <CardDescription>
                                            Daily revenue with predictive forecasting
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="h-[300px] flex items-center justify-center bg-muted/20 rounded-lg">
                                            <div className="text-center">
                                                <LineChart className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
                                                <p className="text-muted-foreground">Revenue chart visualization</p>
                                                <p className="text-sm text-muted-foreground">Chart.js or Recharts integration</p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                <div className="space-y-4">
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="text-lg">Revenue Breakdown</CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm">Wash Cycles</span>
                                                <span className="font-semibold">$18,247 (73%)</span>
                                            </div>
                                            <Progress value={73} className="h-2" />

                                            <div className="flex justify-between items-center">
                                                <span className="text-sm">Dry Cycles</span>
                                                <span className="font-semibold">$4,892 (20%)</span>
                                            </div>
                                            <Progress value={20} className="h-2" />

                                            <div className="flex justify-between items-center">
                                                <span className="text-sm">Premium Services</span>
                                                <span className="font-semibold">$1,708 (7%)</span>
                                            </div>
                                            <Progress value={7} className="h-2" />
                                        </CardContent>
                                    </Card>

                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="text-lg">Top Performing Hours</CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-3">
                                            {[
                                                { time: '6:00 PM - 8:00 PM', revenue: '$3,247' },
                                                { time: '8:00 AM - 10:00 AM', revenue: '$2,891' },
                                                { time: '12:00 PM - 2:00 PM', revenue: '$2,456' }
                                            ].map((slot, index) => (
                                                <div key={index} className="flex justify-between items-center p-2 bg-muted/30 rounded">
                                                    <span className="text-sm">{slot.time}</span>
                                                    <span className="font-semibold text-green-600">{slot.revenue}</span>
                                                </div>
                                            ))}
                                        </CardContent>
                                    </Card>
                                </div>
                            </div>
                        </TabsContent>

                        {/* Utilization Tab */}
                        <TabsContent value="utilization" className="space-y-6">
                            <div className="grid lg:grid-cols-2 gap-6">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Machine Status Overview</CardTitle>
                                        <CardDescription>Real-time status of all laundry machines</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-4">
                                            {machineStatus.map((machine) => (
                                                <div key={machine.id} className="flex items-center justify-between p-3 border rounded-lg">
                                                    <div className="flex items-center gap-3">
                                                        <div className={`w-3 h-3 rounded-full ${getStatusColor(machine.status)}`} />
                                                        <div>
                                                            <p className="font-medium">{machine.name}</p>
                                                            <p className="text-sm text-muted-foreground">{machine.id}</p>
                                                        </div>
                                                    </div>

                                                    <div className="text-right">
                                                        <Badge variant={machine.status === 'available' ? 'default' :
                                                            machine.status === 'in-use' ? 'secondary' :
                                                                machine.status === 'maintenance' ? 'destructive' : 'outline'}>
                                                            {getStatusText(machine.status)}
                                                        </Badge>
                                                        <p className="text-sm text-muted-foreground mt-1">
                                                            {machine.utilization}% utilization
                                                        </p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader>
                                        <CardTitle>Utilization Heatmap</CardTitle>
                                        <CardDescription>Peak usage patterns by hour and day</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="h-[400px] flex items-center justify-center bg-muted/20 rounded-lg">
                                            <div className="text-center">
                                                <PieChart className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
                                                <p className="text-muted-foreground">Heatmap visualization</p>
                                                <p className="text-sm text-muted-foreground">D3.js or custom heatmap component</p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </TabsContent>

                        {/* Demand Forecast Tab */}
                        <TabsContent value="demand" className="space-y-6">
                            <div className="grid lg:grid-cols-3 gap-6">
                                <Card className="lg:col-span-2">
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <TrendingUp className="w-5 h-5" />
                                            AI Demand Forecasting
                                        </CardTitle>
                                        <CardDescription>
                                            ML-powered predictions for next 12 hours
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-4">
                                            {demandForecast.map((forecast) => (
                                                <div key={forecast.hour} className="flex items-center justify-between p-3 border rounded-lg">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-16 text-sm font-medium">
                                                            {forecast.hour}:00
                                                        </div>
                                                        <div className="flex-1">
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-sm">Predicted: {forecast.predicted}</span>
                                                                {forecast.actual && (
                                                                    <span className="text-sm text-muted-foreground">
                                                                        (Actual: {forecast.actual})
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <Progress value={forecast.predicted * 3} className="h-2 mt-1" />
                                                        </div>
                                                    </div>

                                                    <div className="text-right">
                                                        <Badge variant={forecast.confidence > 0.9 ? 'default' :
                                                            forecast.confidence > 0.8 ? 'secondary' : 'outline'}>
                                                            {Math.round(forecast.confidence * 100)}% confidence
                                                        </Badge>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>

                                <div className="space-y-4">
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="text-lg">Model Performance</CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <div className="flex justify-between">
                                                <span className="text-sm">Accuracy</span>
                                                <span className="font-semibold">94.2%</span>
                                            </div>
                                            <Progress value={94.2} className="h-2" />

                                            <div className="flex justify-between">
                                                <span className="text-sm">Precision</span>
                                                <span className="font-semibold">91.8%</span>
                                            </div>
                                            <Progress value={91.8} className="h-2" />

                                            <div className="flex justify-between">
                                                <span className="text-sm">Recall</span>
                                                <span className="font-semibold">89.6%</span>
                                            </div>
                                            <Progress value={89.6} className="h-2" />
                                        </CardContent>
                                    </Card>

                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="text-lg">Prediction Factors</CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-3">
                                            <div className="text-sm space-y-2">
                                                <div className="flex justify-between">
                                                    <span>Historical patterns</span>
                                                    <span className="text-muted-foreground">35%</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span>Weather conditions</span>
                                                    <span className="text-muted-foreground">25%</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span>Day of week</span>
                                                    <span className="text-muted-foreground">20%</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span>Special events</span>
                                                    <span className="text-muted-foreground">15%</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span>Other factors</span>
                                                    <span className="text-muted-foreground">5%</span>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
                            </div>
                        </TabsContent>

                        {/* Performance Tab */}
                        <TabsContent value="performance" className="space-y-6">
                            <div className="grid lg:grid-cols-2 gap-6">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>System Performance</CardTitle>
                                        <CardDescription>Key performance indicators and health metrics</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="text-center p-4 bg-muted/30 rounded-lg">
                                                <div className="text-2xl font-bold text-green-600">99.8%</div>
                                                <div className="text-sm text-muted-foreground">Uptime</div>
                                            </div>
                                            <div className="text-center p-4 bg-muted/30 rounded-lg">
                                                <div className="text-2xl font-bold text-blue-600">2.3s</div>
                                                <div className="text-sm text-muted-foreground">Avg Response</div>
                                            </div>
                                            <div className="text-center p-4 bg-muted/30 rounded-lg">
                                                <div className="text-2xl font-bold text-purple-600">0.02%</div>
                                                <div className="text-sm text-muted-foreground">Error Rate</div>
                                            </div>
                                            <div className="text-center p-4 bg-muted/30 rounded-lg">
                                                <div className="text-2xl font-bold text-orange-600">1,247</div>
                                                <div className="text-sm text-muted-foreground">Active Users</div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader>
                                        <CardTitle>Alerts & Issues</CardTitle>
                                        <CardDescription>Recent system alerts and maintenance items</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-3">
                                            {[
                                                { type: 'warning', message: 'Machine D002 requires maintenance', time: '5 min ago' },
                                                { type: 'info', message: 'Peak usage period starting', time: '15 min ago' },
                                                { type: 'error', message: 'Machine D003 offline', time: '1 hour ago' }
                                            ].map((alert, index) => (
                                                <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
                                                    {alert.type === 'error' && <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5" />}
                                                    {alert.type === 'warning' && <AlertTriangle className="w-5 h-5 text-yellow-500 mt-0.5" />}
                                                    {alert.type === 'info' && <CheckCircle2 className="w-5 h-5 text-blue-500 mt-0.5" />}
                                                    <div className="flex-1">
                                                        <p className="text-sm">{alert.message}</p>
                                                        <p className="text-xs text-muted-foreground">{alert.time}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </div>
    );
};

export default ComprehensiveAnalytics;
