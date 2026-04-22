import { Badge } from '@/components/ui/badge';
import { Car, Ambulance } from 'lucide-react';

interface ImprovedIntersectionVizProps {
  lanes: Array<{
    id: number;
    vehicleCount: number;
    currentState: 'red' | 'yellow' | 'green';
    timeRemaining: number;
    hasEmergency: boolean;
  }>;
}

const ImprovedIntersectionViz = ({ lanes }: ImprovedIntersectionVizProps) => {
  const getSignalColor = (state: string) => {
    switch (state) {
      case 'green': return 'bg-green-500';
      case 'yellow': return 'bg-yellow-500';
      case 'red': return 'bg-red-500';
      default: return 'bg-gray-400';
    }
  };

  const getSignalShadow = (state: string) => {
    switch (state) {
      case 'green': return 'shadow-[0_0_20px_rgba(34,197,94,0.8)]';
      case 'yellow': return 'shadow-[0_0_20px_rgba(234,179,8,0.8)]';
      case 'red': return 'shadow-[0_0_20px_rgba(239,68,68,0.8)]';
      default: return '';
    }
  };

  return (
    <div className="relative bg-gradient-to-br from-slate-800 to-slate-900 rounded-lg p-12 min-h-[500px] flex items-center justify-center overflow-hidden">
      {/* Background grid pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.05) 1px, transparent 1px)',
          backgroundSize: '50px 50px'
        }}></div>
      </div>

      {/* Intersection Container */}
      <div className="relative w-full max-w-2xl aspect-square">
        {/* Vertical road */}
        <div className="absolute w-32 h-full bg-gradient-to-r from-gray-700 via-gray-600 to-gray-700 left-1/2 -translate-x-1/2 shadow-2xl">
          {/* Road markings */}
          <div className="absolute left-1/2 -translate-x-1/2 w-1 h-full bg-yellow-400 opacity-40"></div>
          <div className="absolute left-1/2 -translate-x-1/2 w-1 h-full flex flex-col gap-6 py-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="w-1 h-8 bg-white opacity-60"></div>
            ))}
          </div>
        </div>
        
        {/* Horizontal road */}
        <div className="absolute h-32 w-full bg-gradient-to-b from-gray-700 via-gray-600 to-gray-700 top-1/2 -translate-y-1/2 shadow-2xl">
          {/* Road markings */}
          <div className="absolute top-1/2 -translate-y-1/2 h-1 w-full bg-yellow-400 opacity-40"></div>
          <div className="absolute top-1/2 -translate-y-1/2 h-1 w-full flex gap-6 px-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-1 w-8 bg-white opacity-60"></div>
            ))}
          </div>
        </div>

        {/* Center intersection box */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-gray-600 border-4 border-yellow-400/20 rounded"></div>

        {/* Traffic Lights for each lane */}
        {lanes.map((lane, index) => {
          const positions = [
            { top: '5%', left: '50%', transform: 'translate(-50%, 0)', direction: 'N' },
            { top: '50%', right: '5%', transform: 'translate(0, -50%)', direction: 'E' },
            { bottom: '5%', left: '50%', transform: 'translate(-50%, 0)', direction: 'S' },
            { top: '50%', left: '5%', transform: 'translate(0, -50%)', direction: 'W' },
          ];
          
          const carPositions = [
            { top: '20%', left: '50%', transform: 'translate(-50%, 0) rotate(180deg)' },
            { top: '50%', right: '20%', transform: 'translate(0, -50%) rotate(-90deg)' },
            { bottom: '20%', left: '50%', transform: 'translate(-50%, 0)' },
            { top: '50%', left: '20%', transform: 'translate(0, -50%) rotate(90deg)' },
          ];

          return (
            <div key={lane.id}>
              {/* Traffic Light Pole */}
              <div
                className="absolute flex flex-col items-center z-10"
                style={{
                  ...positions[index],
                  direction: undefined
                } as React.CSSProperties}
              >
                {/* Light housing */}
                <div className="bg-gray-900 rounded-lg p-3 shadow-2xl border-2 border-gray-700">
                  <div className={`w-10 h-10 rounded-full ${getSignalColor(lane.currentState)} ${getSignalShadow(lane.currentState)} border-2 border-gray-800 transition-all duration-300`}>
                    {lane.currentState === 'green' && (
                      <div className="w-full h-full rounded-full animate-pulse bg-green-400/50"></div>
                    )}
                  </div>
                </div>
                
                {/* Lane info badge */}
                <div className="mt-3 bg-card/95 backdrop-blur-sm rounded-lg p-2 shadow-xl border border-primary/20">
                  <Badge 
                    variant={lane.hasEmergency ? "destructive" : "secondary"} 
                    className="text-xs mb-1 w-full justify-center"
                  >
                    Lane {lane.id} ({positions[index].direction})
                  </Badge>
                  
                  <div className="text-xs text-center space-y-1">
                    <div className="flex items-center justify-center gap-1">
                      <Car className="w-3 h-3" />
                      <span className="font-semibold">{lane.vehicleCount}</span>
                    </div>
                    
                    {lane.hasEmergency && (
                      <div className="flex items-center justify-center gap-1 text-red-500 animate-pulse">
                        <Ambulance className="w-3 h-3" />
                        <span className="font-bold text-xs">EMERGENCY</span>
                      </div>
                    )}
                    
                    {lane.currentState !== 'red' && (
                      <div className="font-bold text-primary">
                        {lane.timeRemaining}s
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Vehicle indicators */}
              {lane.vehicleCount > 0 && (
                <div
                  className="absolute flex gap-1"
                  style={carPositions[index]}
                >
                  {Array.from({ length: Math.min(lane.vehicleCount, 5) }).map((_, i) => (
                    <Car 
                      key={i} 
                      className={`w-4 h-4 ${lane.hasEmergency && i === 0 ? 'text-red-500 animate-pulse' : 'text-blue-400'}`}
                    />
                  ))}
                  {lane.vehicleCount > 5 && (
                    <span className="text-xs text-blue-400 font-bold">+{lane.vehicleCount - 5}</span>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ImprovedIntersectionViz;
