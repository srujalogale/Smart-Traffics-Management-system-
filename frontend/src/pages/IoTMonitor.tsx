import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Wifi, WifiOff, Radio, AlertTriangle, Activity, Cpu, Zap, Play, Pause, RotateCcw } from 'lucide-react';
import { Link } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';

interface SignalData {
  id: number;
  name: string;
  state: 'RED' | 'YELLOW' | 'GREEN';
  mode: 'normal' | 'emergency';
  vehicleCount: number;
  greenDuration: number;
  timeRemaining: number;
  connected: boolean;
  lastUpdate: number;
  totalVehicles: number;
}

interface MQTTMessage {
  topic: string;
  payload: string;
  timestamp: string;
  type: 'density' | 'emergency' | 'status' | 'log' | 'cycle';
}

interface EventLog {
  time: string;
  source: string;
  message: string;
  mode: 'normal' | 'emergency';
}

const IoTMonitor = () => {
  const [isSimulating, setIsSimulating] = useState(false);
  const [mqttConnected, setMqttConnected] = useState(false);
  const [signals, setSignals] = useState<SignalData[]>([
    { id: 1, name: 'Signal 1 (Main)', state: 'GREEN', mode: 'normal', vehicleCount: 12, greenDuration: 18, timeRemaining: 18, connected: true, lastUpdate: Date.now(), totalVehicles: 234 },
    { id: 2, name: 'Signal 2 (Junction)', state: 'RED', mode: 'normal', vehicleCount: 7, greenDuration: 15, timeRemaining: 0, connected: true, lastUpdate: Date.now(), totalVehicles: 189 },
    { id: 3, name: 'Signal 3 (Exit)', state: 'RED', mode: 'normal', vehicleCount: 4, greenDuration: 12, timeRemaining: 0, connected: true, lastUpdate: Date.now(), totalVehicles: 156 },
  ]);

  const [mqttMessages, setMqttMessages] = useState<MQTTMessage[]>([]);
  const [eventLogs, setEventLogs] = useState<EventLog[]>([
    { time: new Date().toLocaleTimeString(), source: 'System', message: 'IoT Monitor initialized - Waiting for MQTT connection', mode: 'normal' },
  ]);

  const [emergencyActive, setEmergencyActive] = useState(false);
  const [emergencySource, setEmergencySource] = useState<number | null>(null);
  const [corridorProgress, setCorridorProgress] = useState(0);

  const addLog = useCallback((source: string, message: string, mode: 'normal' | 'emergency' = 'normal') => {
    setEventLogs(prev => [
      { time: new Date().toLocaleTimeString(), source, message, mode },
      ...prev.slice(0, 49)
    ]);
  }, []);

  const addMQTTMessage = useCallback((topic: string, payload: object, type: MQTTMessage['type']) => {
    setMqttMessages(prev => [
      { topic, payload: JSON.stringify(payload), timestamp: new Date().toLocaleTimeString(), type },
      ...prev.slice(0, 29)
    ]);
  }, []);

  // Simulate MQTT connection
  useEffect(() => {
    if (isSimulating) {
      const timer = setTimeout(() => {
        setMqttConnected(true);
        addLog('MQTT', 'Connected to broker (simulated)');
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      setMqttConnected(false);
    }
  }, [isSimulating, addLog]);

  // Main simulation loop
  useEffect(() => {
    if (!isSimulating || !mqttConnected) return;

    const interval = setInterval(() => {
      setSignals(prev => {
        const updated = prev.map(s => ({ ...s }));

        // Emergency mode handling
        if (emergencyActive && emergencySource !== null) {
          updated.forEach(s => {
            if (s.id <= (emergencySource + Math.floor(corridorProgress / 33))) {
              s.state = 'GREEN';
              s.mode = 'emergency';
            } else {
              s.state = 'RED';
              s.mode = 'emergency';
            }
          });
          return updated;
        }

        // Normal cycle
        const greenSignal = updated.find(s => s.state === 'GREEN');
        const yellowSignal = updated.find(s => s.state === 'YELLOW');

        if (greenSignal) {
          if (greenSignal.timeRemaining > 1) {
            greenSignal.timeRemaining--;
            // Simulate random vehicle arrivals
            if (Math.random() < 0.3) {
              const randomSignal = updated[Math.floor(Math.random() * 3)];
              randomSignal.vehicleCount = Math.min(25, randomSignal.vehicleCount + 1);
              randomSignal.totalVehicles++;
            }
          } else {
            greenSignal.state = 'YELLOW';
            greenSignal.timeRemaining = 3;
            addMQTTMessage(`traffic/status/signal${greenSignal.id}`, { signal_id: greenSignal.id, state: 'YELLOW' }, 'status');
            addLog(`Signal ${greenSignal.id}`, 'GREEN → YELLOW (clearing)');
          }
        } else if (yellowSignal) {
          if (yellowSignal.timeRemaining > 1) {
            yellowSignal.timeRemaining--;
          } else {
            yellowSignal.state = 'RED';
            yellowSignal.timeRemaining = 0;

            const nextIdx = (updated.findIndex(s => s.id === yellowSignal.id) + 1) % updated.length;
            const next = updated[nextIdx];
            const dynamicGreen = Math.min(30, Math.max(10, Math.ceil(next.vehicleCount * 1.5)));
            next.state = 'GREEN';
            next.timeRemaining = dynamicGreen;
            next.greenDuration = dynamicGreen;

            // Decrease vehicle count as they pass
            if (next.vehicleCount > 0) next.vehicleCount = Math.max(0, next.vehicleCount - 3);

            addMQTTMessage(`traffic/density/signal${next.id}`, { signal_id: next.id, count: next.vehicleCount }, 'density');
            addMQTTMessage(`traffic/cycle/next`, { source: yellowSignal.id, next: next.id }, 'cycle');
            addLog(`Signal ${next.id}`, `GREEN → ${dynamicGreen}s (${next.vehicleCount} vehicles)`);
          }
        }

        // Publish periodic density
        updated.forEach(s => {
          s.lastUpdate = Date.now();
          s.connected = true;
        });

        return updated;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isSimulating, mqttConnected, emergencyActive, emergencySource, corridorProgress, addLog, addMQTTMessage]);

  // Emergency corridor animation
  useEffect(() => {
    if (!emergencyActive) {
      setCorridorProgress(0);
      return;
    }
    const interval = setInterval(() => {
      setCorridorProgress(prev => {
        if (prev >= 100) {
          clearEmergency();
          return 0;
        }
        return prev + 2;
      });
    }, 500);
    return () => clearInterval(interval);
  }, [emergencyActive]);

  const triggerEmergency = (signalId: number) => {
    setEmergencyActive(true);
    setEmergencySource(signalId);
    addLog(`Signal ${signalId}`, '🚨 EMERGENCY TRIGGERED - Ambulance detected!', 'emergency');
    addMQTTMessage('traffic/emergency', { source: signalId, type: 'ambulance', priority: 'high' }, 'emergency');
    addLog('System', `Creating green corridor: Signal ${signalId} → Signal 3`, 'emergency');
  };

  const clearEmergency = () => {
    setEmergencyActive(false);
    setEmergencySource(null);
    setCorridorProgress(0);
    setSignals(prev => prev.map((s, i) => ({
      ...s,
      mode: 'normal',
      state: i === 0 ? 'GREEN' : 'RED',
      timeRemaining: i === 0 ? 20 : 0,
    })));
    addLog('System', 'Emergency cleared - Resuming normal density-based operation', 'normal');
    addMQTTMessage('traffic/emergency/clear', { duration_ms: 25000 }, 'emergency');
  };

  const resetSimulation = () => {
    setIsSimulating(false);
    setMqttConnected(false);
    setEmergencyActive(false);
    setEmergencySource(null);
    setCorridorProgress(0);
    setSignals([
      { id: 1, name: 'Signal 1 (Main)', state: 'GREEN', mode: 'normal', vehicleCount: 12, greenDuration: 18, timeRemaining: 18, connected: true, lastUpdate: Date.now(), totalVehicles: 234 },
      { id: 2, name: 'Signal 2 (Junction)', state: 'RED', mode: 'normal', vehicleCount: 7, greenDuration: 15, timeRemaining: 0, connected: true, lastUpdate: Date.now(), totalVehicles: 189 },
      { id: 3, name: 'Signal 3 (Exit)', state: 'RED', mode: 'normal', vehicleCount: 4, greenDuration: 12, timeRemaining: 0, connected: true, lastUpdate: Date.now(), totalVehicles: 156 },
    ]);
    setMqttMessages([]);
    setEventLogs([{ time: new Date().toLocaleTimeString(), source: 'System', message: 'Simulation reset', mode: 'normal' }]);
  };

  const getStateColor = (state: string) => {
    switch (state) {
      case 'GREEN': return 'bg-traffic-green text-white';
      case 'YELLOW': return 'bg-traffic-amber text-black';
      case 'RED': return 'bg-traffic-red text-white';
      default: return 'bg-muted';
    }
  };

  const getMQTTTypeColor = (type: string) => {
    switch (type) {
      case 'emergency': return 'text-traffic-red';
      case 'density': return 'text-traffic-green';
      case 'status': return 'text-primary';
      case 'cycle': return 'text-traffic-amber';
      default: return 'text-muted-foreground';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-accent/10">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Link to="/">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" /> Back
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-traffic-green bg-clip-text text-transparent">
              IoT Signal Monitor — MQTT Dashboard
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              NodeMCU ESP8266 • MQTT Communication • Real-time Signal Coordination
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant={mqttConnected ? "default" : "destructive"} className="gap-1">
              {mqttConnected ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
              MQTT {mqttConnected ? 'Connected' : 'Disconnected'}
            </Badge>
            <Button onClick={() => setIsSimulating(!isSimulating)} className="bg-gradient-to-r from-primary to-traffic-green border-0 text-primary-foreground">
              {isSimulating ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
              {isSimulating ? 'Pause' : 'Start'}
            </Button>
            <Button variant="outline" onClick={resetSimulation}>
              <RotateCcw className="w-4 h-4 mr-2" /> Reset
            </Button>
          </div>
        </div>

        {/* Emergency Banner */}
        {emergencyActive && (
          <div className="mb-6 p-4 bg-traffic-red/10 border-2 border-traffic-red rounded-xl animate-pulse">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-6 h-6 text-traffic-red" />
                <div>
                  <h3 className="font-bold text-traffic-red text-lg">🚨 EMERGENCY MODE ACTIVE</h3>
                  <p className="text-sm text-muted-foreground">
                    Ambulance detected at Signal {emergencySource} — Green corridor in progress
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-48">
                  <div className="text-xs text-muted-foreground mb-1">Corridor Progress</div>
                  <Progress value={corridorProgress} className="h-3" />
                </div>
                <Button variant="destructive" size="sm" onClick={clearEmergency}>
                  Clear Emergency
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Signal Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {signals.map(signal => (
            <Card key={signal.id} className={`relative overflow-hidden transition-all ${
              signal.mode === 'emergency' ? 'border-traffic-red border-2 shadow-lg shadow-traffic-red/20' : 'border-border'
            }`}>
              {/* Glow top bar */}
              <div className={`h-1.5 ${
                signal.state === 'GREEN' ? 'bg-traffic-green' :
                signal.state === 'YELLOW' ? 'bg-traffic-amber' : 'bg-traffic-red'
              }`} />
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Cpu className="w-4 h-4 text-muted-foreground" />
                    {signal.name}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${signal.connected ? 'bg-traffic-green animate-pulse' : 'bg-traffic-red'}`} />
                    <Badge variant={signal.mode === 'emergency' ? 'destructive' : 'outline'} className="text-xs">
                      {signal.mode.toUpperCase()}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Traffic Light Visual */}
                <div className="flex items-center gap-4">
                  <div className="bg-zinc-900 rounded-xl p-2 flex flex-col gap-1.5">
                    <div className={`w-6 h-6 rounded-full transition-all ${signal.state === 'RED' ? 'bg-traffic-red shadow-[0_0_12px_hsl(var(--traffic-red))]' : 'bg-zinc-700'}`} />
                    <div className={`w-6 h-6 rounded-full transition-all ${signal.state === 'YELLOW' ? 'bg-traffic-amber shadow-[0_0_12px_hsl(var(--traffic-amber))]' : 'bg-zinc-700'}`} />
                    <div className={`w-6 h-6 rounded-full transition-all ${signal.state === 'GREEN' ? 'bg-traffic-green shadow-[0_0_12px_hsl(var(--traffic-green))]' : 'bg-zinc-700'}`} />
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex justify-between items-baseline">
                      <span className="text-sm text-muted-foreground">State</span>
                      <Badge className={getStateColor(signal.state)}>{signal.state}</Badge>
                    </div>
                    <div className="flex justify-between items-baseline">
                      <span className="text-sm text-muted-foreground">Vehicles</span>
                      <span className="font-bold text-lg">{signal.vehicleCount}</span>
                    </div>
                    <div className="flex justify-between items-baseline">
                      <span className="text-sm text-muted-foreground">Green Time</span>
                      <span className="font-mono">{signal.greenDuration}s</span>
                    </div>
                  </div>
                </div>

                {/* Timer Progress */}
                {signal.state !== 'RED' && (
                  <div>
                    <div className="flex justify-between text-xs text-muted-foreground mb-1">
                      <span>Time Remaining</span>
                      <span className="font-mono font-bold">{signal.timeRemaining}s</span>
                    </div>
                    <Progress value={(signal.timeRemaining / signal.greenDuration) * 100} className="h-2" />
                  </div>
                )}

                {/* Controls */}
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant={signal.mode === 'emergency' ? 'destructive' : 'secondary'}
                    className="flex-1 text-xs"
                    onClick={() => {
                      if (emergencyActive) clearEmergency();
                      else triggerEmergency(signal.id);
                    }}
                  >
                    <AlertTriangle className="w-3 h-3 mr-1" />
                    {emergencyActive && emergencySource === signal.id ? 'Clear' : '🚑 Emergency'}
                  </Button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-muted/50 rounded-lg p-2 text-center">
                    <div className="text-muted-foreground">Total Vehicles</div>
                    <div className="font-bold text-sm">{signal.totalVehicles}</div>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-2 text-center">
                    <div className="text-muted-foreground">Dynamic Time</div>
                    <div className="font-bold text-sm">{signal.greenDuration}s</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Corridor Visualization */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Radio className="w-5 h-5" />
              Signal-to-Signal Communication (MQTT)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between gap-2">
              {signals.map((signal, idx) => (
                <div key={signal.id} className="flex items-center flex-1">
                  {/* Signal Node */}
                  <div className={`flex flex-col items-center p-4 rounded-xl border-2 transition-all flex-1 ${
                    signal.mode === 'emergency'
                      ? 'border-traffic-red bg-traffic-red/5'
                      : signal.state === 'GREEN'
                        ? 'border-traffic-green bg-traffic-green/5'
                        : 'border-border bg-card'
                  }`}>
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm mb-2 ${getStateColor(signal.state)}`}>
                      S{signal.id}
                    </div>
                    <div className="text-xs text-muted-foreground">{signal.vehicleCount} vehicles</div>
                    <div className="text-xs font-mono mt-1">
                      {signal.state !== 'RED' ? `${signal.timeRemaining}s` : '—'}
                    </div>
                  </div>
                  {/* Connection Arrow */}
                  {idx < signals.length - 1 && (
                    <div className="flex flex-col items-center mx-2">
                      <div className={`text-xs mb-1 ${emergencyActive ? 'text-traffic-red font-bold animate-pulse' : 'text-muted-foreground'}`}>
                        {emergencyActive ? '🚨 MQTT' : 'MQTT'}
                      </div>
                      <div className={`w-16 h-0.5 ${emergencyActive ? 'bg-traffic-red animate-pulse' : 'bg-border'}`} />
                      <div className="text-xs text-muted-foreground mt-1">
                        traffic/density
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Tabs: MQTT Messages, Event Logs, Topic Structure */}
        <Tabs defaultValue="mqtt" className="mb-8">
          <TabsList className="grid grid-cols-3 w-full max-w-lg">
            <TabsTrigger value="mqtt">MQTT Messages</TabsTrigger>
            <TabsTrigger value="logs">Event Logs</TabsTrigger>
            <TabsTrigger value="topics">Topic Structure</TabsTrigger>
          </TabsList>

          <TabsContent value="mqtt">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Activity className="w-5 h-5" />
                  Live MQTT Feed
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="max-h-72 overflow-y-auto space-y-1 font-mono text-xs">
                  {mqttMessages.length === 0 ? (
                    <p className="text-muted-foreground text-center py-4">Start simulation to see MQTT messages</p>
                  ) : (
                    mqttMessages.map((msg, i) => (
                      <div key={i} className="flex gap-2 py-1 border-b border-border/30">
                        <span className="text-muted-foreground w-20 shrink-0">{msg.timestamp}</span>
                        <span className={`font-bold shrink-0 ${getMQTTTypeColor(msg.type)}`}>{msg.topic}</span>
                        <span className="text-foreground truncate">{msg.payload}</span>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="logs">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">System Event Logs</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="max-h-72 overflow-y-auto space-y-1">
                  {eventLogs.map((log, i) => (
                    <div key={i} className={`flex gap-2 py-1 text-xs border-b border-border/30 ${
                      log.mode === 'emergency' ? 'bg-traffic-red/5' : ''
                    }`}>
                      <span className="text-muted-foreground w-20 shrink-0 font-mono">{log.time}</span>
                      <Badge variant={log.mode === 'emergency' ? 'destructive' : 'outline'} className="text-[10px] h-5">
                        {log.source}
                      </Badge>
                      <span className="text-foreground">{log.message}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="topics">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Zap className="w-5 h-5" />
                  MQTT Topic Structure
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Topic</TableHead>
                      <TableHead>Direction</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>QoS</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {[
                      { topic: 'traffic/density/signal{N}', dir: 'Publish', desc: 'Vehicle count from each signal (every 2s)', qos: 0 },
                      { topic: 'traffic/emergency', dir: 'Pub/Sub', desc: 'Emergency alert broadcast (retained)', qos: 1 },
                      { topic: 'traffic/emergency/clear', dir: 'Pub/Sub', desc: 'Emergency cleared notification', qos: 1 },
                      { topic: 'traffic/status/signal{N}', dir: 'Publish', desc: 'Signal state (RED/GREEN/YELLOW) + mode', qos: 0 },
                      { topic: 'traffic/cycle/next', dir: 'Pub/Sub', desc: 'Cycle turn passing between signals', qos: 1 },
                      { topic: 'traffic/control/signal{N}', dir: 'Subscribe', desc: 'Manual control from dashboard', qos: 1 },
                      { topic: 'traffic/log', dir: 'Publish', desc: 'Event logging (emergency triggers, durations)', qos: 0 },
                    ].map((t, i) => (
                      <TableRow key={i}>
                        <TableCell className="font-mono text-sm text-primary">{t.topic}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs">{t.dir}</Badge>
                        </TableCell>
                        <TableCell className="text-sm">{t.desc}</TableCell>
                        <TableCell className="text-center">{t.qos}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Hardware Diagram */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Cpu className="w-5 h-5" />
              Hardware & Wiring — NodeMCU ESP8266
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h3 className="font-bold text-sm">Pin Configuration</h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Component</TableHead>
                      <TableHead>Pin</TableHead>
                      <TableHead>GPIO</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {[
                      { comp: '🔴 Red LED', pin: 'D1', gpio: 'GPIO5' },
                      { comp: '🟡 Yellow LED', pin: 'D2', gpio: 'GPIO4' },
                      { comp: '🟢 Green LED', pin: 'D3', gpio: 'GPIO0' },
                      { comp: '📡 IR Sensor', pin: 'D5', gpio: 'GPIO14' },
                      { comp: '🚨 Emergency Btn', pin: 'D6', gpio: 'GPIO12' },
                    ].map((p, i) => (
                      <TableRow key={i}>
                        <TableCell className="text-sm">{p.comp}</TableCell>
                        <TableCell className="font-mono font-bold">{p.pin}</TableCell>
                        <TableCell className="font-mono text-muted-foreground">{p.gpio}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <div className="space-y-3">
                <h3 className="font-bold text-sm">System Workflow</h3>
                <div className="space-y-2 text-sm">
                  {[
                    '1. NodeMCU boots → Connects WiFi → Connects MQTT broker',
                    '2. IR sensor detects vehicles → Increments count → Publishes density',
                    '3. Dynamic green time calculated: count × 1.5 (10s–30s range)',
                    '4. Signals coordinate via MQTT: Signal 1 → 2 → 3 → 1 cycle',
                    '5. Emergency button pressed → Immediate GREEN + MQTT broadcast',
                    '6. Receiving signals create green corridor in sequence',
                    '7. Timeout (60s) or manual clear → Resume normal density-based cycle',
                  ].map((step, i) => (
                    <div key={i} className="flex gap-2 items-start">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                      <span className="text-muted-foreground">{step}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      <Footer />
    </div>
  );
};

export default IoTMonitor;
