import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { TrafficCone, Shield, Map, Home, Cpu, Camera } from "lucide-react";
import ThemeToggle from "./ThemeToggle";
import { useEffect, useState } from "react";

const FLASK_BASE = "http://127.0.0.1:5000";

const Navigation = () => {
  const location = useLocation();
  const [backendOnline, setBackendOnline] = useState(false);

  // Ping Flask backend every 6 seconds to show status dot
  useEffect(() => {
    const check = async () => {
      try {
        const res = await fetch(`${FLASK_BASE}/status`, {
          signal: AbortSignal.timeout(2000),
        });
        setBackendOnline(res.ok);
      } catch {
        setBackendOnline(false);
      }
    };
    check();
    const id = setInterval(check, 6000);
    return () => clearInterval(id);
  }, []);

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="bg-card border-b border-border shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">

          {/* Brand */}
          <div className="flex items-center space-x-2">
            <TrafficCone className="h-7 w-7 text-primary" />
            <span className="text-lg font-bold text-foreground">Smart Traffic</span>
            {/* Backend status indicator */}
            <div className="flex items-center gap-1.5 ml-2 px-2 py-0.5 rounded-full bg-muted text-xs">
              <span
                className={`w-2 h-2 rounded-full ${
                  backendOnline ? "bg-green-500 animate-pulse" : "bg-red-400"
                }`}
              />
              <span className="text-muted-foreground hidden sm:inline">
                {backendOnline ? "YOLO Live" : "Sim Mode"}
              </span>
            </div>
          </div>

          {/* Nav Links */}
          <div className="flex items-center space-x-1">
            <Link to="/">
              <Button
                variant={isActive("/") ? "default" : "ghost"}
                size="sm"
                className="flex items-center space-x-1.5"
              >
                <Home className="h-4 w-4" />
                <span className="hidden md:inline">Home</span>
              </Button>
            </Link>

            <Link to="/dashboard">
              <Button
                variant={isActive("/dashboard") ? "default" : "ghost"}
                size="sm"
                className="flex items-center space-x-1.5"
              >
                <Shield className="h-4 w-4" />
                <span className="hidden md:inline">Dashboard</span>
              </Button>
            </Link>

            <Link to="/traffic-monitor">
              <Button
                variant={isActive("/traffic-monitor") ? "default" : "ghost"}
                size="sm"
                className="flex items-center space-x-1.5 relative"
              >
                <Camera className="h-4 w-4" />
                <span className="hidden md:inline">Live Camera</span>
                {backendOnline && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                )}
              </Button>
            </Link>

            <Link to="/analytics">
              <Button
                variant={isActive("/analytics") ? "default" : "ghost"}
                size="sm"
                className="flex items-center space-x-1.5"
              >
                <Map className="h-4 w-4" />
                <span className="hidden md:inline">Analytics</span>
              </Button>
            </Link>

            <Link to="/iot-monitor">
              <Button
                variant={isActive("/iot-monitor") ? "default" : "ghost"}
                size="sm"
                className="flex items-center space-x-1.5"
              >
                <Cpu className="h-4 w-4" />
                <span className="hidden md:inline">IoT Monitor</span>
              </Button>
            </Link>

            <Link to="/about">
              <Button
                variant={isActive("/about") ? "default" : "ghost"}
                size="sm"
                className="flex items-center space-x-1.5"
              >
                <Home className="h-4 w-4" />
                <span className="hidden md:inline">About</span>
              </Button>
            </Link>

            <Link to="/admin">
              <Button
                variant={isActive("/admin") ? "default" : "ghost"}
                size="sm"
                className="flex items-center space-x-1.5"
              >
                <Shield className="h-4 w-4" />
                <span className="hidden md:inline">Admin</span>
              </Button>
            </Link>

            <ThemeToggle />
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;