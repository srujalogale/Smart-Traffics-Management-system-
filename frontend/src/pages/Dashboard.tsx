import { useState, useEffect, useCallback, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Car, RotateCcw, Play, Pause, AlertTriangle, Wifi, WifiOff, Camera } from 'lucide-react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import ImprovedIntersectionViz from '@/components/ImprovedIntersectionViz';
import CorridorMap, { CorridorSignalNode } from '@/components/CorridorMap';

const FLASK_BASE = 'http://127.0.0.1:5000';

interface LaneData {
  id: number;
  vehicleCount: number;
  greenTime: number;
  currentState: 'red' | 'yellow' | 'green';
  timeRemaining: number;
  hasEmergency: boolean;
  source: 'yolo' | 'simulated';
}

const DEFAULT_LANES: LaneData[] = [
  { id: 1, vehicleCount: 0,  greenTime: 10, currentState: 'green', timeRemaining: 10, hasEmergency: false, source: 'yolo' },
  { id: 2, vehicleCount: 8,  greenTime: 16, currentState: 'red',   timeRemaining: 0,  hasEmergency: false, source: 'simulated' },
  { id: 3, vehicleCount: 14, greenTime: 28, currentState: 'red',   timeRemaining: 0,  hasEmergency: false, source: 'simulated' },
  { id: 4, vehicleCount: 6,  greenTime: 12, currentState: 'red',   timeRemaining: 0,  hasEmergency: false, source: 'simulated' },
];

const Dashboard = () => {
  const [isSimulating, setIsSimulating]   = useState(false);
  const [lanes, setLanes]                 = useState<LaneData[]>(DEFAULT_LANES);
  const [logs, setLogs]                   = useState<string[]>(['System initialized — all lanes ready']);
  const [backendOnline, setBackendOnline] = useState(false);
  const [emergencyLane, setEmergencyLane] = useState<number | null>(null);
  
  // New full corridor state from API
  const [corridorState, setCorridorState] = useState<any>(null);

  const emergencyRef = useRef(emergencyLane);
  const hasAnnouncedRef = useRef(false);
  emergencyRef.current = emergencyLane;

  const addLog = useCallback((message: string) => {
    const ts = new Date().toLocaleTimeString();
    setLogs(prev => [`[${ts}] ${message}`, ...prev.slice(0, 14)]);
  }, []);

  // ── Backend status ──────────────────────────────────────────────────────────
  useEffect(() => {
    const check = async () => {
      try {
        const res = await fetch(`${FLASK_BASE}/status`, { signal: AbortSignal.timeout(2000) });
        const wasOnline = backendOnline;
        setBackendOnline(res.ok);
        if (!wasOnline && res.ok) addLog('✅ Flask backend connected — using live YOLO data for Lane 1');
      } catch {
        if (backendOnline) addLog('⚠️ Backend offline — running in simulation mode');
        setBackendOnline(false);
      }
    };
    check();
    const id = setInterval(check, 5000);
    return () => clearInterval(id);
  }, [backendOnline, addLog]);

  // ── Fetch real vehicle counts & scheduler state from YOLO ────────────────
  useEffect(() => {
    if (!backendOnline) return;
    const fetch_data = async () => {
      try {
        const [resCount, resSched] = await Promise.all([
          fetch(`${FLASK_BASE}/count`),
          fetch(`${FLASK_BASE}/scheduler`)
        ]);
        
        const dataCount = await resCount.json();
        const dataSched = await resSched.json();
        
        setLanes(prev => prev.map(lane => {
          const laneKey = `lane${lane.id}`;
          const count = dataCount[laneKey] as number ?? lane.vehicleCount;
          const gt    = dataCount.green_times?.[laneKey] ?? Math.max(10, Math.min(60, count * 2));
          
          let currentState = 'red' as 'red' | 'yellow' | 'green';
          let timeRemaining = 0;
          
          if (dataSched.current_lane === laneKey) {
            currentState = dataSched.phase.toLowerCase() as 'red' | 'yellow' | 'green';
            timeRemaining = Math.ceil(dataSched.green_time_remaining);
          }
          
          return { 
            ...lane, 
            vehicleCount: count, 
            greenTime: gt, 
            source: 'yolo',
            currentState,
            timeRemaining
          };
        }));
      } catch { /* silent */ }
    };
    fetch_data();
    const id = setInterval(fetch_data, 1000);
    return () => clearInterval(id);
  }, [backendOnline]);

  // ── Fetch emergency state ──────────────────────────────────────────────────
  useEffect(() => {
    if (!backendOnline) return;
    const fetchEmergency = async () => {
      try {
        const res  = await fetch(`${FLASK_BASE}/emergency`);
        const data = await res.json();
        setCorridorState(data);
        if (data.detected && emergencyRef.current === null) {
          setEmergencyLane(data.start_signal || data.lane || 1);
          addLog(`🚨 Emergency detected — ${data.vehicle_type.toUpperCase()}! Creating green corridor...`);
          
          // Voice Announcement
          if (!hasAnnouncedRef.current) {
            hasAnnouncedRef.current = true;
            const utterance = new SpeechSynthesisUtterance(
              `Warning. ${data.vehicle_type.replace('_', ' ')} detected. Activating green corridor.`
            );
            utterance.rate = 1.1;
            utterance.pitch = 1.2;
            window.speechSynthesis.speak(utterance);
          }

          // Override signals: emergency lane → GREEN, others → RED
          setLanes(prev => prev.map(lane => ({
            ...lane,
            currentState:  lane.id === (data.start_signal || data.lane || 1) ? 'green' : 'red',
            timeRemaining: lane.id === (data.start_signal || data.lane || 1) ? 30 : 0,
            hasEmergency:  lane.id === (data.start_signal || data.lane || 1),
          })));
        } else if (!data.detected && emergencyRef.current !== null) {
          setEmergencyLane(null);
          hasAnnouncedRef.current = false;
          addLog('✅ Emergency cleared — resuming density-based signal control');
        }
      } catch { /* silent */ }
    };
    fetchEmergency();
    const id = setInterval(fetchEmergency, 1000);
    return () => clearInterval(id);
  }, [backendOnline, addLog]);

  // ── Corridor progress animation (fallback for offline) ───────────
  useEffect(() => {
    // Rely on backend for progress if online, else simulate here if offline
  }, []);

  // ── Signal simulation tick ─────────────────────────────────────────────────
  useEffect(() => {
    if (!isSimulating) return;
    const id = setInterval(() => {
      // Don't touch signals during emergency
      if (emergencyRef.current !== null) return;

      setLanes(prev => {
        const next = prev.map(l => ({ ...l }));
        const greenLane  = next.find(l => l.currentState === 'green');
        const yellowLane = next.find(l => l.currentState === 'yellow');

        if (greenLane) {
          if (greenLane.timeRemaining > 1) {
            greenLane.timeRemaining--;
          } else {
            greenLane.currentState  = 'yellow';
            greenLane.timeRemaining = 3;
            addLog(`Lane ${greenLane.id}: GREEN → YELLOW (clearing traffic)`);
          }
        } else if (yellowLane) {
          if (yellowLane.timeRemaining > 1) {
            yellowLane.timeRemaining--;
          } else {
            yellowLane.currentState  = 'red';
            yellowLane.timeRemaining = 0;

            // Next lane: dynamic green time from vehicle count
            const idx      = next.findIndex(l => l.id === yellowLane.id);
            const nextLane = next[(idx + 1) % next.length];
            const gt       = nextLane.greenTime;   // already calculated from vehicle count
            nextLane.currentState  = 'green';
            nextLane.timeRemaining = gt;
            addLog(`Lane ${nextLane.id}: GREEN → ${gt}s  (${nextLane.vehicleCount} vehicles × 2s formula)`);
          }
        }
        return next;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [isSimulating, addLog]);

  const resetAllLanes = () => {
    setLanes(DEFAULT_LANES);
    addLog('All lanes reset to defaults');
  };

  // ── Emergency controls ─────────────────────────────────────────────────────
  const simulateEmergency = async (laneId: number) => {
    if (backendOnline) {
      await fetch(`${FLASK_BASE}/emergency/trigger`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lane: laneId, vehicle_type: 'ambulance' }),
      });
    } else {
      // Offline: local simulation
      setEmergencyLane(laneId);
      setLanes(prev => prev.map(lane => ({
        ...lane,
        currentState:  lane.id === laneId ? 'green' : 'red',
        timeRemaining: lane.id === laneId ? 30 : 0,
        hasEmergency:  lane.id === laneId,
      })));
      addLog(`🚨 [SIMULATED] Emergency triggered on Lane ${laneId} — green corridor active`);
    }
  };

  const clearEmergency = async () => {
    if (backendOnline) {
      await fetch(`${FLASK_BASE}/emergency/clear`, { method: 'POST' });
    }
    setEmergencyLane(null);
    setCorridorState(null);
    hasAnnouncedRef.current = false;
    setLanes(prev => prev.map((l, i) => ({
      ...l,
      hasEmergency:  false,
      currentState:  i === 0 ? 'green' : 'red',
      timeRemaining: i === 0 ? l.greenTime : 0,
    })));
    addLog('Emergency cleared — normal density-based operation resumed');
  };

  const stateColor = (state: string) => {
    if (state === 'green')  return 'bg-green-500';
    if (state === 'yellow') return 'bg-yellow-400';
    return 'bg-red-500';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-accent/10">
      <Navigation />
      <div className="container mx-auto px-4 py-8">

        {/* ── Header ── */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Live Traffic Dashboard
          </h1>
          <p className="text-muted-foreground mb-4">
            Dynamic signal timing based on real vehicle density · Emergency vehicle priority system
          </p>

          {/* Backend Status + Controls */}
          <div className="flex flex-wrap justify-center items-center gap-3 mb-2">
            <Badge variant={backendOnline ? 'default' : 'secondary'} className="gap-1.5">
              {backendOnline ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
              {backendOnline ? 'YOLOv8 Live' : 'Simulation Mode'}
            </Badge>

            <Button
              onClick={() => setIsSimulating(s => !s)}
              className="bg-gradient-to-r from-primary to-secondary"
            >
              {isSimulating ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
              {isSimulating ? 'Pause' : 'Start'} Simulation
            </Button>

            <Button variant="outline" onClick={resetAllLanes}>
              <RotateCcw className="w-4 h-4 mr-2" /> Reset
            </Button>
          </div>
        </div>

        {/* ── Emergency Banner ── */}
        {emergencyLane !== null && (
          <div className="mb-6 p-4 rounded-xl border-2 border-red-500 bg-red-500/10 animate-pulse">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-7 h-7 text-red-500 shrink-0" />
                <div>
                  <h3 className="font-bold text-red-500 text-lg">🚨 EMERGENCY MODE ACTIVE</h3>
                  <p className="text-sm text-muted-foreground">
                    Green corridor initialized. Ambulance is approaching.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Button variant="destructive" size="sm" onClick={clearEmergency}>
                  Clear Emergency
                </Button>
              </div>
            </div>
          </div>
        )}
        
        {/* ── Corridor Map Component ── */}
        {corridorState && corridorState.corridor_length > 0 && (
          <div className="mb-8">
            <Card className="bg-card/50 backdrop-blur-sm border-primary/20">
              <CardContent className="pt-6">
                <CorridorMap
                  signals={Array.from({ length: corridorState.corridor_length }).map((_, i) => {
                    const id = i + 1;
                    return {
                      id,
                      isAmbulanceHere: corridorState.current_position === id,
                      isAhead: corridorState.active_greens?.includes(id) && corridorState.current_position !== id,
                      isCleared: corridorState.cleared_signals?.includes(id),
                      isNormal: !corridorState.detected || (!corridorState.active_greens?.includes(id) && !corridorState.cleared_signals?.includes(id)),
                      vehicleCount: id <= 4 ? lanes[id - 1]?.vehicleCount : Math.floor(Math.random() * 20), // Fallback for signals > 4
                      greenTime: id <= 4 ? lanes[id - 1]?.greenTime : 30, // Fallback for signals > 4
                    };
                  })}
                  emergencyActive={corridorState.detected}
                  ambulancePosition={corridorState.current_position}
                  progress={corridorState.progress_percent}
                  corridorLength={corridorState.corridor_length}
                />
              </CardContent>
            </Card>
          </div>
        )}

        {/* ── Main Grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">

          {/* Intersection Visualization */}
          <div className="lg:col-span-2">
            <Card className="bg-card/50 backdrop-blur-sm border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Car className="w-5 h-5" /> Intersection Visualization
                  {backendOnline && (
                    <Badge variant="outline" className="ml-auto gap-1 text-xs">
                      <Camera className="w-3 h-3" /> Lane 1 = Live YOLO
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ImprovedIntersectionViz lanes={lanes} />
              </CardContent>
            </Card>
          </div>

          {/* Control Panel */}
          <div className="space-y-5">
            <Card className="bg-card/50 backdrop-blur-sm border-primary/20">
              <CardHeader>
                <CardTitle className="text-base">Lane Control Panel</CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                {lanes.map(lane => (
                  <div key={lane.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${stateColor(lane.currentState)}`} />
                        <span className="font-semibold text-sm">Lane {lane.id}</span>
                        <Badge variant="outline" className="text-[10px] h-4">
                          {lane.source === 'yolo' ? 'YOLO' : 'SIM'}
                        </Badge>
                      </div>
                      <Badge variant={lane.hasEmergency ? 'destructive' : 'outline'} className="text-xs">
                        {lane.vehicleCount} vehicles
                      </Badge>
                    </div>

                    {/* Dynamic green time display */}
                    <div className="text-xs text-muted-foreground px-1">
                      Green time: <span className="font-mono font-bold text-green-500">{lane.greenTime}s</span>
                      <span className="ml-1 opacity-60">(count × 2, clamped 10–60s)</span>
                    </div>

                    {/* Emergency button */}
                    <Button
                      size="sm"
                      variant={lane.hasEmergency ? 'destructive' : 'secondary'}
                      className="w-full text-xs"
                      onClick={() => lane.hasEmergency ? clearEmergency() : simulateEmergency(lane.id)}
                    >
                      <AlertTriangle className="w-3 h-3 mr-1" />
                      {lane.hasEmergency ? '✅ Clear Emergency' : '🚑 Simulate Emergency'}
                    </Button>

                    {/* Timer progress */}
                    {lane.currentState !== 'red' && lane.greenTime > 0 && (
                      <Progress value={(lane.timeRemaining / lane.greenTime) * 100} className="h-1.5" />
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Live Logs */}
            <Card className="bg-card/50 backdrop-blur-sm border-primary/20">
              <CardHeader>
                <CardTitle className="text-base">System Logs</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1 max-h-52 overflow-y-auto">
                  {logs.map((log, i) => (
                    <p key={i} className={`text-xs font-mono ${log.includes('🚨') ? 'text-red-500' : log.includes('✅') ? 'text-green-500' : 'text-muted-foreground'}`}>
                      {log}
                    </p>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* ── Summary Table ── */}
        <Card className="bg-card/50 backdrop-blur-sm border-primary/20">
          <CardHeader>
            <CardTitle className="text-base">Traffic Data Summary — Dynamic Signal Timing</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Lane</TableHead>
                  <TableHead>Data Source</TableHead>
                  <TableHead>Vehicle Count</TableHead>
                  <TableHead>Dynamic Green Time</TableHead>
                  <TableHead>Current Signal</TableHead>
                  <TableHead>Time Remaining</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {lanes.map(lane => (
                  <TableRow key={lane.id} className={lane.hasEmergency ? 'bg-red-500/5' : ''}>
                    <TableCell className="font-medium">Lane {lane.id}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs gap-1">
                        {lane.source === 'yolo' ? <><Camera className="w-3 h-3" /> YOLO</> : 'Simulated'}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-bold">{lane.vehicleCount}</TableCell>
                    <TableCell>
                      <span className="font-mono font-bold text-green-600">{lane.greenTime}s</span>
                    </TableCell>
                    <TableCell>
                      <Badge variant={
                        lane.currentState === 'green' ? 'default' :
                        lane.currentState === 'yellow' ? 'secondary' : 'destructive'
                      }>
                        {lane.currentState.toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {lane.currentState !== 'red' ? `${lane.timeRemaining}s` : '—'}
                    </TableCell>
                    <TableCell>
                      {lane.hasEmergency
                        ? <Badge variant="destructive">🚨 EMERGENCY</Badge>
                        : <Badge variant="outline">Normal</Badge>}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <p className="text-xs text-muted-foreground mt-3">
              ℹ️  <strong>Dynamic Green Time Formula:</strong> green_time = clamp(vehicle_count × 2, min=10s, max=60s).
              More vehicles = longer green phase = shorter average queue waiting time.
            </p>
          </CardContent>
        </Card>

      </div>
      <Footer />
    </div>
  );
};

export default Dashboard;