import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// Pages
import Index from "./pages/Index";
import AdminLogin from "./pages/AdminLogin";
import EmergencyVehicle from "./pages/EmergencyVehicle";
import Dashboard from "./pages/Dashboard";
import Analytics from "./pages/Analytics";
import About from "./pages/About";
import Admin from "./pages/Admin";
import MapPage from "./pages/MapPage";
import IoTMonitor from "./pages/IoTMonitor";
import NotFound from "./pages/NotFound";

// Components
import TrafficMonitor from "./components/TrafficMonitor";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Main Pages */}
          <Route path="/" element={<Index />} />
          <Route path="/admin-login" element={<AdminLogin />} />
          <Route path="/emergency-vehicle" element={<EmergencyVehicle />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/about" element={<About />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/map" element={<MapPage />} />
          <Route path="/iot-monitor" element={<IoTMonitor />} />

          {/* 🚦 New Route for YOLO Live Traffic Monitoring */}
          <Route
            path="/traffic-monitor"
            element={
              <div className="p-8 bg-gray-50 min-h-screen">
                <h1 className="text-3xl font-bold mb-6">
                  Live Traffic Monitoring
                </h1>
                <TrafficMonitor />
              </div>
            }
          />

          {/* Catch-all Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
