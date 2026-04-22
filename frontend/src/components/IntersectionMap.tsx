import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Badge } from '@/components/ui/badge';

// Fix for default markers in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface IntersectionMapProps {
  selectedLane: string | null;
  onLaneSelect: (lane: string) => void;
  signalStates: {
    lane1: 'red' | 'yellow' | 'green';
    lane2: 'red' | 'yellow' | 'green';
    lane3: 'red' | 'yellow' | 'green';
    lane4: 'red' | 'yellow' | 'green';
  };
}

const IntersectionMap = ({ selectedLane, onLaneSelect, signalStates }: IntersectionMapProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<{ [key: string]: L.Marker }>({});

  const getSignalColor = (state: 'red' | 'yellow' | 'green') => {
    switch (state) {
      case 'green': return '#22c55e';
      case 'yellow': return '#eab308';
      case 'red': return '#ef4444';
    }
  };

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    // Initialize map centered on a city intersection
    const map = L.map(mapRef.current).setView([28.6139, 77.2090], 18);
    mapInstanceRef.current = map;

    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    // Add intersection marker
    const intersectionIcon = L.divIcon({
      html: `<div style="background: linear-gradient(135deg, #3b82f6, #8b5cf6); width: 30px; height: 30px; border-radius: 50%; border: 3px solid white; box-shadow: 0 4px 6px rgba(0,0,0,0.3);"></div>`,
      iconSize: [30, 30],
      className: 'custom-intersection-icon'
    });

    L.marker([28.6139, 77.2090], { icon: intersectionIcon })
      .addTo(map)
      .bindPopup('<b>Smart Traffic Intersection</b><br>New Delhi - Control Center');

    // Define lane positions around the intersection
    const lanePositions: { [key: string]: { coords: [number, number], label: string, direction: string } } = {
      lane1: { coords: [28.6149, 77.2090], label: 'Lane 1', direction: 'North' },
      lane2: { coords: [28.6139, 77.2100], label: 'Lane 2', direction: 'East' },
      lane3: { coords: [28.6129, 77.2090], label: 'Lane 3', direction: 'South' },
      lane4: { coords: [28.6139, 77.2080], label: 'Lane 4', direction: 'West' },
    };

    // Create traffic light markers for each lane
    Object.entries(lanePositions).forEach(([laneKey, laneData]) => {
      const state = signalStates[laneKey as keyof typeof signalStates];
      const color = getSignalColor(state);
      
      const trafficLightIcon = L.divIcon({
        html: `
          <div style="
            background: white;
            padding: 8px;
            border-radius: 8px;
            box-shadow: 0 4px 8px rgba(0,0,0,0.2);
            border: 3px solid ${color};
            cursor: pointer;
            transition: all 0.3s;
          ">
            <div style="
              width: 20px;
              height: 20px;
              border-radius: 50%;
              background: ${color};
              box-shadow: 0 0 10px ${color};
              margin-bottom: 4px;
            "></div>
            <div style="
              font-size: 10px;
              font-weight: bold;
              text-align: center;
              color: #333;
            ">${laneData.label}</div>
          </div>
        `,
        iconSize: [50, 60],
        className: `custom-traffic-light ${selectedLane === laneKey ? 'selected-lane' : ''}`
      });

      const marker = L.marker(laneData.coords, { icon: trafficLightIcon })
        .addTo(map)
        .bindPopup(`
          <div style="text-align: center;">
            <b>${laneData.label}</b><br>
            Direction: ${laneData.direction}<br>
            State: <span style="color: ${color}; font-weight: bold;">${state.toUpperCase()}</span><br>
            <br><em>Click to select this lane</em>
          </div>
        `)
        .on('click', () => {
          onLaneSelect(laneKey);
        });

      markersRef.current[laneKey] = marker;
    });

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update markers when signal states or selected lane changes
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    const lanePositions: { [key: string]: { coords: [number, number], label: string, direction: string } } = {
      lane1: { coords: [28.6149, 77.2090], label: 'Lane 1', direction: 'North' },
      lane2: { coords: [28.6139, 77.2100], label: 'Lane 2', direction: 'East' },
      lane3: { coords: [28.6129, 77.2090], label: 'Lane 3', direction: 'South' },
      lane4: { coords: [28.6139, 77.2080], label: 'Lane 4', direction: 'West' },
    };

    Object.entries(lanePositions).forEach(([laneKey, laneData]) => {
      const state = signalStates[laneKey as keyof typeof signalStates];
      const color = getSignalColor(state);
      const isSelected = selectedLane === laneKey;
      
      const trafficLightIcon = L.divIcon({
        html: `
          <div style="
            background: white;
            padding: 8px;
            border-radius: 8px;
            box-shadow: 0 4px 8px rgba(0,0,0,0.2);
            border: 3px solid ${color};
            cursor: pointer;
            transition: all 0.3s;
            ${isSelected ? 'transform: scale(1.2); box-shadow: 0 0 20px rgba(59, 130, 246, 0.8);' : ''}
          ">
            <div style="
              width: 20px;
              height: 20px;
              border-radius: 50%;
              background: ${color};
              box-shadow: 0 0 10px ${color};
              margin-bottom: 4px;
            "></div>
            <div style="
              font-size: 10px;
              font-weight: bold;
              text-align: center;
              color: #333;
            ">${laneData.label}</div>
          </div>
        `,
        iconSize: [50, 60],
        className: `custom-traffic-light ${isSelected ? 'selected-lane' : ''}`
      });

      if (markersRef.current[laneKey]) {
        markersRef.current[laneKey].setIcon(trafficLightIcon);
      }
    });
  }, [signalStates, selectedLane]);

  return (
    <div className="relative w-full h-full rounded-lg overflow-hidden">
      <div ref={mapRef} className="w-full h-full" />
      {selectedLane && (
        <div className="absolute top-4 right-4 bg-card/95 backdrop-blur-sm rounded-lg p-3 shadow-lg border border-primary/20">
          <h4 className="font-semibold text-sm mb-1">Selected Lane</h4>
          <Badge variant="default" className="mb-2">
            {selectedLane.toUpperCase().replace('LANE', 'Lane ')}
          </Badge>
          <p className="text-xs text-muted-foreground">
            State: <span className="font-semibold">{signalStates[selectedLane as keyof typeof signalStates].toUpperCase()}</span>
          </p>
        </div>
      )}
      <div className="absolute bottom-4 left-4 bg-card/95 backdrop-blur-sm rounded-lg p-3 shadow-lg border border-primary/20">
        <h4 className="font-semibold text-sm mb-2">Map Controls</h4>
        <p className="text-xs text-muted-foreground">
          Click on any traffic light marker to select and control that lane
        </p>
      </div>
    </div>
  );
};

export default IntersectionMap;
