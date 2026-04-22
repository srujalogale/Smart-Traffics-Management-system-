import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Truck, Plus, Route, MapPin, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface EmergencyVehicle {
  id: string;
  numberPlate: string;
  route: string;
  timestamp: string;
}

const EmergencyVehicle = () => {
  const [vehicleNumber, setVehicleNumber] = useState("");
  const [vehicleRoute, setVehicleRoute] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [vehicles, setVehicles] = useState<EmergencyVehicle[]>([
    {
      id: "1",
      numberPlate: "EMG-001",
      route: "Route A - Main Street to Hospital",
      timestamp: new Date().toLocaleTimeString()
    }
  ]);
  const navigate = useNavigate();
  const { toast } = useToast();

  const routes = [
    "Route A - Main Street to Hospital",
    "Route B - Downtown to Fire Station", 
    "Route C - Highway 101 to Emergency Center",
    "Route D - City Center to Police Station",
    "Route E - Industrial District to Medical Center",
    "Route F - Airport to Downtown",
    "Route G - University Campus to Hospital"
  ];

  const handleAddVehicle = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!vehicleNumber || !vehicleRoute) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    // Check for duplicate number plates
    if (vehicles.some(v => v.numberPlate.toLowerCase() === vehicleNumber.toLowerCase())) {
      toast({
        title: "Duplicate Vehicle",
        description: "A vehicle with this number plate is already registered.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      const newVehicle: EmergencyVehicle = {
        id: Date.now().toString(),
        numberPlate: vehicleNumber.toUpperCase(),
        route: vehicleRoute,
        timestamp: new Date().toLocaleTimeString()
      };

      setVehicles(prev => [...prev, newVehicle]);
      setVehicleNumber("");
      setVehicleRoute("");
      setIsLoading(false);

      toast({
        title: "Emergency Vehicle Added",
        description: `Vehicle ${newVehicle.numberPlate} has been registered for ${vehicleRoute}`,
      });
    }, 800);
  };

  const handleRemoveVehicle = (id: string) => {
    setVehicles(prev => prev.filter(v => v.id !== id));
    toast({
      title: "Vehicle Removed",
      description: "Emergency vehicle has been removed from the system",
    });
  };

  const handleProceedToMap = () => {
    navigate("/map", { state: { emergencyVehicles: vehicles } });
  };

  return (
    <div className="min-h-screen bg-gradient-tech flex flex-col">
      <Navigation />
      
      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Header */}
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <div className="p-4 bg-traffic-red/10 rounded-full border border-traffic-red/20">
                <Truck className="h-12 w-12 text-traffic-red" />
              </div>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2">Emergency Vehicle Management</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Register emergency vehicles for priority traffic control and real-time route optimization
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Registration Form */}
            <Card className="border-0 shadow-xl bg-card/95 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-xl flex items-center">
                  <Plus className="mr-2 h-5 w-5 text-traffic-red" />
                  Register New Vehicle
                </CardTitle>
                <CardDescription>
                  Add emergency vehicles to receive priority traffic signal control
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                <form onSubmit={handleAddVehicle} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="vehicleNumber" className="text-sm font-medium">Vehicle Number Plate *</Label>
                    <Input
                      id="vehicleNumber"
                      type="text"
                      value={vehicleNumber}
                      onChange={(e) => setVehicleNumber(e.target.value)}
                      required
                      className="h-12 transition-all duration-200 focus:ring-2 focus:ring-traffic-red/20"
                      placeholder="e.g., EMG-001, FIRE-123, AMB-456"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="vehicleRoute" className="text-sm font-medium">Emergency Route *</Label>
                    <Select value={vehicleRoute} onValueChange={setVehicleRoute} required>
                      <SelectTrigger className="h-12">
                        <SelectValue placeholder="Select emergency route" />
                      </SelectTrigger>
                      <SelectContent>
                        {routes.map((route, index) => (
                          <SelectItem key={index} value={route}>
                            {route}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full h-12 bg-traffic-red hover:bg-traffic-red/90 text-white font-medium transition-all duration-200 transform hover:scale-105 shadow-lg"
                    disabled={isLoading}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    {isLoading ? "Registering Vehicle..." : "Register Emergency Vehicle"}
                  </Button>
                </form>
                
                {/* System Info */}
                <div className="mt-6 p-4 bg-gradient-to-br from-traffic-green/5 to-traffic-green/10 rounded-lg border border-traffic-green/20">
                  <div className="flex items-center space-x-3">
                    <Route className="h-5 w-5 text-traffic-green" />
                    <div>
                      <h4 className="font-semibold text-traffic-green text-sm">Priority System Active</h4>
                      <p className="text-xs text-muted-foreground">
                        Registered vehicles receive instant signal override and optimized routing
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Registered Vehicles Table */}
            <Card className="border-0 shadow-xl bg-card/95 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-xl flex items-center justify-between">
                  <div className="flex items-center">
                    <MapPin className="mr-2 h-5 w-5 text-primary" />
                    Active Emergency Vehicles
                  </div>
                  <span className="text-sm font-normal bg-primary/10 text-primary px-2 py-1 rounded-full">
                    {vehicles.length} registered
                  </span>
                </CardTitle>
                <CardDescription>
                  Currently registered emergency vehicles in the system
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                {vehicles.length === 0 ? (
                  <div className="text-center py-8">
                    <Truck className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground">No emergency vehicles registered</p>
                    <p className="text-sm text-muted-foreground">Add a vehicle to get started</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Number Plate</TableHead>
                          <TableHead>Route</TableHead>
                          <TableHead>Registered</TableHead>
                          <TableHead className="w-12"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {vehicles.map((vehicle) => (
                          <TableRow key={vehicle.id}>
                            <TableCell className="font-medium">{vehicle.numberPlate}</TableCell>
                            <TableCell className="text-sm">{vehicle.route}</TableCell>
                            <TableCell className="text-sm text-muted-foreground">{vehicle.timestamp}</TableCell>
                            <TableCell>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRemoveVehicle(vehicle.id)}
                                className="h-8 w-8 p-0 text-traffic-red hover:bg-traffic-red/10"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                    
                    <Button 
                      onClick={handleProceedToMap}
                      className="w-full h-12 bg-primary hover:bg-primary/90 text-white font-medium transition-all duration-200 transform hover:scale-105 shadow-lg"
                    >
                      <MapPin className="mr-2 h-4 w-4" />
                      Proceed to Traffic Map
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="p-6 bg-card rounded-xl shadow-lg border text-center">
              <div className="text-2xl font-bold text-primary mb-2">4</div>
              <div className="text-sm text-muted-foreground">Active Intersections</div>
            </div>
            <div className="p-6 bg-card rounded-xl shadow-lg border text-center">
              <div className="text-2xl font-bold text-traffic-amber mb-2">{vehicles.length}</div>
              <div className="text-sm text-muted-foreground">Registered Vehicles</div>
            </div>
            <div className="p-6 bg-card rounded-xl shadow-lg border text-center">
              <div className="text-2xl font-bold text-traffic-green mb-2">7</div>
              <div className="text-sm text-muted-foreground">Available Routes</div>
            </div>
            <div className="p-6 bg-card rounded-xl shadow-lg border text-center">
              <div className="text-2xl font-bold text-traffic-red mb-2">24/7</div>
              <div className="text-sm text-muted-foreground">Emergency Coverage</div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default EmergencyVehicle;