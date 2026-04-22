import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, Wifi, WifiOff, Camera, Car } from "lucide-react";
import Navigation from "@/components/Navigation";

const FLASK_BASE = "http://127.0.0.1:5000";

interface CountData {
  lane1: number;
  lane2: number;
  lane3: number;
  lane4: number;
  total: number;
  green_times: Record<string, number>;
}

interface EmergencyData {
  detected: boolean;
  lane: number | null;
  vehicle_type: string;
}

export default function TrafficMonitor() {
  const [backendOnline, setBackendOnline] = useState(false);
  const [count, setCount]               = useState<CountData | null>(null);
  const [emergency, setEmergency]       = useState<EmergencyData>({ detected: false, lane: null, vehicle_type: "ambulance" });
  const [imgError, setImgError]         = useState(false);

  // ── Backend status check ────────────────────────────────────────────────────
  useEffect(() => {
    const checkStatus = async () => {
      try {
        const res = await fetch(`${FLASK_BASE}/status`, { signal: AbortSignal.timeout(2000) });
        setBackendOnline(res.ok);
      } catch {
        setBackendOnline(false);
      }
    };
    checkStatus();
    const id = setInterval(checkStatus, 5000);
    return () => clearInterval(id);
  }, []);

  // ── Poll vehicle count ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!backendOnline) return;
    const fetchCount = async () => {
      try {
        const res  = await fetch(`${FLASK_BASE}/count`);
        const data = await res.json();
        setCount(data);
      } catch { /* silent */ }
    };
    fetchCount();
    const id = setInterval(fetchCount, 2000);
    return () => clearInterval(id);
  }, [backendOnline]);

  // ── Poll emergency state ────────────────────────────────────────────────────
  useEffect(() => {
    if (!backendOnline) return;
    const fetchEmergency = async () => {
      try {
        const res  = await fetch(`${FLASK_BASE}/emergency`);
        const data = await res.json();
        setEmergency(data);
      } catch { /* silent */ }
    };
    fetchEmergency();
    const id = setInterval(fetchEmergency, 1000);
    return () => clearInterval(id);
  }, [backendOnline]);

  const clearEmergency = async () => {
    try {
      await fetch(`${FLASK_BASE}/emergency/clear`, { method: "POST" });
      setEmergency({ detected: false, lane: null, vehicle_type: "ambulance" });
    } catch { /* silent */ }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-accent/10">
      <Navigation />
      <div className="flex flex-col gap-6 p-6 container mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Camera className="w-8 h-8 text-primary" />
          <div>
            <h1 className="text-2xl font-bold">Live Traffic Monitor</h1>
            <p className="text-sm text-muted-foreground">YOLOv8 Real-time Vehicle Detection — Lane 1</p>
          </div>
        </div>
        <Badge
          variant={backendOnline ? "default" : "destructive"}
          className="gap-1.5 px-3 py-1.5 text-sm"
        >
          {backendOnline ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
          {backendOnline ? "Backend Online" : "Backend Offline"}
        </Badge>
      </div>

      {/* Emergency Banner */}
      {emergency.detected && (
        <div className="flex items-center justify-between p-4 rounded-xl border-2 border-red-500 bg-red-500/10 animate-pulse">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-7 h-7 text-red-500 shrink-0" />
            <div>
              <p className="font-bold text-red-500 text-lg">
                🚨 Emergency Vehicle Detected on Lane {emergency.lane}!
              </p>
              <p className="text-sm text-muted-foreground">
                {emergency.vehicle_type.toUpperCase()} — Green corridor is active. All other lanes are BLOCKED.
              </p>
            </div>
          </div>
          <Button variant="destructive" size="sm" onClick={clearEmergency}>
            Clear Emergency
          </Button>
        </div>
      )}

      {/* Offline Notice */}
      {!backendOnline && (
        <div className="p-4 rounded-xl border border-amber-500/50 bg-amber-500/10 text-sm text-amber-600">
          <strong>Flask backend is not running.</strong> Start it with:{" "}
          <code className="bg-muted px-2 py-0.5 rounded font-mono text-xs">
            python app.py
          </code>{" "}
          inside the <code className="font-mono text-xs">Traffic-Monitoring-System</code> folder.
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Live Video Feed */}
        <Card className="xl:col-span-2 bg-card/60 backdrop-blur-sm border-primary/20 overflow-hidden">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <span className={`w-2.5 h-2.5 rounded-full ${backendOnline ? "bg-green-500 animate-pulse" : "bg-red-500"}`} />
              Live YOLO Camera Feed
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {backendOnline && !imgError ? (
              <img
                src={`${FLASK_BASE}/video_feed`}
                alt="Live YOLO traffic feed"
                className="w-full rounded-b-xl object-cover"
                style={{ maxHeight: "420px" }}
                onError={() => setImgError(true)}
              />
            ) : (
              <div className="flex items-center justify-center bg-muted/40 rounded-b-xl"
                   style={{ height: "360px" }}>
                <div className="text-center text-muted-foreground">
                  <Camera className="w-16 h-16 mx-auto mb-3 opacity-30" />
                  <p className="font-medium">
                    {backendOnline ? "Video feed unavailable" : "Start Flask backend to see live feed"}
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Lane Stats */}
        <div className="flex flex-col gap-4">
          <Card className="bg-card/60 backdrop-blur-sm border-primary/20">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Car className="w-4 h-4" />
                Vehicle Counts (Live)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {count ? (
                ['lane1', 'lane2', 'lane3', 'lane4'].map((lane, i) => {
                  const c  = count[lane as keyof CountData] as number;
                  const gt = count.green_times[lane];
                  const isReal = lane === 'lane1';
                  return (
                    <div key={lane} className="flex items-center justify-between p-3 rounded-lg bg-muted/40">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm">Lane {i + 1}</span>
                          <Badge variant="outline" className="text-[10px] h-4">
                            {isReal ? "YOLO" : "SIM"}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Green time: <span className="font-mono font-bold text-green-500">{gt}s</span>
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="text-2xl font-bold">{c}</span>
                        <p className="text-xs text-muted-foreground">vehicles</p>
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  {backendOnline ? "Loading..." : "Backend offline"}
                </p>
              )}
            </CardContent>
          </Card>

          {count && (
            <Card className="bg-card/60 backdrop-blur-sm border-primary/20">
              <CardContent className="p-4 text-center">
                <p className="text-xs text-muted-foreground mb-1">Total Detected</p>
                <p className="text-4xl font-bold text-primary">{count.total}</p>
                <p className="text-xs text-muted-foreground mt-1">vehicles across all lanes</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
    </div>
  );
}
