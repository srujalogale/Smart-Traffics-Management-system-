import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import TrafficLight from "@/components/TrafficLight";
import MapComponent from "@/components/MapComponent";
import { Play, Pause, RotateCcw, Activity, MapPin, AlertTriangle, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface EmergencyVehicle {
  id: string;
  numberPlate: string;
  route: string;
  timestamp: string;
}

const MapPage = () => {
  const location = useLocation();
  const emergencyVehicles = (location.state?.emergencyVehicles as EmergencyVehicle[]) || [];
  
  const [isRunning, setIsRunning] = useState(false);
  const [activeSignal, setActiveSignal] = useState(0); // 0: North, 1: East, 2: South, 3: West
  const [emergencyMode, setEmergencyMode] = useState(false);
  const [cycleCount, setCycleCount] = useState(0);
  const { toast } = useToast();

  // Emergency mode activation when vehicles are present
  useEffect(() => {
    if (emergencyVehicles.length > 0 && isRunning) {
      setEmergencyMode(true);
      toast({
        title: "Emergency Mode Activated",
        description: `Priority routing enabled for ${emergencyVehicles.length} emergency vehicle(s)`,
        variant: "default",
      });
    } else {
      setEmergencyMode(false);
    }
  }, [emergencyVehicles.length, isRunning, toast]);

  const handleStartSimulation = () => {
    if (!isRunning) {
      setIsRunning(true);
      setActiveSignal(0); // Start with North signal
      toast({
        title: "Traffic Simulation Started",
        description: emergencyVehicles.length > 0 
          ? "Emergency mode active - priority routing enabled" 
          : "Normal traffic signal cycling initiated",
      });
    } else {
      setIsRunning(false);
      toast({
        title: "Simulation Paused",
        description: "Traffic signal system has been paused",
      });
    }
  };

  const handleReset = () => {
    setIsRunning(false);
    setActiveSignal(0);
    setCycleCount(0);
    setEmergencyMode(false);
    toast({
      title: "System Reset",
      description: "All traffic signals reset to initial state",
    });
  };

  const handleSignalCycleComplete = () => {
    if (!emergencyMode) {
      setActiveSignal(prev => (prev + 1) % 4);
      setCycleCount(prev => prev + 1);
    }
  };

  const getSignalDirection = (index: number) => {
    const directions = ['North', 'East', 'South', 'West'];
    return directions[index];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex flex-col">
      <Navigation />
      
      <main className="flex-1 container mx-auto px-4 py-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Modern Header */}
          <div className="text-center relative">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-primary/10 rounded-3xl blur-3xl"></div>
            <div className="relative bg-card/60 backdrop-blur-sm rounded-2xl border border-border/50 p-8 shadow-2xl">
              <div className="flex justify-center mb-6">
                <div className="relative">
                  <div className="absolute inset-0 bg-primary/20 rounded-full blur-lg animate-pulse"></div>
                  <div className="relative p-4 bg-gradient-to-br from-primary/20 to-primary/10 rounded-full border border-primary/30">
                    <MapPin className="h-10 w-10 text-primary" />
                  </div>
                </div>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent mb-4">
                Smart Traffic Control Center
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                AI-powered intersection monitoring with real-time signal optimization
              </p>
              
              {emergencyMode && (
                <div className="mt-6 flex justify-center">
                  <div className="relative">
                    <div className="absolute inset-0 bg-traffic-red/30 rounded-full blur-md animate-pulse"></div>
                    <Badge className="relative bg-traffic-red text-white px-6 py-3 text-base font-semibold border border-traffic-red/50">
                      <AlertTriangle className="mr-2 h-5 w-5 animate-pulse" />
                      EMERGENCY PROTOCOL ACTIVE
                    </Badge>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Modern Control Panel */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-accent/5 rounded-2xl blur-2xl"></div>
            <Card className="relative border-0 shadow-2xl bg-card/80 backdrop-blur-md border border-border/50">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center justify-between text-xl">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Activity className="h-6 w-6 text-primary" />
                    </div>
                    <span className="bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
                      Advanced Traffic Control System
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    {emergencyVehicles.length > 0 && (
                      <div className="relative">
                        <div className="absolute inset-0 bg-traffic-red/20 rounded-lg blur-sm"></div>
                        <Badge className="relative bg-traffic-red/10 text-traffic-red border border-traffic-red/30 px-3 py-1">
                          <Users className="mr-2 h-4 w-4" />
                          {emergencyVehicles.length} Emergency Unit{emergencyVehicles.length !== 1 ? 's' : ''}
                        </Badge>
                      </div>
                    )}
                  </div>
                </CardTitle>
                <CardDescription className="text-base text-muted-foreground">
                  {emergencyMode 
                    ? "🚨 Emergency protocol engaged - Intelligent routing optimization for critical vehicles"
                    : "🤖 AI-powered signal management with adaptive timing algorithms"
                  }
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-2">
                <div className="flex items-center justify-center space-x-6">
                  <Button 
                    onClick={handleStartSimulation}
                    size="lg"
                    className={`relative overflow-hidden px-8 py-4 text-lg font-semibold transition-all duration-300 transform hover:scale-105 ${
                      isRunning 
                        ? 'bg-gradient-to-r from-traffic-amber to-traffic-amber/80 hover:from-traffic-amber/90 hover:to-traffic-amber/70 shadow-[0_8px_32px_0_rgb(245,158,11,0.4)]' 
                        : 'bg-gradient-to-r from-traffic-green to-traffic-green/80 hover:from-traffic-green/90 hover:to-traffic-green/70 shadow-[0_8px_32px_0_rgb(34,197,94,0.4)]'
                    } text-white border-0`}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
                    {isRunning ? (
                      <>
                        <Pause className="mr-3 h-6 w-6" />
                        Pause System
                      </>
                    ) : (
                      <>
                        <Play className="mr-3 h-6 w-6" />
                        Activate System
                      </>
                    )}
                  </Button>
                  
                  <Button 
                    onClick={handleReset}
                    variant="outline"
                    size="lg"
                    className="px-8 py-4 text-lg font-semibold border-2 border-border hover:border-primary/50 bg-background/80 backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:shadow-lg"
                  >
                    <RotateCcw className="mr-3 h-6 w-6" />
                    Reset System
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Enhanced Map Component */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-accent/10 rounded-2xl blur-2xl"></div>
              <Card className="relative border-0 shadow-2xl bg-card/80 backdrop-blur-md border border-border/50">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center text-xl">
                    <div className="p-2 bg-primary/10 rounded-lg mr-3">
                      <MapPin className="h-6 w-6 text-primary" />
                    </div>
                    <span className="bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
                      Live Traffic Intelligence
                    </span>
                  </CardTitle>
                  <CardDescription className="text-base">
                    Real-time intersection monitoring with AI-powered vehicle detection
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="relative rounded-xl overflow-hidden">
                    <MapComponent emergencyVehicles={emergencyVehicles} />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Advanced Traffic Signal System */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-accent/10 to-primary/10 rounded-2xl blur-2xl"></div>
              <Card className="relative border-0 shadow-2xl bg-card/80 backdrop-blur-md border border-border/50">
                <CardHeader className="pb-4">
                  <CardTitle className="text-xl">Smart Intersection Control</CardTitle>
                  <CardDescription className="text-base">
                    Adaptive signal timing with emergency vehicle priority
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="relative w-full h-[480px] bg-gradient-to-br from-muted/10 via-background/50 to-muted/20 rounded-xl overflow-hidden border border-border/30">
                    {/* Enhanced Traffic Lights */}
                    <TrafficLight
                      direction="North"
                      position="top-6 left-1/2"
                      isActive={activeSignal === 0}
                      onCycleComplete={handleSignalCycleComplete}
                      emergencyMode={emergencyMode}
                    />
                    <TrafficLight
                      direction="East"
                      position="top-1/2 right-6"
                      isActive={activeSignal === 1}
                      onCycleComplete={handleSignalCycleComplete}
                      emergencyMode={emergencyMode}
                    />
                    <TrafficLight
                      direction="South"
                      position="bottom-6 left-1/2"
                      isActive={activeSignal === 2}
                      onCycleComplete={handleSignalCycleComplete}
                      emergencyMode={emergencyMode}
                    />
                    <TrafficLight
                      direction="West"
                      position="top-1/2 left-6"
                      isActive={activeSignal === 3}
                      onCycleComplete={handleSignalCycleComplete}
                      emergencyMode={emergencyMode}
                    />

                    {/* Enhanced Central Control Hub */}
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                      <div className="relative">
                        <div className="absolute inset-0 bg-primary/20 rounded-2xl blur-lg animate-pulse"></div>
                        <div className="relative w-28 h-28 bg-gradient-to-br from-card via-card/90 to-card/80 rounded-2xl border-2 border-primary/40 flex items-center justify-center shadow-2xl backdrop-blur-sm">
                          <div className="text-center">
                            <div className="text-sm font-semibold text-muted-foreground mb-2">CONTROL HUB</div>
                            <div className={`w-4 h-4 rounded-full mx-auto transition-all duration-500 ${
                              isRunning 
                                ? 'bg-gradient-to-r from-primary to-primary/80 animate-pulse shadow-[0_0_20px_0_hsl(var(--primary)/0.6)]' 
                                : 'bg-muted-foreground'
                            }`}></div>
                            <div className="text-xs text-muted-foreground mt-1">
                              {isRunning ? 'ACTIVE' : 'STANDBY'}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Signal Connection Lines */}
                    <div className="absolute inset-0 pointer-events-none">
                      <svg className="w-full h-full">
                        <defs>
                          <linearGradient id="signalGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.3"/>
                            <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.1"/>
                          </linearGradient>
                        </defs>
                        {isRunning && (
                          <g stroke="url(#signalGradient)" strokeWidth="2" fill="none" strokeDasharray="5,5">
                            <animateTransform
                              attributeName="transform"
                              attributeType="XML"
                              type="rotate"
                              from="0 240 240"
                              to="360 240 240"
                              dur="20s"
                              repeatCount="indefinite"
                            />
                            <circle cx="50%" cy="50%" r="80" opacity="0.6"/>
                            <circle cx="50%" cy="50%" r="120" opacity="0.4"/>
                          </g>
                        )}
                      </svg>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Advanced System Analytics */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-accent/5 rounded-2xl blur-2xl"></div>
            <div className="relative grid grid-cols-2 md:grid-cols-5 gap-6">
              <Card className="border-0 shadow-xl bg-card/80 backdrop-blur-md text-center p-6 border border-border/50 hover:shadow-2xl transition-all duration-300">
                <div className="relative">
                  <div className={`text-3xl font-bold mb-3 transition-all duration-500 ${
                    isRunning 
                      ? 'text-traffic-green animate-pulse' 
                      : 'text-muted-foreground'
                  }`}>
                    {isRunning ? 'ONLINE' : 'OFFLINE'}
                  </div>
                  <div className="text-sm font-medium text-muted-foreground">System Status</div>
                  <div className={`absolute -top-2 -right-2 w-3 h-3 rounded-full ${
                    isRunning ? 'bg-traffic-green animate-pulse' : 'bg-muted-foreground'
                  }`}></div>
                </div>
              </Card>
              
              <Card className="border-0 shadow-xl bg-card/80 backdrop-blur-md text-center p-6 border border-border/50 hover:shadow-2xl transition-all duration-300">
                <div className="text-3xl font-bold text-primary mb-3 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                  {getSignalDirection(activeSignal)}
                </div>
                <div className="text-sm font-medium text-muted-foreground">Active Direction</div>
                <div className="mt-2 flex justify-center">
                  <div className="w-8 h-1 bg-gradient-to-r from-primary to-primary/50 rounded-full"></div>
                </div>
              </Card>
              
              <Card className="border-0 shadow-xl bg-card/80 backdrop-blur-md text-center p-6 border border-border/50 hover:shadow-2xl transition-all duration-300">
                <div className="text-3xl font-bold text-traffic-amber mb-3">{cycleCount}</div>
                <div className="text-sm font-medium text-muted-foreground">Completed Cycles</div>
                <div className="mt-2 text-xs text-traffic-amber/70">
                  {Math.round((cycleCount * 70) / 60)} min runtime
                </div>
              </Card>
              
              <Card className="border-0 shadow-xl bg-card/80 backdrop-blur-md text-center p-6 border border-border/50 hover:shadow-2xl transition-all duration-300">
                <div className="relative">
                  <div className="text-3xl font-bold text-traffic-red mb-3">{emergencyVehicles.length}</div>
                  <div className="text-sm font-medium text-muted-foreground">Emergency Units</div>
                  {emergencyVehicles.length > 0 && (
                    <div className="absolute -top-1 -right-1 w-2 h-2 bg-traffic-red rounded-full animate-ping"></div>
                  )}
                </div>
              </Card>
              
              <Card className="border-0 shadow-xl bg-card/80 backdrop-blur-md text-center p-6 border border-border/50 hover:shadow-2xl transition-all duration-300">
                <div className="text-3xl font-bold text-traffic-green mb-3">4</div>
                <div className="text-sm font-medium text-muted-foreground">Signal Nodes</div>
                <div className="mt-2 text-xs text-traffic-green/70">
                  100% operational
                </div>
              </Card>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default MapPage;