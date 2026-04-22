import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { TrafficCone, Shield, ArrowRight, Eye, Radio, CloudRain, Volume2, Cpu, Activity, Video } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-background text-foreground overflow-hidden font-sans selection:bg-primary/30">
      
      {/* Background ambient glow */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/20 blur-[120px] animate-pulse-slow"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-traffic-green/10 blur-[120px] animate-pulse-slow delay-1000"></div>
      </div>

      <div className="relative z-10">
        <Navigation />
        
        <main className="container mx-auto px-4 pt-20 pb-12">
          
          {/* ── Hero Section ── */}
          <div className="max-w-5xl mx-auto text-center mt-16 mb-32">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-muted border border-border mb-8 animate-float">
              <span className="flex h-2 w-2 rounded-full bg-traffic-green animate-pulse"></span>
              <span className="text-sm font-medium text-muted-foreground">System Online v2.0 • 6 Nodes Active</span>
            </div>
            
            <h1 className="text-6xl md:text-8xl font-extrabold tracking-tight mb-8">
              The Future of <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-blue-400 to-emerald-400">
                Urban Mobility
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-3xl mx-auto font-light leading-relaxed">
              Powered by deep learning and IoT, our smart traffic system dynamically optimizes intersections and guarantees green corridors for emergency responders.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <Link to="/dashboard">
                <Button size="lg" className="h-16 px-10 rounded-full text-lg font-semibold shadow-[0_0_40px_-10px_rgba(var(--primary),0.5)] transition-transform hover:scale-105 active:scale-95">
                  Launch Dashboard <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link to="/admin">
                <Button size="lg" variant="outline" className="h-16 px-10 rounded-full text-lg font-semibold transition-all backdrop-blur-sm">
                  <Shield className="mr-2 w-5 h-5" /> Admin Panel
                </Button>
              </Link>
            </div>
          </div>
          
          {/* ── Features Bento Grid ── */}
          <div className="max-w-6xl mx-auto mb-32">
            <h2 className="text-3xl font-bold mb-12 text-center text-foreground">Next-Gen Capabilities</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[250px]">
              
              {/* Large Box: YOLOv8 */}
              <div className="md:col-span-2 md:row-span-2 group relative overflow-hidden rounded-[2rem] bg-card/40 dark:bg-white/[0.02] border border-border hover:border-primary/50 transition-all duration-500 p-8 flex flex-col justify-end shadow-sm">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 group-hover:bg-primary/30 transition-colors duration-500"></div>
                <div className="absolute top-8 left-8 text-primary">
                  <Eye className="w-12 h-12" />
                </div>
                {/* Mock bounding box graphic */}
                <div className="absolute right-10 top-1/4 w-48 h-32 border-2 border-primary border-dashed rounded-lg flex items-start p-2 opacity-50 group-hover:opacity-100 transition-opacity">
                  <span className="bg-primary text-primary-foreground text-xs font-bold px-2 py-1 rounded">ambulance 0.98</span>
                </div>
                <h3 className="text-3xl font-bold mb-3 relative z-10">Real-Time YOLOv8 Vision</h3>
                <p className="text-muted-foreground text-lg max-w-md relative z-10">
                  Our custom-trained neural network instantly identifies emergency vehicles, bypassing traditional density logic to force immediate green light states.
                </p>
              </div>

              {/* Tall Box: Green Corridor */}
              <div className="md:row-span-2 group relative overflow-hidden rounded-[2rem] bg-card/40 dark:bg-white/[0.02] border border-border hover:border-traffic-green/50 transition-all duration-500 p-8 flex flex-col justify-end shadow-sm">
                <div className="absolute top-0 left-0 w-64 h-64 bg-traffic-green/10 rounded-full blur-[60px] -translate-y-1/2 -translate-x-1/2 group-hover:bg-traffic-green/20 transition-colors duration-500"></div>
                <div className="absolute top-8 right-8 text-traffic-green">
                  <TrafficCone className="w-10 h-10" />
                </div>
                <div className="flex flex-col gap-2 absolute top-1/3 left-8 opacity-50 group-hover:opacity-100 transition-opacity">
                  <div className="w-2 h-10 bg-traffic-green/20 rounded-full mx-auto relative"><div className="absolute top-0 left-0 w-full h-1/3 bg-traffic-green rounded-full shadow-[0_0_10px_#22c55e]"></div></div>
                  <div className="w-2 h-10 bg-traffic-green/20 rounded-full mx-auto"></div>
                  <div className="w-2 h-10 bg-traffic-green/20 rounded-full mx-auto"></div>
                </div>
                <h3 className="text-2xl font-bold mb-3 relative z-10">6-Signal Corridor</h3>
                <p className="text-muted-foreground relative z-10">
                  A multi-intersection synchronization protocol creates an uninterrupted green wave across the city.
                </p>
              </div>

              {/* Small Box: Weather */}
              <div className="group relative overflow-hidden rounded-[2rem] bg-card/40 dark:bg-white/[0.02] border border-border hover:border-blue-400/50 transition-all duration-500 p-8 flex flex-col justify-end shadow-sm">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="absolute top-6 left-6 text-blue-500">
                  <CloudRain className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold mb-2 relative z-10">Weather-Adaptive AI</h3>
                <p className="text-muted-foreground text-sm relative z-10">
                  Automatically adjusts yellow and minimum green phase timings during rain or fog to ensure safety.
                </p>
              </div>

              {/* Wide Box: Voice & IoT */}
              <div className="md:col-span-2 group relative overflow-hidden rounded-[2rem] bg-card/40 dark:bg-white/[0.02] border border-border hover:border-traffic-amber/50 transition-all duration-500 p-8 flex flex-col justify-end shadow-sm">
                <div className="absolute inset-0 bg-gradient-to-r from-traffic-amber/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="absolute top-6 right-6 text-traffic-amber flex gap-4">
                  <Volume2 className="w-8 h-8" />
                  <Radio className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold mb-2 relative z-10">Voice AI & IoT Fallback</h3>
                <p className="text-muted-foreground relative z-10 max-w-xl">
                  Real-time Text-to-Speech alerts announce emergency events instantly. If cameras fail, the system seamlessly falls back to physical NodeMCU IoT hardware.
                </p>
              </div>

            </div>
          </div>

          {/* ── System Flow Timeline ── */}
          <div className="max-w-4xl mx-auto mb-32 border border-border bg-card/40 dark:bg-white/[0.02] rounded-3xl p-12 backdrop-blur-md shadow-sm">
            <h2 className="text-2xl font-bold mb-10 text-center">How It Works in Emergencies</h2>
            <div className="flex flex-col md:flex-row justify-between items-center relative">
              <div className="hidden md:block absolute top-1/2 left-[10%] right-[10%] h-[2px] bg-border -translate-y-1/2 z-0"></div>
              
              <div className="flex flex-col items-center z-10 bg-card p-4 rounded-xl shadow-lg border border-border">
                <div className="w-16 h-16 rounded-full bg-muted border border-border flex items-center justify-center mb-4 text-primary shadow-[0_0_20px_rgba(var(--primary),0.2)]">
                  <Video className="w-8 h-8" />
                </div>
                <h4 className="font-bold">1. Detect</h4>
                <p className="text-xs text-muted-foreground text-center mt-1">YOLOv8 spots ambulance</p>
              </div>

              <div className="flex flex-col items-center z-10 bg-card p-4 rounded-xl shadow-lg border border-border my-6 md:my-0">
                <div className="w-16 h-16 rounded-full bg-muted border border-border flex items-center justify-center mb-4 text-traffic-amber shadow-[0_0_20px_rgba(245,158,11,0.2)]">
                  <Cpu className="w-8 h-8" />
                </div>
                <h4 className="font-bold">2. Process</h4>
                <p className="text-xs text-muted-foreground text-center mt-1">Flask allocates corridor</p>
              </div>

              <div className="flex flex-col items-center z-10 bg-card p-4 rounded-xl shadow-lg border border-border">
                <div className="w-16 h-16 rounded-full bg-muted border border-border flex items-center justify-center mb-4 text-traffic-green shadow-[0_0_20px_rgba(34,197,94,0.2)]">
                  <Activity className="w-8 h-8" />
                </div>
                <h4 className="font-bold">3. Execute</h4>
                <p className="text-xs text-muted-foreground text-center mt-1">Signals turn green</p>
              </div>
            </div>
          </div>
          
          {/* ── Tech Stack Marquee ── */}
          <div className="py-10 border-y border-border overflow-hidden relative mb-12">
            <div className="absolute left-0 top-0 w-32 h-full bg-gradient-to-r from-background to-transparent z-10 pointer-events-none"></div>
            <div className="absolute right-0 top-0 w-32 h-full bg-gradient-to-l from-background to-transparent z-10 pointer-events-none"></div>
            
            <div className="flex items-center space-x-16 whitespace-nowrap animate-marquee">
              {[...Array(2)].map((_, i) => (
                <div key={i} className="flex items-center space-x-16">
                  <span className="text-2xl font-black text-foreground/20 tracking-widest uppercase">React.js</span>
                  <span className="text-2xl font-black text-foreground/20 tracking-widest uppercase">Flask</span>
                  <span className="text-2xl font-black text-foreground/20 tracking-widest uppercase">YOLOv8</span>
                  <span className="text-2xl font-black text-foreground/20 tracking-widest uppercase">OpenCV</span>
                  <span className="text-2xl font-black text-foreground/20 tracking-widest uppercase">NodeMCU</span>
                  <span className="text-2xl font-black text-foreground/20 tracking-widest uppercase">Tailwind</span>
                  <span className="text-2xl font-black text-foreground/20 tracking-widest uppercase">MQTT</span>
                </div>
              ))}
            </div>
          </div>
          
        </main>
        <Footer />
      </div>
    </div>
  );
};

export default Index;