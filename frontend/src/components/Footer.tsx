import { TrafficCone } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-card border-t border-border">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="flex items-center space-x-2 mb-4 md:mb-0">
            <TrafficCone className="h-6 w-6 text-primary" />
            <span className="text-lg font-semibold text-foreground">Smart Traffic</span>
          </div>
          
          <div className="text-center md:text-right">
            <p className="text-sm text-muted-foreground">
              © 2026 Smart Traffic Management System
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Intelligent traffic control for modern cities
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;