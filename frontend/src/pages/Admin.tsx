import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { AlertTriangle, Settings, Clock, Shield, RotateCcw, Save, Map, Cloud, CloudRain, CloudFog, AlertOctagon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import IntersectionMap from '@/components/IntersectionMap';

const FLASK_BASE = 'http://127.0.0.1:5000';

interface SystemConfig {
  weather: 'clear' | 'rain' | 'fog';
  min_green: number;
  max_green: number;
  yellow_time: number;
}

const Admin = () => {
  const { toast } = useToast();
  const [manualOverride, setManualOverride] = useState({
    lane1: false,
    lane2: false,
    lane3: false,
    lane4: false,
  });
  
  const [signalStates, setSignalStates] = useState({
    lane1: 'red' as 'red' | 'yellow' | 'green',
    lane2: 'red' as 'red' | 'yellow' | 'green',
    lane3: 'red' as 'red' | 'yellow' | 'green',
    lane4: 'red' as 'red' | 'yellow' | 'green',
  });
  
  const [systemSettings, setSystemSettings] = useState({
    defaultGreenTime: [30],
    defaultYellowTime: [3],
    emergencyResponseTime: [5],
    systemEnabled: true,
    autoModeEnabled: true,
    nightModeEnabled: false,
  });

  const [emergencyHistory] = useState([
    { id: 1, time: '14:23:15', lane: 'Lane 2', vehicle: 'AMB-001', duration: '45s', status: 'Completed' },
    { id: 2, time: '13:45:32', lane: 'Lane 1', vehicle: 'FIRE-003', duration: '62s', status: 'Completed' },
    { id: 3, time: '12:18:47', lane: 'Lane 4', vehicle: 'POL-012', duration: '38s', status: 'Completed' },
    { id: 4, time: '11:52:19', lane: 'Lane 3', vehicle: 'AMB-005', duration: '41s', status: 'Completed' },
    { id: 5, time: '10:33:08', lane: 'Lane 1', vehicle: 'FIRE-001', duration: '55s', status: 'Completed' },
  ]);

  // ── Backend Integration ──
  const [backendOnline, setBackendOnline] = useState(false);
  const [config, setConfig] = useState<SystemConfig>({
    weather: 'clear', min_green: 10, max_green: 60, yellow_time: 3,
  });

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await fetch(`${FLASK_BASE}/status`);
        const data = await res.json();
        setBackendOnline(res.ok);
        if (data.system_config) setConfig(data.system_config);
      } catch { setBackendOnline(false); }
    };
    fetchStatus();
    const id = setInterval(fetchStatus, 5000);
    return () => clearInterval(id);
  }, []);

  const saveConfig = async (newConfig: Partial<SystemConfig>) => {
    const updated = { ...config, ...newConfig };
    setConfig(updated);
    if (!backendOnline) return;
    try {
      await fetch(`${FLASK_BASE}/config`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      });
      toast({ title: "Configuration Updated", description: "Backend settings synced." });
    } catch { /* silent */ }
  };

  const triggerEmergency = async (lane: number) => {
    if (!backendOnline) return;
    await fetch(`${FLASK_BASE}/emergency/trigger`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lane, vehicle_type: 'police_convoy' }),
    });
    toast({ title: "Emergency Triggered", description: "Green corridor activated.", variant: "destructive" });
  };

  const clearEmergency = async () => {
    if (!backendOnline) return;
    await fetch(`${FLASK_BASE}/emergency/clear`, { method: 'POST' });
    toast({ title: "Emergency Cleared" });
  };

  const handleManualOverride = (lane: string) => {
    const laneKey = lane as keyof typeof manualOverride;
    const newState = { ...manualOverride };
    
    // Turn off all other lanes when one is turned on
    if (!newState[laneKey]) {
      Object.keys(newState).forEach(key => {
        newState[key as keyof typeof manualOverride] = false;
      });
    }
    
    newState[laneKey] = !manualOverride[laneKey];
    setManualOverride(newState);
    
    toast({
      title: "Manual Override",
      description: `${lane.toUpperCase()} ${newState[laneKey] ? 'activated' : 'deactivated'}`,
    });
  };

  const handleSignalChange = (lane: string, state: 'red' | 'yellow' | 'green') => {
    const laneKey = lane as keyof typeof signalStates;
    setSignalStates(prev => ({
      ...prev,
      [laneKey]: state
    }));
    
    toast({
      title: "Signal Changed",
      description: `${lane.toUpperCase()} set to ${state.toUpperCase()}`,
    });
  };

  const handleSettingChange = (setting: string, value: any) => {
    setSystemSettings(prev => ({
      ...prev,
      [setting]: value
    }));
  };

  const saveSettings = () => {
    toast({
      title: "Settings Saved",
      description: "System configuration has been updated successfully.",
    });
  };

  const resetToDefaults = () => {
    setSystemSettings({
      defaultGreenTime: [30],
      defaultYellowTime: [3],
      emergencyResponseTime: [5],
      systemEnabled: true,
      autoModeEnabled: true,
      nightModeEnabled: false,
    });
    
    setManualOverride({
      lane1: false,
      lane2: false,
      lane3: false,
      lane4: false,
    });
    
    toast({
      title: "Settings Reset",
      description: "All settings have been restored to default values.",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-accent/10">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Admin Control Panel
          </h1>
          <p className="text-muted-foreground text-lg">
            Advanced system controls and configuration management
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          {/* Weather Control */}
          <Card className="bg-card/50 backdrop-blur-sm border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Cloud className="w-5 h-5" /> Weather Simulation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Simulating bad weather alters the AI's green-time formula to prioritize safety.
              </p>
              <div className="grid grid-cols-3 gap-3">
                <Button 
                  variant={config.weather === 'clear' ? 'default' : 'outline'}
                  onClick={() => saveConfig({ weather: 'clear' })}
                  className="flex flex-col gap-2 h-auto py-4"
                >
                  <Cloud className="w-6 h-6" /> Clear
                </Button>
                <Button 
                  variant={config.weather === 'rain' ? 'default' : 'outline'}
                  onClick={() => saveConfig({ weather: 'rain' })}
                  className="flex flex-col gap-2 h-auto py-4"
                >
                  <CloudRain className="w-6 h-6 text-blue-400" /> Rain (Min 15s)
                </Button>
                <Button 
                  variant={config.weather === 'fog' ? 'default' : 'outline'}
                  onClick={() => saveConfig({ weather: 'fog' })}
                  className="flex flex-col gap-2 h-auto py-4"
                >
                  <CloudFog className="w-6 h-6 text-slate-400" /> Fog (Max 40s)
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Emergency Override */}
          <Card className="bg-card/50 backdrop-blur-sm border-traffic-red/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-traffic-red">
                <AlertOctagon className="w-5 h-5" /> Emergency Override
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Manually trigger a green corridor for high-priority convoys, or clear existing emergencies across the network.
              </p>
              <div className="flex flex-col gap-3">
                <Button variant="destructive" onClick={() => triggerEmergency(1)}>
                  Force Green Corridor (Lane 1)
                </Button>
                <Button variant="outline" onClick={clearEmergency}>
                  Clear Network Emergencies
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Map View */}
          <Card className="bg-card/50 backdrop-blur-sm border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Map className="w-5 h-5" />
                Intersection Map View
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[500px]">
                <IntersectionMap 
                  selectedLane={Object.entries(manualOverride).find(([_, active]) => active)?.[0] || null}
                  onLaneSelect={(lane) => handleManualOverride(lane)}
                  signalStates={signalStates}
                />
              </div>
            </CardContent>
          </Card>

          {/* Manual Override Controls */}
          <Card className="bg-card/50 backdrop-blur-sm border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Manual Traffic Control
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-4">
                {Object.entries(manualOverride).map(([lane, isActive]) => (
                  <div 
                    key={lane}
                    className={`p-4 rounded-lg border-2 transition-all duration-300 ${
                      isActive 
                        ? 'border-green-500 bg-green-50 dark:bg-green-950/20' 
                        : 'border-border bg-muted/20'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold">{lane.replace('lane', 'Lane ')}</h3>
                      <Badge variant={isActive ? "default" : "secondary"}>
                        {isActive ? "ACTIVE" : "AUTO"}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm text-muted-foreground">
                        {isActive ? "Manual control enabled" : "Automatic mode"}
                      </span>
                      <Button 
                        variant={isActive ? "destructive" : "default"}
                        size="sm"
                        onClick={() => handleManualOverride(lane)}
                      >
                        {isActive ? "Release Control" : "Take Control"}
                      </Button>
                    </div>
                    
                    {isActive && (
                      <div className="mt-3 pt-3 border-t border-border">
                        <p className="text-xs text-muted-foreground mb-2">Set Signal State:</p>
                        <div className="flex gap-2">
                          {(['red', 'yellow', 'green'] as const).map((state) => (
                            <Button
                              key={state}
                              size="sm"
                              variant={signalStates[lane as keyof typeof signalStates] === state ? "default" : "outline"}
                              onClick={() => handleSignalChange(lane, state)}
                              className={`flex-1 ${
                                signalStates[lane as keyof typeof signalStates] === state
                                  ? state === 'red' 
                                    ? 'bg-red-500 hover:bg-red-600 text-white' 
                                    : state === 'yellow'
                                    ? 'bg-yellow-500 hover:bg-yellow-600 text-white'
                                    : 'bg-green-500 hover:bg-green-600 text-white'
                                  : ''
                              }`}
                            >
                              {state.charAt(0).toUpperCase() + state.slice(1)}
                            </Button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              
              <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-4 h-4 text-yellow-600" />
                  <span className="font-semibold text-yellow-800 dark:text-yellow-200">Warning</span>
                </div>
                <p className="text-sm text-yellow-700 dark:text-yellow-300">
                  Manual override will disable automatic traffic management. Click on the map or use controls to select and control lanes.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Emergency History */}
          <div className="lg:col-span-2">
            <Card className="bg-card/50 backdrop-blur-sm border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Emergency Response History
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-2 px-3 font-semibold">Time</th>
                        <th className="text-left py-2 px-3 font-semibold">Lane</th>
                        <th className="text-left py-2 px-3 font-semibold">Vehicle ID</th>
                        <th className="text-left py-2 px-3 font-semibold">Duration</th>
                        <th className="text-left py-2 px-3 font-semibold">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {emergencyHistory.map((record) => (
                        <tr key={record.id} className="border-b border-border/50">
                          <td className="py-2 px-3 text-sm font-mono">{record.time}</td>
                          <td className="py-2 px-3">
                            <Badge variant="outline">{record.lane}</Badge>
                          </td>
                          <td className="py-2 px-3 font-medium">{record.vehicle}</td>
                          <td className="py-2 px-3">{record.duration}</td>
                          <td className="py-2 px-3">
                            <Badge variant="default" className="bg-green-100 text-green-800">
                              {record.status}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* System Settings */}
          <div className="space-y-6">
            <Card className="bg-card/50 backdrop-blur-sm border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  System Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* System Status Toggles */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="system-enabled">System Enabled</Label>
                    <Switch
                      id="system-enabled"
                      checked={systemSettings.systemEnabled}
                      onCheckedChange={(checked) => handleSettingChange('systemEnabled', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="auto-mode">Automatic Mode</Label>
                    <Switch
                      id="auto-mode"
                      checked={systemSettings.autoModeEnabled}
                      onCheckedChange={(checked) => handleSettingChange('autoModeEnabled', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="night-mode">Night Mode</Label>
                    <Switch
                      id="night-mode"
                      checked={systemSettings.nightModeEnabled}
                      onCheckedChange={(checked) => handleSettingChange('nightModeEnabled', checked)}
                    />
                  </div>
                </div>

                {/* Timing Settings */}
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium">
                      Default Green Time: {systemSettings.defaultGreenTime[0]}s
                    </Label>
                    <Slider
                      value={systemSettings.defaultGreenTime}
                      onValueChange={(value) => handleSettingChange('defaultGreenTime', value)}
                      max={60}
                      min={10}
                      step={5}
                      className="mt-2"
                    />
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium">
                      Yellow Time: {systemSettings.defaultYellowTime[0]}s
                    </Label>
                    <Slider
                      value={systemSettings.defaultYellowTime}
                      onValueChange={(value) => handleSettingChange('defaultYellowTime', value)}
                      max={10}
                      min={2}
                      step={1}
                      className="mt-2"
                    />
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium">
                      Emergency Response Time: {systemSettings.emergencyResponseTime[0]}s
                    </Label>
                    <Slider
                      value={systemSettings.emergencyResponseTime}
                      onValueChange={(value) => handleSettingChange('emergencyResponseTime', value)}
                      max={15}
                      min={3}
                      step={1}
                      className="mt-2"
                    />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col gap-3 pt-4 border-t border-border">
                  <Button onClick={saveSettings} className="w-full">
                    <Save className="w-4 h-4 mr-2" />
                    Save Settings
                  </Button>
                  <Button variant="outline" onClick={resetToDefaults} className="w-full">
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Reset to Defaults
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* System Status */}
            <Card className="bg-card/50 backdrop-blur-sm border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Current Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">System Status:</span>
                    <Badge variant="default" className="bg-green-100 text-green-800">
                      OPERATIONAL
                    </Badge>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Active Lanes:</span>
                    <span className="font-semibold">4/4</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Manual Overrides:</span>
                    <span className="font-semibold">
                      {Object.values(manualOverride).filter(Boolean).length}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Uptime:</span>
                    <span className="font-semibold">23h 45m</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Last Emergency:</span>
                    <span className="font-semibold">14:23:15</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Admin;
