import React, { useState } from 'react';
import { SectorConfig, LiveLocationState, AiFieldLocationBriefing } from '../types';
import { 
  Navigation, 
  MapPin, 
  Compass, 
  ShieldAlert, 
  Radio, 
  AlertTriangle, 
  CheckCircle2, 
  Sparkles, 
  Send, 
  Crosshair, 
  Activity, 
  Mountain,
  Gauge,
  PhoneCall,
  Clock
} from 'lucide-react';

interface LiveLocationConsoleProps {
  sector: SectorConfig;
  location: LiveLocationState;
  onStartTracking: () => void;
  onStopTracking: () => void;
  onSelectPreset: (presetId: string) => void;
  presets: Array<{ id: string; name: string; lat: number; lng: number; altitude: number; proximityDescription: string }>;
  onOpenCapModal?: () => void;
  onNavigateToMap?: () => void;
}

export const LiveLocationConsole: React.FC<LiveLocationConsoleProps> = ({
  sector,
  location,
  onStartTracking,
  onStopTracking,
  onSelectPreset,
  presets,
  onOpenCapModal,
  onNavigateToMap,
}) => {
  const [briefing, setBriefing] = useState<AiFieldLocationBriefing | null>(null);
  const [isBriefingLoading, setIsBriefingLoading] = useState(false);
  const [sosSent, setSosSent] = useState(false);

  // Request AI Field Safety Briefing from Gemini
  const fetchAiFieldBriefing = async () => {
    if (!location.lat || !location.lng) return;
    setIsBriefingLoading(true);
    try {
      const res = await fetch('/api/ai/field-location-briefing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lat: location.lat,
          lng: location.lng,
          altitude: location.altitude,
          accuracy: location.accuracy,
          speed: location.speed,
          heading: location.heading,
          sector,
          distanceKm: location.distanceToActiveHazardKm,
          insideGeofence: location.insideGeofence,
        }),
      });
      const data = await res.json();
      if (data.success && data.data) {
        setBriefing(data.data);
      }
    } catch (err) {
      console.error('Error getting AI briefing:', err);
    } finally {
      setIsBriefingLoading(false);
    }
  };

  const handleBroadcastSos = () => {
    setSosSent(true);
    setTimeout(() => setSosSent(false), 8000);
  };

  const isDanger = location.proximityStatus === 'CRITICAL_ZONE';
  const isWarning = location.proximityStatus === 'WARNING_BUFFER';

  return (
    <div className="flex-1 bg-[#070e1d] text-[#dce2f7] p-4 lg:p-6 overflow-y-auto font-mono-data">
      {/* TOP HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#3d494c]/30">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded bg-[#141b2b] border border-[#4cd7f6]/40 flex items-center justify-center text-[#4cd7f6] shadow-[0_0_15px_rgba(76,215,246,0.3)]">
            <Navigation className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-headline text-lg text-[#4cd7f6] font-bold uppercase tracking-tight">
                Live Location Sentinel & Geofence HUD
              </h1>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                location.enabled
                  ? isDanger
                    ? 'bg-[#a40217] text-[#ffdad6] animate-pulse'
                    : isWarning
                    ? 'bg-[#ffb95f] text-[#4a2800]'
                    : 'bg-[#06b6d4] text-[#00424f]'
                  : 'bg-[#232a3a] text-[#869397]'
              }`}>
                {location.enabled 
                  ? location.isSimulated 
                    ? 'SIMULATION ACTIVE' 
                    : 'LIVE GPS ACQUIRED' 
                  : 'GPS STANDBY'}
              </span>
            </div>
            <p className="text-xs text-[#869397]">
              Real-time GNSS positioning, kinematic geofence telemetry, and automated escape vector synthesis.
            </p>
          </div>
        </div>

        {/* CONTROLS */}
        <div className="flex items-center gap-2 flex-wrap">
          {!location.enabled ? (
            <button
              id="btn-enable-gps"
              type="button"
              onClick={onStartTracking}
              className="flex items-center gap-2 px-3.5 py-2 bg-[#06b6d4] hover:bg-[#06b6d4]/90 text-[#003640] rounded font-bold text-xs uppercase tracking-wider transition-all shadow-md active:scale-95"
            >
              <Crosshair className="w-4 h-4" />
              <span>Enable Device GPS</span>
            </button>
          ) : (
            <button
              id="btn-disable-gps"
              type="button"
              onClick={onStopTracking}
              className="flex items-center gap-2 px-3.5 py-2 bg-[#232a3a] hover:bg-[#2e3545] text-[#ffb4ab] border border-[#ffb4ab]/30 rounded font-bold text-xs uppercase tracking-wider transition-all"
            >
              <span>Stop Tracking</span>
            </button>
          )}

          {location.enabled && (
            <button
              id="btn-ai-briefing"
              type="button"
              onClick={fetchAiFieldBriefing}
              disabled={isBriefingLoading}
              className="flex items-center gap-1.5 px-3 py-2 bg-[#141b2b] hover:bg-[#232a3a] text-[#4cd7f6] border border-[#4cd7f6]/50 rounded font-bold text-xs uppercase transition-all"
            >
              <Sparkles className={`w-3.5 h-3.5 ${isBriefingLoading ? 'animate-spin' : ''}`} />
              <span>{isBriefingLoading ? 'Synthesizing...' : 'AI Field Briefing'}</span>
            </button>
          )}

          <button
            id="btn-sos-broadcast"
            type="button"
            onClick={handleBroadcastSos}
            className="flex items-center gap-1.5 px-3 py-2 bg-[#a40217] hover:bg-[#a40217]/90 text-[#ffdad6] rounded font-bold text-xs uppercase transition-all shadow-md active:scale-95"
          >
            <Radio className="w-3.5 h-3.5" />
            <span>{sosSent ? 'SOS BEACON DISPATCHED' : 'Broadcast Field SOS'}</span>
          </button>
        </div>
      </div>

      {/* SOS CONFIRMATION BANNER */}
      {sosSent && (
        <div className="mt-4 p-3 bg-[#a40217]/20 border border-[#a40217] rounded flex items-center justify-between text-xs animate-in slide-in-from-top-2 duration-300">
          <div className="flex items-center gap-2 text-[#ffdad6]">
            <AlertTriangle className="w-4 h-4 text-[#ffb4ab] animate-pulse flex-shrink-0" />
            <span>
              <strong>EMERGENCY SOS BROADCAST ACTIVE:</strong> Transmitted latitude {location.lat?.toFixed(5)}°, longitude {location.lng?.toFixed(5)}° to SDMA Incident Command & NDRF Unit 02.
            </span>
          </div>
          <span className="text-[10px] text-[#ffb4ab] uppercase font-bold">Priority 1 Ingress</span>
        </div>
      )}

      {/* SIMULATED FIELD TEST BUTTONS */}
      <div className="mt-4 p-3 bg-[#141b2b] rounded border border-[#3d494c]/40 flex flex-col md:flex-row md:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-[#4cd7f6]" />
          <span className="text-xs text-[#bcc9cd] font-bold uppercase">
            Simulate Field Positions Along Corridor:
          </span>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {presets.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => onSelectPreset(preset.id)}
              className={`px-2.5 py-1 rounded text-xs transition-all border ${
                location.isSimulated && location.lat === preset.lat
                  ? 'bg-[#06b6d4] text-[#003640] border-[#06b6d4] font-bold shadow-sm'
                  : 'bg-[#070e1d] text-[#bcc9cd] border-[#3d494c]/40 hover:text-[#dce2f7] hover:border-[#4cd7f6]/50'
              }`}
            >
              {preset.name.split(' (')[0]}
            </button>
          ))}
        </div>
      </div>

      {/* CURRENT PRESENCE AREA & TERRITORIAL OCCUPANCY CARD */}
      {location.enabled && location.presenceArea && (
        <div className="mt-4 p-5 bg-[#141b2b] rounded-lg border border-[#4cd7f6]/50 shadow-2xl relative overflow-hidden">
          {/* Subtle Ambient Background Gradient */}
          <div className={`absolute top-0 right-0 w-96 h-96 rounded-full blur-3xl pointer-events-none opacity-20 ${
            location.presenceArea.hazardClassification === 'RED_RUNOUT_ZONE'
              ? 'bg-red-500'
              : location.presenceArea.hazardClassification === 'AMBER_BUFFER_ZONE'
              ? 'bg-amber-500'
              : 'bg-cyan-500'
          }`} />

          {/* Card Top Strip */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#3d494c]/40 relative z-10">
            <div className="flex items-center gap-2">
              <span className="relative flex h-3 w-3">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                  location.presenceArea.hazardClassification === 'RED_RUNOUT_ZONE' ? 'bg-[#EF4444]' : 'bg-[#4cd7f6]'
                }`} />
                <span className={`relative inline-flex rounded-full h-3 w-3 ${
                  location.presenceArea.hazardClassification === 'RED_RUNOUT_ZONE' ? 'bg-[#EF4444]' : 'bg-[#4cd7f6]'
                }`} />
              </span>
              <span className="text-xs font-mono-data uppercase font-bold text-[#4cd7f6] tracking-wider">
                Area Where You Are Currently Present
              </span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono-data ${
                location.presenceArea.hazardClassification === 'RED_RUNOUT_ZONE'
                  ? 'bg-[#a40217]/30 text-[#ffdad6] border border-[#ffb4ab]'
                  : location.presenceArea.hazardClassification === 'AMBER_BUFFER_ZONE'
                  ? 'bg-[#ffb95f]/20 text-[#ffb95f] border border-[#ffb95f]'
                  : 'bg-[#22c55e]/20 text-[#86efac] border border-[#22c55e]/50'
              }`}>
                {location.presenceArea.zoneCode}
              </span>
            </div>

            {onNavigateToMap && (
              <button
                type="button"
                onClick={onNavigateToMap}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#06b6d4]/20 hover:bg-[#06b6d4]/30 text-[#4cd7f6] border border-[#4cd7f6]/60 text-xs font-mono-data font-bold transition-all self-start sm:self-auto shadow-sm"
              >
                <Crosshair className="w-3.5 h-3.5" />
                <span>View Highlighted Area on 3D GIS Map</span>
              </button>
            )}
          </div>

          {/* Area Hero Content & Tactical Vector Map */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 mt-4 relative z-10">
            {/* Left 7 cols: Area Telemetry & Directives */}
            <div className="lg:col-span-7 flex flex-col justify-between gap-4">
              <div>
                <div className="text-[11px] font-mono-data uppercase text-[#869397] tracking-wider">
                  IDENTIFIED FIELD SECTOR & GEOLOGICAL TERRAIN
                </div>
                <h2 className="text-xl md:text-2xl font-headline font-bold text-[#ffffff] tracking-wide mt-1">
                  {location.presenceArea.areaName}
                </h2>
                <div className="flex items-center gap-2 flex-wrap text-xs text-[#bcc9cd] font-mono-data mt-1.5">
                  <span className="text-[#4cd7f6] font-semibold">{location.presenceArea.subSector}</span>
                  <span className="text-[#3d494c]">|</span>
                  <span>Near: <strong className="text-[#dce2f7]">{location.presenceArea.landmarkNear}</strong></span>
                </div>
              </div>

              {/* Badges Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                <div className="p-2.5 bg-[#070e1d] rounded border border-[#3d494c]/40 flex flex-col">
                  <span className="text-[10px] text-[#869397] uppercase">Presence Footprint</span>
                  <span className="text-sm font-bold text-[#4cd7f6] font-mono-data mt-0.5">
                    ±{location.presenceArea.radiusMeters}m Radius
                  </span>
                  <span className="text-[9px] text-[#869397]">
                    ~{Math.round(Math.PI * Math.pow(location.presenceArea.radiusMeters, 2))} m² bounded
                  </span>
                </div>

                <div className="p-2.5 bg-[#070e1d] rounded border border-[#3d494c]/40 flex flex-col">
                  <span className="text-[10px] text-[#869397] uppercase">Elevation (MSL)</span>
                  <span className="text-sm font-bold text-[#dce2f7] font-mono-data mt-0.5 flex items-center gap-1">
                    <Mountain className="w-3.5 h-3.5 text-[#4cd7f6]" />
                    {location.presenceArea.elevationMeters} m
                  </span>
                  <span className="text-[9px] text-[#869397]">Barometric / GNSS</span>
                </div>

                <div className="p-2.5 bg-[#070e1d] rounded border border-[#3d494c]/40 flex flex-col">
                  <span className="text-[10px] text-[#869397] uppercase">Distance to Rupture</span>
                  <span className="text-sm font-bold text-[#ffb4ab] font-mono-data mt-0.5">
                    {location.distanceToActiveHazardKm !== null ? `${location.distanceToActiveHazardKm.toFixed(2)} km` : '0.12 km'}
                  </span>
                  <span className="text-[9px] text-[#869397]">To Main Slip Crown</span>
                </div>
              </div>

              {/* Surface Geology Note */}
              <div className="p-2.5 bg-[#070e1d] rounded border border-[#3d494c]/40 flex items-start gap-2">
                <Activity className="w-4 h-4 text-[#ffb95f] flex-shrink-0 mt-0.5" />
                <div className="text-xs">
                  <span className="text-[10px] text-[#869397] uppercase font-bold block">Geotechnical Substratum:</span>
                  <span className="text-[#dce2f7] font-body">{location.presenceArea.terrainType}</span>
                </div>
              </div>

              {/* Egress Action Directives */}
              <div className="p-3 bg-[#070e1d] rounded border border-[#3d494c]/40 flex flex-col gap-2">
                <div className="flex items-center gap-2 text-xs font-bold text-[#ffdad6]">
                  <AlertTriangle className="w-4 h-4 text-[#ffb4ab] flex-shrink-0" />
                  <span className="uppercase text-[11px] tracking-wider">Tactical Action in This Area:</span>
                </div>
                <p className="text-xs text-[#dce2f7] font-body pl-6 leading-relaxed">
                  {location.presenceArea.immediateAction}
                </p>
                <div className="pl-6 pt-1 flex items-center gap-2 text-xs font-mono-data text-[#86efac]">
                  <Navigation className="w-3.5 h-3.5 flex-shrink-0" />
                  <span><strong>Safe Exit Vector:</strong> {location.presenceArea.safeExitVector}</span>
                </div>
              </div>
            </div>

            {/* Right 5 cols: Dedicated SVG Radar Representation of the Presence Area */}
            <div className="lg:col-span-5 bg-[#070e1d] rounded-lg border border-[#3d494c]/50 p-3 flex flex-col items-center justify-center relative min-h-[260px]">
              <div className="w-full flex items-center justify-between text-[10px] font-mono-data text-[#869397] mb-2 px-1">
                <span className="flex items-center gap-1 text-[#4cd7f6]">
                  <Crosshair className="w-3 h-3" />
                  AREA BOUNDARY SCHEMATIC
                </span>
                <span>GRID: 250m x 250m</span>
              </div>

              {/* SVG Area Vector Radar */}
              <div className="w-full h-56 relative flex items-center justify-center">
                <svg
                  viewBox="0 0 300 240"
                  className="w-full h-full"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <defs>
                    <pattern id="miniPresenceHatch" width="8" height="8" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
                      <line
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="8"
                        stroke={location.insideGeofence ? 'rgba(239,68,68,0.35)' : 'rgba(76,215,246,0.35)'}
                        strokeWidth="1.5"
                      />
                    </pattern>
                  </defs>

                  {/* Concentric radar rings */}
                  <circle cx="150" cy="120" r="100" fill="none" stroke="rgba(61,73,76,0.4)" strokeWidth="1" />
                  <circle cx="150" cy="120" r="65" fill="none" stroke="rgba(61,73,76,0.6)" strokeWidth="1" />
                  <circle cx="150" cy="120" r="30" fill="none" stroke="rgba(61,73,76,0.4)" strokeWidth="1" />
                  
                  {/* Crosshairs */}
                  <line x1="20" y1="120" x2="280" y2="120" stroke="rgba(61,73,76,0.5)" strokeWidth="1" strokeDasharray="3 3" />
                  <line x1="150" y1="20" x2="150" y2="220" stroke="rgba(61,73,76,0.5)" strokeWidth="1" strokeDasharray="3 3" />

                  {/* Highway corridor slice */}
                  <path d="M40,200 Q140,130 260,60" fill="none" stroke="#ffb95f" strokeWidth="4" opacity="0.75" />
                  <text x="250" y="50" fill="#ffb95f" fontSize="7.5" fontFamily="JetBrains Mono" fontWeight="bold">NH-10 AXIS</text>

                  {/* Presence Area Polygon Footprint */}
                  <polygon
                    points="95,75 185,60 225,125 195,185 110,180 75,120"
                    fill="url(#miniPresenceHatch)"
                    stroke={location.insideGeofence ? '#EF4444' : '#4cd7f6'}
                    strokeWidth="2"
                    strokeDasharray="6 4"
                  />

                  {/* Area label inside polygon */}
                  <text
                    x="150"
                    y="78"
                    fill={location.insideGeofence ? '#ffb4ab' : '#4cd7f6'}
                    fontSize="8"
                    fontFamily="JetBrains Mono"
                    fontWeight="bold"
                    textAnchor="middle"
                  >
                    [ BOUNDED PRESENCE ZONE ]
                  </text>

                  {/* Safe Exit Vector Arrow */}
                  <line
                    x1="150"
                    y1="120"
                    x2="85"
                    y2="45"
                    stroke="#22c55e"
                    strokeWidth="2.5"
                    strokeDasharray="4 2"
                  />
                  <polygon points="85,45 92,54 80,51" fill="#22c55e" />
                  <text x="75" y="38" fill="#22c55e" fontSize="8" fontFamily="JetBrains Mono" fontWeight="bold">
                    SAFE EGRESS
                  </text>

                  {/* Active Hazard Rupture Crown Marker (if inside) */}
                  <circle cx="210" cy="90" r="12" fill="rgba(239,68,68,0.2)" stroke="#EF4444" strokeWidth="1.5" />
                  <circle cx="210" cy="90" r="3" fill="#EF4444" />
                  <text x="226" y="94" fill="#EF4444" fontSize="7.5" fontFamily="JetBrains Mono" fontWeight="bold">
                    SLIP CROWN
                  </text>

                  {/* YOU coordinate marker */}
                  <circle cx="150" cy="120" r="16" fill="none" stroke={location.insideGeofence ? '#EF4444' : '#4cd7f6'} strokeWidth="1.5" className="animate-ping" />
                  <circle cx="150" cy="120" r="7" fill={location.insideGeofence ? '#EF4444' : '#4cd7f6'} />
                  <circle cx="150" cy="120" r="2.5" fill="#ffffff" />
                  
                  {/* YOU badge */}
                  <rect x="120" y="132" width="60" height="15" rx="2" fill="#070e1d" stroke={location.insideGeofence ? '#EF4444' : '#4cd7f6'} strokeWidth="1" />
                  <text x="150" y="143" fill="#ffffff" fontSize="8" fontFamily="JetBrains Mono" fontWeight="bold" textAnchor="middle">
                    YOU (HERE)
                  </text>
                </svg>
              </div>

              {/* Bottom footprint summary */}
              <div className="w-full pt-2 mt-1 border-t border-[#3d494c]/30 flex items-center justify-between text-[10px] font-mono-data text-[#bcc9cd]">
                <span>Status: <strong className={location.insideGeofence ? 'text-[#ffb4ab]' : 'text-[#86efac]'}>{location.proximityStatus}</strong></span>
                <span>Active Egress: <strong className="text-[#22c55e]">Lateral Ridge</strong></span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MAIN GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-4">
        {/* COLUMN 1: GNSS TELEMETRY HUD */}
        <div className="bg-[#141b2b] rounded border border-[#3d494c]/40 p-4 flex flex-col gap-3">
          <div className="flex items-center justify-between pb-2 border-b border-[#3d494c]/30">
            <span className="text-xs text-[#869397] uppercase font-bold flex items-center gap-1.5">
              <Crosshair className="w-4 h-4 text-[#4cd7f6]" />
              GNSS Spatial Telemetry
            </span>
            <span className="text-[10px] text-[#4cd7f6]">WGS84 • L1/L5</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="p-2.5 bg-[#070e1d] rounded border border-[#3d494c]/30 flex flex-col">
              <span className="text-[10px] text-[#869397] uppercase">Latitude</span>
              <span className="text-base text-[#dce2f7] font-bold">
                {location.lat ? `${location.lat.toFixed(5)}° N` : 'Acquiring...'}
              </span>
            </div>

            <div className="p-2.5 bg-[#070e1d] rounded border border-[#3d494c]/30 flex flex-col">
              <span className="text-[10px] text-[#869397] uppercase">Longitude</span>
              <span className="text-base text-[#dce2f7] font-bold">
                {location.lng ? `${location.lng.toFixed(5)}° E` : 'Acquiring...'}
              </span>
            </div>

            <div className="p-2.5 bg-[#070e1d] rounded border border-[#3d494c]/30 flex flex-col">
              <span className="text-[10px] text-[#869397] uppercase">Elevation (MSL)</span>
              <span className="text-base text-[#4cd7f6] font-bold flex items-center gap-1">
                <Mountain className="w-3.5 h-3.5" />
                {location.altitude ? `${location.altitude} m` : '1,390 m'}
              </span>
            </div>

            <div className="p-2.5 bg-[#070e1d] rounded border border-[#3d494c]/30 flex flex-col">
              <span className="text-[10px] text-[#869397] uppercase">GNSS Accuracy</span>
              <span className="text-base text-[#bcc9cd] font-bold">
                {location.accuracy ? `± ${location.accuracy} m` : '± 8 m (DGPS)'}
              </span>
            </div>

            <div className="p-2.5 bg-[#070e1d] rounded border border-[#3d494c]/30 flex flex-col">
              <span className="text-[10px] text-[#869397] uppercase">Ground Velocity</span>
              <span className="text-base text-[#ffb95f] font-bold flex items-center gap-1">
                <Gauge className="w-3.5 h-3.5" />
                {location.speed ? `${location.speed} km/h` : '0.0 km/h'}
              </span>
            </div>

            <div className="p-2.5 bg-[#070e1d] rounded border border-[#3d494c]/30 flex flex-col">
              <span className="text-[10px] text-[#869397] uppercase">Heading</span>
              <span className="text-base text-[#bcc9cd] font-bold flex items-center gap-1">
                <Compass className="w-3.5 h-3.5" />
                {location.heading !== null ? `${location.heading}° True` : '068° NNE'}
              </span>
            </div>
          </div>

          {/* SATELLITE FIX BAR */}
          <div className="p-2 bg-[#070e1d] rounded border border-[#3d494c]/30 flex items-center justify-between text-xs text-[#869397]">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#4cd7f6] animate-pulse" />
              <span>Satellites: 14 Locked (Galileo + NavIC)</span>
            </div>
            <span>Dilution: HDOP 0.9</span>
          </div>

          {location.simulationName && (
            <div className="text-[11px] text-[#ffb95f] bg-[#ffb95f]/10 p-2 rounded border border-[#ffb95f]/30">
              Active Simulation: <strong>{location.simulationName}</strong>
            </div>
          )}
        </div>

        {/* COLUMN 2: GEOFENCE HAZARD VECTOR */}
        <div className="bg-[#141b2b] rounded border border-[#3d494c]/40 p-4 flex flex-col gap-3">
          <div className="flex items-center justify-between pb-2 border-b border-[#3d494c]/30">
            <span className="text-xs text-[#869397] uppercase font-bold flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-[#ffb4ab]" />
              Geofence & Rupture Vector
            </span>
            <span className="text-[10px] text-[#869397]">{sector.name}</span>
          </div>

          {/* GEOFENCE STATUS CALLOUT */}
          <div className={`p-3.5 rounded border flex flex-col gap-1.5 ${
            isDanger
              ? 'bg-[#a40217]/20 border-[#a40217] text-[#ffdad6]'
              : isWarning
              ? 'bg-[#ffb95f]/20 border-[#ffb95f] text-[#ffdad6]'
              : 'bg-[#06b6d4]/10 border-[#06b6d4]/40 text-[#dce2f7]'
          }`}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider">
                {isDanger
                  ? 'CRITICAL RUNOUT HAZARD GEOFENCE'
                  : isWarning
                  ? 'WARNING BUFFER ZONE'
                  : 'SAFE ASSEMBLY PERIMETER'}
              </span>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#070e1d]">
                {location.proximityStatus}
              </span>
            </div>
            <div className="text-sm font-bold flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#ffb4ab]" />
              <span>
                {location.distanceToActiveHazardKm !== null
                  ? `${location.distanceToActiveHazardKm.toFixed(2)} km`
                  : '0.12 km'}{' '}
                from Failure Front ({sector.corridor})
              </span>
            </div>
            <p className="text-xs text-[#bcc9cd] font-body mt-1">
              {isDanger
                ? 'CRITICAL: You are inside the projected debris avalanche perimeter. Evacuate laterally perpendicular to the ravine.'
                : isWarning
                ? 'CAUTION: Approaching active failure sector. Prepare to halt vehicular movement if road barriers close.'
                : 'Position is beyond primary runout trajectories. Safe for personnel staging and logistics.'}
            </p>
          </div>

          {/* COMPASS BEARING TO HAZARD */}
          <div className="p-3 bg-[#070e1d] rounded border border-[#3d494c]/30 flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-[10px] text-[#869397] uppercase">Bearing to Rupture Crown</span>
              <span className="text-lg text-[#4cd7f6] font-bold">
                {location.bearingToActiveHazardDeg !== null
                  ? `${location.bearingToActiveHazardDeg}° Azimuth`
                  : '042° NE'}
              </span>
              <span className="text-[10px] text-[#869397]">Escape Angle: 90° Lateral</span>
            </div>

            {/* Tactical Compass Dial */}
            <div className="w-16 h-16 rounded-full border-2 border-[#3d494c] flex items-center justify-center relative bg-[#141b2b]">
              <span className="absolute top-1 text-[8px] text-[#869397] font-bold">N</span>
              <span className="absolute right-1 text-[8px] text-[#869397] font-bold">E</span>
              <span className="absolute bottom-1 text-[8px] text-[#869397] font-bold">S</span>
              <span className="absolute left-1 text-[8px] text-[#869397] font-bold">W</span>
              <div 
                className="w-1 h-7 bg-[#ffb4ab] rounded-full transition-transform duration-500 origin-bottom"
                style={{ transform: `rotate(${location.bearingToActiveHazardDeg || 42}deg)` }}
              />
              <div className="w-2 h-2 rounded-full bg-[#4cd7f6] z-10" />
            </div>
          </div>

          {/* NEAREST ASSEMBLY POINTS */}
          <div className="flex flex-col gap-1.5 text-xs">
            <span className="text-[10px] text-[#869397] uppercase font-bold">
              Designated Safety Havens:
            </span>
            <div className="p-2 bg-[#070e1d] rounded flex justify-between items-center border border-[#3d494c]/20">
              <span>Rangpo Govt High School (Upland Ridge)</span>
              <span className="text-[#4cd7f6] font-bold">1.4 km East</span>
            </div>
            <div className="p-2 bg-[#070e1d] rounded flex justify-between items-center border border-[#3d494c]/20">
              <span>BRO Base Camp 14 (Helipad Staging)</span>
              <span className="text-[#ffb95f] font-bold">4.2 km North</span>
            </div>
          </div>
        </div>

        {/* COLUMN 3: AI FIELD SAFETY BRIEFING */}
        <div className="bg-[#141b2b] rounded border border-[#3d494c]/40 p-4 flex flex-col gap-3">
          <div className="flex items-center justify-between pb-2 border-b border-[#3d494c]/30">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#4cd7f6]" />
              <span className="text-xs text-[#dce2f7] uppercase font-bold">
                AI Field Safety Briefing
              </span>
            </div>
            <span className="px-1.5 py-0.5 rounded bg-[#06b6d4]/20 text-[#4cd7f6] text-[9px] font-bold">
              GEMINI FLASH
            </span>
          </div>

          {briefing ? (
            <div className="flex flex-col gap-2.5 text-xs animate-in fade-in duration-300">
              <div className="p-2.5 rounded bg-[#070e1d] border border-[#3d494c]/30">
                <span className="text-[9px] text-[#869397] uppercase font-bold block mb-1">
                  Tactical Status:
                </span>
                <span className={`font-bold text-sm ${
                  briefing.safetyStatus === 'IMMEDIATE EVACUATION'
                    ? 'text-[#ffb4ab]'
                    : briefing.safetyStatus === 'HEIGHTENED ALERT'
                    ? 'text-[#ffb95f]'
                    : 'text-[#4cd7f6]'
                }`}>
                  {briefing.safetyStatus}
                </span>
                <p className="text-[#dce2f7] text-xs font-body mt-1 leading-relaxed">
                  {briefing.hazardProximitySummary}
                </p>
              </div>

              <div className="p-2.5 rounded bg-[#070e1d] border border-[#3d494c]/30">
                <span className="text-[9px] text-[#869397] uppercase font-bold block mb-1">
                  Optimal Escape Vector:
                </span>
                <span className="text-[#ffb95f] leading-snug">{briefing.escapeVector}</span>
              </div>

              <div className="p-2.5 rounded bg-[#070e1d] border border-[#3d494c]/30">
                <span className="text-[9px] text-[#869397] uppercase font-bold block mb-1">
                  Nearest Shelter:
                </span>
                <span className="text-[#4cd7f6] leading-snug">{briefing.nearestShelterEstimate}</span>
              </div>

              {briefing.actionableSteps && briefing.actionableSteps.length > 0 && (
                <div className="flex flex-col gap-1">
                  <span className="text-[9px] text-[#869397] uppercase font-bold">
                    Field Action Checklist:
                  </span>
                  <ul className="space-y-1 text-[#bcc9cd] text-[11px] list-disc pl-4 font-body">
                    {briefing.actionableSteps.map((step, idx) => (
                      <li key={idx}>{step}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <div className="p-6 bg-[#070e1d] rounded border border-[#3d494c]/20 flex flex-col items-center justify-center text-center gap-3">
              <Sparkles className="w-8 h-8 text-[#4cd7f6] opacity-60" />
              <div className="flex flex-col gap-1">
                <span className="text-xs font-bold text-[#dce2f7]">
                  Instant AI Geohazard Analysis Available
                </span>
                <p className="text-[11px] text-[#869397] font-body max-w-xs">
                  Click below to synthesize real-time terrain geometry, live precipitation, and escape routes calibrated to your coordinates.
                </p>
              </div>
              <button
                type="button"
                onClick={fetchAiFieldBriefing}
                disabled={isBriefingLoading}
                className="px-4 py-2 bg-[#06b6d4] hover:bg-[#06b6d4]/90 text-[#00424f] rounded text-xs font-bold uppercase transition-all shadow-md active:scale-95"
              >
                {isBriefingLoading ? 'Synthesizing...' : 'Generate AI Field Briefing'}
              </button>
            </div>
          )}

          {onOpenCapModal && (
            <button
              type="button"
              onClick={onOpenCapModal}
              className="mt-auto p-2 bg-[#191f2f] hover:bg-[#232a3a] text-[#ffb4ab] border border-[#a40217]/40 rounded text-xs uppercase font-bold flex items-center justify-center gap-2 transition-colors"
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Forward Location to CAP Broadcast</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
