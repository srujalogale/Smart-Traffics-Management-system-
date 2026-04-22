import { useEffect, useState, useRef } from 'react';
import { AlertTriangle, CheckCircle } from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────
export interface CorridorSignalNode {
  id:                 number;
  isAmbulanceHere:   boolean;  // ambulance currently AT this signal
  isAhead:           boolean;  // pre-cleared green (ambulance coming)
  isCleared:         boolean;  // ambulance already passed
  isNormal:          boolean;  // unaffected, running on density timing
  vehicleCount:      number;
  greenTime:         number;
}

interface CorridorMapProps {
  signals:             CorridorSignalNode[];
  emergencyActive:     boolean;
  ambulancePosition:   number;   // 1-indexed, 0 = not started
  progress:            number;   // 0-100 overall corridor progress
  corridorLength:      number;
}

// ─── Signal Circle ────────────────────────────────────────────────────────────
const SignalCircle = ({
  signal,
  isLast,
}: {
  signal: CorridorSignalNode;
  isLast: boolean;
}) => {
  const { isAmbulanceHere, isAhead, isCleared, isNormal, vehicleCount, greenTime, id } = signal;

  // Determine ring color
  const ringColor = isAmbulanceHere
    ? 'border-red-500 shadow-[0_0_24px_8px_rgba(239,68,68,0.6)]'
    : isAhead
    ? 'border-green-400 shadow-[0_0_18px_6px_rgba(34,197,94,0.45)]'
    : isCleared
    ? 'border-emerald-600 shadow-none opacity-60'
    : 'border-slate-500 shadow-none';

  // Inner light color
  const innerColor = isAmbulanceHere
    ? 'bg-red-500'
    : isAhead
    ? 'bg-green-400 animate-pulse'
    : isCleared
    ? 'bg-emerald-700'
    : 'bg-slate-600';

  // Label
  const statusLabel = isAmbulanceHere
    ? '🚑 HERE'
    : isAhead
    ? '🟢 CLEAR'
    : isCleared
    ? '✅ Passed'
    : 'Normal';

  const labelColor = isAmbulanceHere
    ? 'text-red-400 font-bold'
    : isAhead
    ? 'text-green-400 font-semibold'
    : isCleared
    ? 'text-emerald-500'
    : 'text-slate-400';

  return (
    <div className="flex items-center">
      {/* Signal node */}
      <div className="flex flex-col items-center gap-1.5 relative">
        {/* Circle */}
        <div className={`w-16 h-16 rounded-full border-4 flex items-center justify-center transition-all duration-700 ${ringColor}`}>
          <div className={`w-10 h-10 rounded-full transition-all duration-700 flex items-center justify-center ${innerColor}`}>
            {isAmbulanceHere && (
              <span className="text-xl leading-none">🚑</span>
            )}
            {isAhead && !isAmbulanceHere && (
              <span className="text-lg leading-none text-white font-bold">G</span>
            )}
            {isCleared && (
              <CheckCircle className="w-5 h-5 text-white opacity-80" />
            )}
            {isNormal && (
              <span className="text-xs text-slate-300 font-bold">{id}</span>
            )}
          </div>
        </div>

        {/* Signal ID label */}
        <span className="text-xs font-bold text-slate-300">S{id}</span>

        {/* Status label */}
        <span className={`text-[10px] ${labelColor} text-center leading-tight`}>
          {statusLabel}
        </span>

        {/* Vehicle count chip */}
        <div className="px-1.5 py-0.5 rounded-full bg-slate-700 text-[10px] text-slate-300 text-center">
          {vehicleCount}v · {greenTime}s
        </div>
      </div>

      {/* Road segment between signals */}
      {!isLast && (
        <div className="relative flex flex-col items-center mx-1" style={{ width: 56 }}>
          {/* Road line */}
          <div className={`w-full h-2 rounded transition-all duration-700 ${
            isAhead || isAmbulanceHere
              ? 'bg-green-500 shadow-[0_0_8px_2px_rgba(34,197,94,0.5)]'
              : isCleared
              ? 'bg-emerald-700 opacity-50'
              : 'bg-slate-600'
          }`} />
          {/* Direction arrow */}
          <span className="text-slate-500 text-[9px] mt-0.5">▶</span>
        </div>
      )}
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
const CorridorMap = ({
  signals,
  emergencyActive,
  ambulancePosition,
  progress,
  corridorLength,
}: CorridorMapProps) => {
  const [animTick, setAnimTick] = useState(0);

  // Pulse animation for emergency
  useEffect(() => {
    if (!emergencyActive) return;
    const id = setInterval(() => setAnimTick(t => t + 1), 800);
    return () => clearInterval(id);
  }, [emergencyActive]);

  return (
    <div className="w-full">
      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-bold text-base text-slate-100">
            Emergency Corridor — {corridorLength} Signal Route
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            {emergencyActive
              ? `🚑 Ambulance at Signal ${ambulancePosition}/${corridorLength} — next ${Math.min(3, corridorLength - ambulancePosition)} signal(s) pre-cleared GREEN`
              : 'No active emergency — all signals running density-based timing'}
          </p>
        </div>
        {emergencyActive && (
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold
            ${animTick % 2 === 0 ? 'bg-red-500 text-white' : 'bg-red-900 text-red-300'}`}>
            <AlertTriangle className="w-3.5 h-3.5" />
            EMERGENCY ACTIVE
          </div>
        )}
      </div>

      {/* ── Progress bar ── */}
      {emergencyActive && (
        <div className="mb-5">
          <div className="flex justify-between text-xs text-slate-400 mb-1">
            <span>Corridor Progress</span>
            <span className="font-mono font-bold text-green-400">{progress}%</span>
          </div>
          <div className="w-full h-2.5 bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-green-600 to-green-400 rounded-full transition-all duration-1000"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* ── Road with signal circles ── */}
      <div className="w-full overflow-x-auto pb-3">
        <div className="flex items-center justify-start min-w-max px-2 py-4
                        bg-slate-900/60 rounded-2xl border border-slate-700">
          {/* Origin label */}
          <div className="flex flex-col items-center mr-3 shrink-0">
            <div className="w-3 h-3 rounded-full bg-slate-500" />
            <span className="text-[10px] text-slate-500 mt-1">Start</span>
          </div>

          {signals.map((sig, idx) => (
            <SignalCircle
              key={sig.id}
              signal={sig}
              isLast={idx === signals.length - 1}
            />
          ))}

          {/* Destination label */}
          <div className="flex flex-col items-center ml-3 shrink-0">
            <div className="w-3 h-3 rounded-full bg-slate-500" />
            <span className="text-[10px] text-slate-500 mt-1">End</span>
          </div>
        </div>
      </div>

      {/* ── Legend ── */}
      <div className="flex flex-wrap gap-4 mt-3 text-xs text-slate-400">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-500" />
          <span>Ambulance Here</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-green-400 animate-pulse" />
          <span>Pre-cleared GREEN (ahead)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-emerald-700 opacity-60" />
          <span>Ambulance Passed</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-slate-600" />
          <span>Normal (density-based)</span>
        </div>
      </div>
    </div>
  );
};

export default CorridorMap;
