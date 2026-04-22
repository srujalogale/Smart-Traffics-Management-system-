import { useState, useEffect } from "react";

interface TrafficLightProps {
  direction: string;
  position: string;
  isActive: boolean;
  onCycleComplete: () => void;
  emergencyMode?: boolean;
}

const TrafficLight = ({ direction, position, isActive, onCycleComplete, emergencyMode }: TrafficLightProps) => {
  const [currentState, setCurrentState] = useState<'red' | 'yellow' | 'green'>('red');
  const [timeLeft, setTimeLeft] = useState(30);

  useEffect(() => {
    if (emergencyMode) {
      setCurrentState('green');
      setTimeLeft(30);
      return;
    }

    if (!isActive) {
      setCurrentState('red');
      setTimeLeft(30);
      return;
    }

    // Traffic light cycle: Green (30s) → Yellow (5s) → Red
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          if (currentState === 'green') {
            setCurrentState('yellow');
            return 5;
          } else if (currentState === 'yellow') {
            setCurrentState('red');
            onCycleComplete();
            return 30;
          }
          return 30;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isActive, currentState, onCycleComplete, emergencyMode]);

  useEffect(() => {
    if (isActive && !emergencyMode) {
      setCurrentState('green');
      setTimeLeft(30);
    }
  }, [isActive, emergencyMode]);

  const getLightColor = (light: 'red' | 'yellow' | 'green') => {
    if (currentState === light) {
      switch (light) {
        case 'red': return 'bg-traffic-red shadow-traffic-red';
        case 'yellow': return 'bg-traffic-amber shadow-traffic-amber';
        case 'green': return 'bg-traffic-green shadow-traffic-green';
      }
    }
    return 'bg-muted';
  };

  return (
    <div className={`absolute ${position} transform -translate-x-1/2 -translate-y-1/2 z-10`}>
      <div className="relative">
        {/* Glow effect for active signal */}
        {currentState === 'green' && (
          <div className="absolute inset-0 bg-traffic-green/30 rounded-2xl blur-xl animate-pulse"></div>
        )}
        {currentState === 'red' && emergencyMode && (
          <div className="absolute inset-0 bg-traffic-red/40 rounded-2xl blur-xl animate-pulse"></div>
        )}
        
        <div className="relative bg-card/90 backdrop-blur-md rounded-2xl shadow-2xl p-5 border border-border/50 min-w-[120px]">
          <div className="text-center mb-4">
            <h3 className="font-bold text-base bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
              {direction}
            </h3>
            {emergencyMode && (
              <div className="mt-1">
                <span className="text-xs text-traffic-red font-bold bg-traffic-red/10 px-2 py-1 rounded-full border border-traffic-red/30 animate-pulse">
                  PRIORITY
                </span>
              </div>
            )}
          </div>
          
          {/* Modern Traffic Light Design */}
          <div className="bg-gradient-to-b from-zinc-800 to-black rounded-2xl p-3 mb-4 shadow-inner border border-zinc-700">
            <div className="space-y-2">
              <div className={`relative w-8 h-8 rounded-full mx-auto transition-all duration-500 transform ${
                currentState === 'red' 
                  ? 'scale-110 shadow-[0_0_20px_0_hsl(var(--traffic-red)/0.8)]' 
                  : 'scale-100'
              } ${getLightColor('red')}`}>
                {currentState === 'red' && (
                  <div className="absolute inset-0 bg-traffic-red/20 rounded-full animate-ping"></div>
                )}
              </div>
              <div className={`relative w-8 h-8 rounded-full mx-auto transition-all duration-500 transform ${
                currentState === 'yellow' 
                  ? 'scale-110 shadow-[0_0_20px_0_hsl(var(--traffic-amber)/0.8)]' 
                  : 'scale-100'
              } ${getLightColor('yellow')}`}>
                {currentState === 'yellow' && (
                  <div className="absolute inset-0 bg-traffic-amber/20 rounded-full animate-ping"></div>
                )}
              </div>
              <div className={`relative w-8 h-8 rounded-full mx-auto transition-all duration-500 transform ${
                currentState === 'green' 
                  ? 'scale-110 shadow-[0_0_20px_0_hsl(var(--traffic-green)/0.8)]' 
                  : 'scale-100'
              } ${getLightColor('green')}`}>
                {currentState === 'green' && (
                  <div className="absolute inset-0 bg-traffic-green/20 rounded-full animate-ping"></div>
                )}
              </div>
            </div>
          </div>
          
          {/* Enhanced Timer Display */}
          <div className="text-center">
            <div className="relative">
              <div className="text-2xl font-mono font-bold bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent mb-1">
                {timeLeft.toString().padStart(2, '0')}s
              </div>
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                {currentState}
              </div>
              
              {/* Progress bar */}
              <div className="mt-3 w-full bg-muted/30 rounded-full h-1.5 overflow-hidden">
                <div 
                  className={`h-full transition-all duration-1000 ease-linear rounded-full ${
                    currentState === 'green' ? 'bg-traffic-green' :
                    currentState === 'yellow' ? 'bg-traffic-amber' : 'bg-traffic-red'
                  }`}
                  style={{ 
                    width: `${((currentState === 'green' ? 30 : currentState === 'yellow' ? 5 : 30) - timeLeft) / 
                             (currentState === 'green' ? 30 : currentState === 'yellow' ? 5 : 30) * 100}%` 
                  }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrafficLight;