import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface MapComponentProps {
  emergencyVehicles: Array<{ numberPlate: string; route: string }>;
}

const MapComponent = ({ emergencyVehicles }: MapComponentProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    // Initialize map centered on a city intersection in India
    const map = L.map(mapRef.current).setView([28.6139, 77.2090], 16); // New Delhi coordinates
    mapInstanceRef.current = map;

    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    // Add intersection marker
    const intersectionIcon = L.divIcon({
      html: `<div style="background: #ef4444; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
      iconSize: [20, 20],
      className: 'custom-intersection-icon'
    });

    L.marker([28.6139, 77.2090], { icon: intersectionIcon })
      .addTo(map)
      .bindPopup('<b>Smart Traffic Intersection</b><br>New Delhi - Main control point');

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!mapInstanceRef.current) return;

    // Clear existing emergency vehicle markers
    mapInstanceRef.current.eachLayer((layer) => {
      if (layer instanceof L.Marker && layer.options.icon?.options.className?.includes('emergency-vehicle')) {
        mapInstanceRef.current?.removeLayer(layer);
      }
    });

    // Add emergency vehicle markers
    emergencyVehicles.forEach((vehicle, index) => {
      const emergencyIcon = L.divIcon({
        html: `<div style="background: #dc2626; color: white; padding: 2px 6px; border-radius: 4px; font-size: 10px; font-weight: bold; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);">${vehicle.numberPlate}</div>`,
        iconSize: [60, 20],
        className: 'custom-emergency-vehicle-icon emergency-vehicle'
      });

      // Position vehicles around the intersection
      const offset = 0.002;
      const positions = [
        [28.6139 + offset, 77.2090], // North
        [28.6139, 77.2090 + offset], // East
        [28.6139 - offset, 77.2090], // South
        [28.6139, 77.2090 - offset]  // West
      ];
      
      const position = positions[index % positions.length] as [number, number];
      
      L.marker(position, { icon: emergencyIcon })
        .addTo(mapInstanceRef.current!)
        .bindPopup(`<b>Emergency Vehicle</b><br>Plate: ${vehicle.numberPlate}<br>Route: ${vehicle.route}`);
    });
  }, [emergencyVehicles]);

  return (
    <div className="relative w-full h-[400px] rounded-lg overflow-hidden shadow-lg">
      <div ref={mapRef} className="w-full h-full" />
      <div className="absolute top-4 left-4 bg-card/90 backdrop-blur-sm rounded-lg p-3 shadow-lg border">
        <h4 className="font-semibold text-sm mb-1">Live Traffic Control</h4>
        <p className="text-xs text-muted-foreground">
          Emergency vehicles: {emergencyVehicles.length}
        </p>
      </div>
    </div>
  );
};

export default MapComponent;