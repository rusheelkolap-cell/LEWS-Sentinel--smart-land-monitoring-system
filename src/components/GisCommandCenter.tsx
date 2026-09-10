import React, { useState, useEffect } from 'react';
import { SectorConfig, SlopeNode, ScreenType, LiveLocationState } from '../types';
import { SLOPE_NODES } from '../data/mockTacticalData';
import { 
  Activity, 
  Droplets, 
  CloudRain, 
  Radio, 
  ShieldAlert, 
  ChevronRight, 
  Layers, 
  TrendingUp, 
  Truck, 
  Home, 
  PhoneCall, 
  Maximize2,
  Minimize2,
  Compass,
  AlertTriangle,
  Crosshair,
  BrainCircuit,
  Sparkles,
  MapPin,
  FileDown
} from 'lucide-react';

interface GisCommandCenterProps {
  sector: SectorConfig;
  onNavigateToRiskEngine: () => void;
  onOpenCapModal: () => void;
  onTriggerSirens: () => void;
  sirenActive: boolean;
  location?: LiveLocationState;
  onToggleAiCopilot?: () => void;
  onNavigateToLiveLocation?: () => void;
  onOpenReportModal?: () => void;
}

export const GisCommandCenter: React.FC<GisCommandCenterProps> = ({
  sector,
  onNavigateToRiskEngine,
  onOpenCapModal,
  onTriggerSirens,
  sirenActive,
  location,
  onToggleAiCopilot,
  onNavigateToLiveLocation,
  onOpenReportModal,
}) => {
  const [activePerspective, setActivePerspective] = useState<'ortho' | '3d-slice' | 'cross-sec'>('3d-slice');
  const [viewMode, setViewMode] = useState<'split' | 'map'>('split');
  const [selectedHex, setSelectedHex] = useState<string>(sector.h3HexId);
  const [selectedNode, setSelectedNode] = useState<string>('SN-SLOPE-089');
  const [overlays, setOverlays] = useState({
    h3Grid: true,
    borehole: true,
    insar: true,
    radar: false,
  });
  const [countdown, setCountdown] = useState(860); // 14m 20s
  const [broStaged, setBroStaged] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);

  // Live countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 860));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatCountdown = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}m ${s < 10 ? '0' : ''}${s}s`;
  };

  const handleBroStaging = () => {
    setBroStaged(true);
    setTimeout(() => setBroStaged(false), 3000);
  };

  // Camera settings based on perspective
  const cameraSettings = {
    ortho: { pitch: '0°', bearing: '0°', alt: '2,400m MSL', transform: 'scale(1)' },
    '3d-slice': { pitch: '58°', bearing: '32°', alt: '1,840m MSL', transform: 'perspective(1000px) rotateX(25deg) rotateZ(-12deg)' },
    'cross-sec': { pitch: '82°', bearing: '90°', alt: '1,120m MSL', transform: 'perspective(1000px) rotateX(48deg) rotateZ(18deg)' },
  }[activePerspective];

  return (
    <div className="flex flex-col w-full min-h-screen bg-[#0c1322]">
      {/* SIMPLIFIED TOP CRITICAL HAZARD BANNER */}
      <div className="w-full bg-[#a40217] text-[#ffdad6] px-4 py-2.5 shadow-md relative border-b border-[#ffb4ab]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-3 h-3 rounded-full bg-white animate-ping flex-shrink-0" />
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-sm md:text-base text-white tracking-tight">
                CRITICAL WARNING: Rapid Debris Flow Imminent along {sector.corridor}
              </span>
              <span className="px-2 py-0.5 bg-[#070e1d] text-[#ffdad6] font-mono-data text-xs rounded border border-[#ffb4ab]/40 font-semibold">
                Est. Lead Time: &lt; {formatCountdown(countdown)} • Failure Risk: 89%
              </span>
            </div>
            <p className="text-xs text-[#ffdad6]/80 truncate font-normal">
              Automated traffic diversion active via Melli–Jorethang Bypass • Egress routes highlighted
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            id="btn-trigger-sirens"
            type="button"
            onClick={onTriggerSirens}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition-all shadow-sm active:scale-95 ${
              sirenActive
                ? 'bg-[#690005] text-[#ffdad6] border border-[#ffb4ab] animate-pulse'
                : 'bg-[#93000a] text-white hover:bg-[#93000a]/90'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5 text-[#ffdad6]" />
            <span>{sirenActive ? 'Sirens Active (110dB)' : 'Sound Siren'}</span>
          </button>

          <button
            id="btn-bro-staging"
            type="button"
            onClick={handleBroStaging}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#070e1d] hover:bg-[#141b2b] text-[#dce2f7] rounded-lg text-xs font-semibold uppercase transition-all border border-[#3d494c]/50"
          >
            <Truck className="w-3.5 h-3.5 text-[#ffb95f]" />
            <span>{broStaged ? 'DISPATCHED' : 'BRO Rescue'}</span>
          </button>

          <button
            id="btn-open-cap-modal"
            type="button"
            onClick={onOpenCapModal}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#070e1d] hover:bg-[#141b2b] text-[#4cd7f6] rounded-lg text-xs font-semibold uppercase transition-all border border-[#4cd7f6]/40 shadow-sm"
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Dispatch CAP</span>
          </button>
        </div>
      </div>

      {/* 3-COLUMN WORKSPACE: LEFT TELEMETRY | CENTER 3D DECK.GL CANVAS | RIGHT PREDICTIVE AI DRAWER */}
      <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-0 flex-1 min-h-[calc(100vh-10.5rem)]">
        
        {/* ========================================================= */}
        {/* COLUMN 1: SUBSURFACE MESH TELEMETRY (3 Cols)              */}
        {/* ========================================================= */}
        <aside className={`${viewMode === 'map' ? 'hidden' : 'lg:col-span-3'} bg-[#070e1d] p-3 flex flex-col gap-2.5 border-r border-[#3d494c]/30 shadow-2xl overflow-y-auto max-h-[calc(100vh-10.5rem)]`}>
          {/* Panel Header */}
          <div className="flex items-center justify-between bg-[#141b2b] p-2 rounded border border-[#3d494c]/40">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-[#4cd7f6]" />
              <span className="font-headline text-xs font-bold text-[#dce2f7] uppercase tracking-wide">
                Subsurface Telemetry
              </span>
            </div>
            <div className="flex items-center gap-1.5 font-mono-data text-[10px] text-[#4cd7f6]">
              <span className="w-2 h-2 rounded-full bg-[#4cd7f6] animate-pulse" />
              <span>GW-NE-NH10-04</span>
            </div>
          </div>

          {/* Telemetry Cards */}
          <div className="flex flex-col gap-2">
            {/* Card 1: Angular Tilt Velocity */}
            <div className="bg-[#141b2b] p-2.5 rounded relative overflow-hidden border border-[#3d494c]/40 group">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#ffb4ab]" />
              <div className="flex items-center justify-between mb-1 pl-1">
                <span className="text-[10px] font-mono-data text-[#869397] uppercase">
                  Angular Tilt Velocity (Δθ/Δt)
                </span>
                <span className="px-1.5 py-0.5 bg-[#93000a] text-[#ffdad6] font-mono-data text-[9px] rounded uppercase font-bold">
                  BREACH &gt; 0.05°
                </span>
              </div>
              <div className="flex items-baseline justify-between pl-1">
                <div className="flex items-baseline gap-1">
                  <span className="font-mono-data text-xl text-[#ffb4ab] font-bold">0.084</span>
                  <span className="font-mono-data text-xs text-[#869397]">°/min</span>
                </div>
                <span className="font-mono-data text-[11px] text-[#ffb4ab] font-semibold flex items-center gap-0.5">
                  ↑ +320% vs baseline
                </span>
              </div>
              {/* Sparkline */}
              <div className="mt-1 h-9 w-full">
                <svg className="w-full h-full text-[#ffb4ab]" viewBox="0 0 200 36" fill="none" preserveAspectRatio="none">
                  <path d="M0,32 Q30,30 60,28 T120,22 T150,14 T180,6 T200,2" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                  <path d="M0,32 Q30,30 60,28 T120,22 T150,14 T180,6 T200,2 L200,36 L0,36 Z" fill="currentColor" fillOpacity="0.15" />
                  <circle cx="200" cy="2" r="3.5" fill="currentColor" className="animate-ping" />
                </svg>
              </div>
              <div className="flex justify-between items-center text-[#869397] font-mono-data text-[9px] mt-1 pl-1">
                <span>T-60m: 0.012°/m</span>
                <span>MEMS Triaxial X/Y/Z filtered</span>
              </div>
            </div>

            {/* Card 2: Pore Water Pressure */}
            <div className="bg-[#141b2b] p-2.5 rounded relative overflow-hidden border border-[#3d494c]/40">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#ffb95f]" />
              <div className="flex items-center justify-between mb-1 pl-1">
                <span className="text-[10px] font-mono-data text-[#869397] uppercase">
                  Pore Water Pressure (PWP)
                </span>
                <span className="font-mono-data text-[10px] text-[#ffb95f] font-bold">
                  94% SATURATED
                </span>
              </div>
              <div className="flex items-baseline justify-between pl-1">
                <div className="flex items-baseline gap-1">
                  <span className="font-mono-data text-xl text-[#ffb95f] font-bold">42.6</span>
                  <span className="font-mono-data text-xs text-[#869397]">kPa</span>
                </div>
                <span className="font-mono-data text-[11px] text-[#ffb95f] font-semibold">+14.2 kPa / 3h</span>
              </div>
              <div className="w-full bg-[#2e3545] h-1.5 rounded mt-1.5 overflow-hidden">
                <div className="bg-[#ffb95f] h-full w-[94%]" />
              </div>
              <div className="flex justify-between items-center text-[#869397] font-mono-data text-[9px] mt-1 pl-1">
                <span>Piezometer Depth: -8.5m</span>
                <span>Hydraulic Head: 4.34m</span>
              </div>
            </div>

            {/* Card 3: Antecedent Precipitation */}
            <div className="bg-[#141b2b] p-2.5 rounded relative overflow-hidden border border-[#3d494c]/40">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#4cd7f6]" />
              <div className="flex items-center justify-between mb-1 pl-1">
                <span className="text-[10px] font-mono-data text-[#869397] uppercase">
                  Antecedent Rain (API 72h)
                </span>
                <span className="font-mono-data text-[10px] text-[#4cd7f6] font-bold">
                  48.0 mm/hr CLOUDBURST
                </span>
              </div>
              <div className="flex items-baseline justify-between pl-1">
                <div className="flex items-baseline gap-1">
                  <span className="font-mono-data text-xl text-[#4cd7f6] font-bold">142.8</span>
                  <span className="font-mono-data text-xs text-[#869397]">mm / 72h</span>
                </div>
                <span className="font-mono-data text-[10px] text-[#4cd7f6]">IMD Doppler Correlated</span>
              </div>
              <div className="mt-1 h-7 w-full">
                <svg className="w-full h-full text-[#4cd7f6]" viewBox="0 0 200 28" fill="none">
                  <path d="M0,26 L25,24 L50,22 L75,18 L100,15 L125,12 L150,8 L175,4 L200,1" stroke="currentColor" strokeWidth="2" />
                  <path d="M0,26 L25,24 L50,22 L75,18 L100,15 L125,12 L150,8 L175,4 L200,1 L200,28 L0,28 Z" fill="currentColor" fillOpacity="0.2" />
                </svg>
              </div>
            </div>

            {/* Card 4: RMS Vibration */}
            <div className="bg-[#141b2b] p-2 rounded relative overflow-hidden border border-[#3d494c]/40">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#a40217]" />
              <div className="flex items-center justify-between mb-0.5 pl-1">
                <span className="text-[10px] font-mono-data text-[#869397] uppercase">
                  RMS Vibration (Shear Signature)
                </span>
                <span className="font-mono-data text-[10px] text-[#ffb3ad]">Kalman Filtered</span>
              </div>
              <div className="flex items-baseline justify-between pl-1">
                <div className="flex items-baseline gap-1">
                  <span className="font-mono-data text-lg text-[#dce2f7] font-bold">0.062</span>
                  <span className="font-mono-data text-xs text-[#869397]">g</span>
                </div>
                <span className="font-mono-data text-[10px] text-[#ffb4ab] font-bold">Micro-Shear Active</span>
              </div>
            </div>
          </div>

          {/* Gateway Node Diagnostic Box */}
          <div className="bg-[#141b2b] p-2.5 rounded flex flex-col gap-1.5 border border-[#3d494c]/40 text-xs font-mono-data">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-[#869397] uppercase font-bold">Gateway Node Health</span>
              <span className="text-[10px] text-[#4cd7f6] font-bold">IP68 AUTONOMOUS</span>
            </div>
            <div className="grid grid-cols-2 gap-1.5 text-[11px] mt-0.5">
              <div className="bg-[#070e1d] p-1.5 rounded flex flex-col border border-[#3d494c]/20">
                <span className="text-[9px] text-[#869397]">Solar LiFePO4</span>
                <span className="text-[#4cd7f6] font-bold">3.62V (98%)</span>
              </div>
              <div className="bg-[#070e1d] p-1.5 rounded flex flex-col border border-[#3d494c]/20">
                <span className="text-[9px] text-[#869397]">LoRaWAN RSSI</span>
                <span className="text-[#dce2f7] font-bold">-84 dBm</span>
              </div>
              <div className="bg-[#070e1d] p-1.5 rounded flex flex-col border border-[#3d494c]/20">
                <span className="text-[9px] text-[#869397]">Backhaul 4G/LTE</span>
                <span className="text-[#4cd7f6] font-bold">CARRIER UP</span>
              </div>
              <div className="bg-[#070e1d] p-1.5 rounded flex flex-col border border-[#3d494c]/20">
                <span className="text-[9px] text-[#869397]">Iridium Fallback</span>
                <span className="text-[#ffb95f] font-bold">STANDBY</span>
              </div>
            </div>
            <div className="flex items-center justify-between text-[#869397] text-[10px] pt-1 border-t border-[#3d494c]/20">
              <span>Flash Buffer:</span>
              <span className="text-[#dce2f7] font-bold">30-Day Ring (0 dropped)</span>
            </div>
          </div>

          {/* In-situ Slope Array Node Manifest */}
          <div className="flex flex-col gap-1 mt-auto">
            <span className="text-[10px] font-mono-data text-[#869397] uppercase font-bold">
              Slope Array Node Manifest
            </span>
            <div className="flex flex-col gap-1 bg-[#141b2b] p-1.5 rounded border border-[#3d494c]/40 font-mono-data text-[11px]">
              {SLOPE_NODES.map((node) => {
                const isSelected = selectedNode === node.id;
                return (
                  <button
                    key={node.id}
                    onClick={() => setSelectedNode(node.id)}
                    className={`flex items-center justify-between py-1 px-2 rounded transition-all text-left ${
                      isSelected
                        ? 'bg-[#232a3a] border border-[#4cd7f6]/50'
                        : 'bg-[#070e1d] hover:bg-[#191f2f]'
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`w-2 h-2 rounded-full ${
                          node.status === 'BURST'
                            ? 'bg-[#ffb4ab] animate-ping'
                            : node.status === 'WATCH'
                            ? 'bg-[#ffb95f]'
                            : 'bg-[#4cd7f6]'
                        }`}
                      />
                      <span
                        className={`font-bold ${
                          node.status === 'BURST'
                            ? 'text-[#ffb4ab]'
                            : node.status === 'WATCH'
                            ? 'text-[#ffb95f]'
                            : 'text-[#dce2f7]'
                        }`}
                      >
                        {node.name}
                      </span>
                    </div>
                    <span
                      className={`text-[9px] px-1 rounded ${
                        node.status === 'BURST'
                          ? 'bg-[#a40217] text-[#ffdad6] font-bold'
                          : node.status === 'WATCH'
                          ? 'text-[#ffb95f]'
                          : 'text-[#4cd7f6]'
                      }`}
                    >
                      {node.status}
                    </span>
                    <span className="text-[#869397] text-[10px]">{node.km}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </aside>

        {/* ========================================================= */}
        {/* COLUMN 2: 3D GEOSPATIAL TERRAIN VIEWPORT (6 Cols or 12 Cols) */}
        {/* ========================================================= */}
        <main className={`${viewMode === 'map' ? 'lg:col-span-12' : 'lg:col-span-6'} relative bg-[#070e1d] flex flex-col overflow-hidden min-h-[560px] select-none border-r border-[#3d494c]/30`}>
          {/* Top HUD Bar with Camera Parameters */}
          <div className="relative z-10 p-3 flex items-start justify-between pointer-events-none gap-2 flex-wrap">
            {/* View Mode & Camera Metric Badge */}
            <div className="pointer-events-auto flex items-center gap-2">
              {/* View Mode Toggle Pill */}
              <div className="bg-[#070e1d]/90 backdrop-blur-md p-1 rounded-lg border border-[#3d494c]/40 flex items-center gap-1 shadow-lg text-xs">
                <button
                  type="button"
                  onClick={() => setViewMode('split')}
                  className={`px-2.5 py-1 rounded text-xs font-semibold transition-all ${
                    viewMode === 'split'
                      ? 'bg-[#4cd7f6] text-[#003640] shadow-sm'
                      : 'text-[#869397] hover:text-[#dce2f7]'
                  }`}
                >
                  Split View
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('map')}
                  className={`px-2.5 py-1 rounded text-xs font-semibold transition-all ${
                    viewMode === 'map'
                      ? 'bg-[#4cd7f6] text-[#003640] shadow-sm'
                      : 'text-[#869397] hover:text-[#dce2f7]'
                  }`}
                >
                  Full Map
                </button>
              </div>

              <div className="hidden sm:flex bg-[#070e1d]/90 backdrop-blur-md p-1.5 px-3 rounded-lg border border-[#3d494c]/40 items-center gap-2.5 shadow-lg text-xs font-mono-data">
                <div className="flex items-center gap-1.5">
                  <Compass className="w-3.5 h-3.5 text-[#4cd7f6]" />
                  <span className="text-xs text-[#dce2f7] font-semibold">
                    3D Terrain
                  </span>
                </div>
                <span className="text-[#3d494c]">|</span>
                <span className="text-[#869397] text-[11px]">PITCH: <strong className="text-[#4cd7f6]">{cameraSettings.pitch}</strong></span>
                <span className="text-[#869397] text-[11px]">ALT: <strong className="text-[#dce2f7]">{cameraSettings.alt}</strong></span>
              </div>
            </div>

            {/* Perspective View Toggles & Zoom */}
            <div className="pointer-events-auto flex items-center gap-1 bg-[#070e1d]/90 backdrop-blur-md p-1 rounded border border-[#3d494c]/40 shadow-lg">
              <button
                type="button"
                onClick={() => setActivePerspective('ortho')}
                className={`px-2 py-1 rounded text-[10px] font-mono-data uppercase font-bold transition-all ${
                  activePerspective === 'ortho'
                    ? 'bg-[#4cd7f6] text-[#003640]'
                    : 'text-[#bcc9cd] hover:text-[#dce2f7] bg-[#141b2b]'
                }`}
              >
                ORTHO
              </button>
              <button
                type="button"
                onClick={() => setActivePerspective('3d-slice')}
                className={`px-2 py-1 rounded text-[10px] font-mono-data uppercase font-bold transition-all ${
                  activePerspective === '3d-slice'
                    ? 'bg-[#4cd7f6] text-[#003640]'
                    : 'text-[#bcc9cd] hover:text-[#dce2f7] bg-[#141b2b]'
                }`}
              >
                3D SLICE
              </button>
              <button
                type="button"
                onClick={() => setActivePerspective('cross-sec')}
                className={`px-2 py-1 rounded text-[10px] font-mono-data uppercase font-bold transition-all ${
                  activePerspective === 'cross-sec'
                    ? 'bg-[#4cd7f6] text-[#003640]'
                    : 'text-[#bcc9cd] hover:text-[#dce2f7] bg-[#141b2b]'
                }`}
              >
                CROSS-SEC
              </button>
              <div className="h-4 w-px bg-[#3d494c] mx-0.5" />
              <button
                type="button"
                onClick={() => setZoomLevel((z) => (z >= 1.4 ? 1 : z + 0.2))}
                className="p-1 rounded text-[#4cd7f6] bg-[#141b2b] hover:bg-[#232a3a]"
                title="Zoom Map"
              >
                {zoomLevel > 1 ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
              </button>

              {/* Export PDF Report Button */}
              {onOpenReportModal && (
                <button
                  type="button"
                  onClick={onOpenReportModal}
                  className="flex items-center gap-1 px-2 py-1 rounded bg-[#141b2b] hover:bg-[#232a3a] text-[#4cd7f6] border border-[#4cd7f6]/40 text-[10px] font-mono-data font-bold uppercase transition-all shadow-sm"
                  title="Export Sector Risk Assessment Report (PDF)"
                >
                  <FileDown className="w-3.5 h-3.5" />
                  <span className="hidden xl:inline">Export PDF</span>
                </button>
              )}

              {/* AI Copilot & Live GPS Quick Access */}
              {onToggleAiCopilot && (
                <button
                  type="button"
                  onClick={onToggleAiCopilot}
                  className="flex items-center gap-1 px-2 py-1 rounded bg-[#06b6d4]/20 hover:bg-[#06b6d4]/30 text-[#4cd7f6] text-[10px] font-mono-data font-bold uppercase transition-all"
                  title="Open AI Copilot"
                >
                  <BrainCircuit className="w-3.5 h-3.5" />
                  <span className="hidden xl:inline">AI Copilot</span>
                </button>
              )}

              {/* Present Area Active Status Indicator */}
              {location?.enabled && (
                <button
                  type="button"
                  onClick={onNavigateToLiveLocation}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-[10px] font-mono-data font-bold uppercase transition-all border ${
                    location.insideGeofence
                      ? 'bg-[#a40217]/30 text-[#ffdad6] border-[#ffb4ab] animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.5)]'
                      : 'bg-[#06b6d4]/20 text-[#4cd7f6] border-[#4cd7f6]/60'
                  }`}
                  title="Your Present Location Area: Click to open telemetry console"
                >
                  <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                  <span className="truncate max-w-[150px]">
                    {location.presenceArea?.areaName ? location.presenceArea.areaName.split(' - ')[0] : 'Presence Area'}
                  </span>
                </button>
              )}
            </div>
          </div>

          {/* Interactive Topographical Vector Terrain Canvas */}
          <div
            className="absolute inset-0 z-0 overflow-hidden flex items-center justify-center transition-all duration-700"
            style={{
              transform: `${cameraSettings.transform} scale(${zoomLevel})`,
              transformOrigin: 'center center',
            }}
          >
            <svg
              className="w-[120%] h-[120%] opacity-85"
              viewBox="0 0 1000 800"
              preserveAspectRatio="xMidYMid slice"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <radialGradient id="hazardPulseGlow" cx="52%" cy="48%" r="35%">
                  <stop offset="0%" stopColor="#EF4444" stopOpacity="0.45" />
                  <stop offset="50%" stopColor="#EF4444" stopOpacity="0.15" />
                  <stop offset="100%" stopColor="#0c1322" stopOpacity="0" />
                </radialGradient>
                <linearGradient id="corridorHighwayGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#4cd7f6" />
                  <stop offset="40%" stopColor="#ffb95f" />
                  <stop offset="55%" stopColor="#EF4444" />
                  <stop offset="75%" stopColor="#4cd7f6" />
                </linearGradient>
                <pattern id="h3HexPattern" width="60" height="104" patternUnits="userSpaceOnUse" patternTransform="rotate(20)">
                  <path
                    d="M30,0 L60,17.32 L60,51.96 L30,69.28 L0,51.96 L0,17.32 Z M30,69.28 L60,86.6 L60,121.24 L30,138.56 L0,121.24 L0,86.6 Z"
                    fill="none"
                    stroke="rgba(76, 215, 246, 0.09)"
                    strokeWidth="0.8"
                  />
                </pattern>
                {/* Tactical Presence Area Hatch & Glow Patterns */}
                <pattern id="presenceAreaHatchCyan" width="12" height="12" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
                  <line x1="0" y1="0" x2="0" y2="12" stroke="rgba(76, 215, 246, 0.35)" strokeWidth="2" />
                </pattern>
                <pattern id="presenceAreaHatchRed" width="12" height="12" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
                  <line x1="0" y1="0" x2="0" y2="12" stroke="rgba(239, 68, 68, 0.45)" strokeWidth="2" />
                </pattern>
                <radialGradient id="presenceAreaGlowCyan" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#4cd7f6" stopOpacity="0.45" />
                  <stop offset="60%" stopColor="#4cd7f6" stopOpacity="0.15" />
                  <stop offset="100%" stopColor="#4cd7f6" stopOpacity="0" />
                </radialGradient>
                <radialGradient id="presenceAreaGlowRed" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#EF4444" stopOpacity="0.55" />
                  <stop offset="60%" stopColor="#EF4444" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="#EF4444" stopOpacity="0" />
                </radialGradient>
              </defs>

              {/* Topographic Contour Lines simulating Himalayan Scarp Terrain */}
              <g fill="none" stroke="rgba(134, 147, 151, 0.22)" strokeWidth="1.2">
                <path d="M-50,120 Q220,180 480,100 T980,160" />
                <path d="M-50,190 Q240,260 520,170 T1050,220" />
                <path d="M-50,270 Q210,340 500,240 T1020,310" />
                <path d="M-50,360 Q260,430 530,330 T1060,400" />
                <path d="M-50,450 Q230,520 510,420 T1040,490" />
                <path d="M-50,540 Q280,610 540,510 T1080,590" />
                <path d="M-50,630 Q250,700 520,600 T1050,680" />
                <path d="M-50,720 Q270,790 530,690 T1090,770" />
              </g>

              {/* Hex Grid Overlay (Uber H3 Spatial Layer) */}
              {overlays.h3Grid && <rect width="100%" height="100%" fill="url(#h3HexPattern)" />}

              {/* Hazard Heat Area */}
              <circle cx="510" cy="380" r="170" fill="url(#hazardPulseGlow)" />

              {/* Rendered H3 Hexagons */}
              {/* Hex 1: Green (KM 41.5) */}
              <polygon
                points="360,280 395,300 395,340 360,360 325,340 325,300"
                fill="rgba(76, 215, 246, 0.25)"
                stroke="#4cd7f6"
                strokeWidth="1.5"
                className="cursor-pointer hover:fill-opacity-50 transition-all"
                onClick={() => setSelectedHex('8860a24b60fffff')}
              />
              <text x="360" y="325" fill="#4cd7f6" fontFamily="JetBrains Mono" fontSize="10" fontWeight="bold" textAnchor="middle">
                0.31 FoS
              </text>

              {/* Hex 2: Amber (KM 42.1) */}
              <polygon
                points="430,320 465,340 465,380 430,400 395,380 395,340"
                fill="rgba(255, 185, 95, 0.35)"
                stroke="#ffb95f"
                strokeWidth="1.5"
                className="cursor-pointer hover:fill-opacity-50 transition-all"
                onClick={() => setSelectedHex('8860a24b63fffff')}
              />
              <text x="430" y="365" fill="#ffb95f" fontFamily="JetBrains Mono" fontSize="10" fontWeight="bold" textAnchor="middle">
                0.68
              </text>

              {/* CRITICAL FAILURE HEX (8860a24b61fffff) */}
              <g className="cursor-pointer" onClick={() => setSelectedHex('8860a24b61fffff')}>
                <polygon
                  points="510,360 550,383 550,429 510,452 470,429 470,383"
                  fill="rgba(239, 68, 68, 0.65)"
                  stroke="#EF4444"
                  strokeWidth="3"
                  className="animate-pulse"
                />
                <circle cx="510" cy="406" r="34" fill="none" stroke="#EF4444" strokeWidth="1.5" strokeDasharray="4,4" className="animate-spin" style={{ animationDuration: '8s' }} />
                <text x="510" y="402" fill="#FFFFFF" fontFamily="JetBrains Mono" fontSize="12" fontWeight="bold" textAnchor="middle">
                  P=0.89
                </text>
                <text x="510" y="416" fill="#ffdad6" fontFamily="JetBrains Mono" fontSize="8" fontWeight="bold" textAnchor="middle">
                  KM 43.4
                </text>
              </g>

              {/* Hex 4: Amber (KM 44.5) */}
              <polygon
                points="590,320 625,340 625,380 590,400 555,380 555,340"
                fill="rgba(255, 185, 95, 0.3)"
                stroke="#ffb95f"
                strokeWidth="1.5"
                className="cursor-pointer hover:fill-opacity-50 transition-all"
                onClick={() => setSelectedHex('8860a24b67fffff')}
              />
              <text x="590" y="365" fill="#ffb95f" fontFamily="JetBrains Mono" fontSize="10" textAnchor="middle">
                0.64
              </text>

              {/* Hex 5: Green (KM 45.2) */}
              <polygon
                points="510,280 545,300 545,340 510,360 475,340 475,300"
                fill="rgba(76, 215, 246, 0.25)"
                stroke="#4cd7f6"
                strokeWidth="1.5"
                className="cursor-pointer hover:fill-opacity-50 transition-all"
                onClick={() => setSelectedHex('8860a24b60fffff')}
              />
              <text x="510" y="325" fill="#4cd7f6" fontFamily="JetBrains Mono" fontSize="10" textAnchor="middle">
                0.24
              </text>

              {/* Highway Corridor NH-10 Polyline */}
              <path
                d="M120,680 C 260,620 310,540 410,480 C 470,444 500,410 540,360 C 580,310 650,260 760,210 C 840,170 910,120 960,80"
                fill="none"
                stroke="url(#corridorHighwayGrad)"
                strokeWidth="8"
                strokeLinecap="round"
              />

              {/* Hazard Zone Highlight on Highway */}
              <path
                d="M470,444 C 500,410 540,360 570,324"
                fill="none"
                stroke="#ffb4ab"
                strokeWidth="12"
                strokeDasharray="8,6"
                className="animate-pulse"
              />

              {/* Borehole Sensors Layer */}
              {overlays.borehole && (
                <>
                  {/* Sensor 89 (Critical Red) */}
                  <g transform="translate(510, 406)" className="cursor-pointer" onClick={() => setSelectedNode('SN-SLOPE-089')}>
                    <circle cx="0" cy="0" r="10" fill="#EF4444" />
                    <circle cx="0" cy="0" r="20" fill="none" stroke="#EF4444" strokeWidth="2" className="animate-ping" />
                    <rect x="14" y="-12" width="112" height="24" rx="2" fill="#070e1d" stroke="#EF4444" strokeWidth="1.5" />
                    <text x="20" y="4" fill="#ffffff" fontFamily="JetBrains Mono" fontSize="9" fontWeight="bold">
                      SN-SLOPE-089
                    </text>
                  </g>

                  {/* Sensor 88 (Amber) */}
                  <g transform="translate(430, 365)" className="cursor-pointer" onClick={() => setSelectedNode('SN-SLOPE-088')}>
                    <circle cx="0" cy="0" r="7" fill="#ffb95f" />
                    <rect x="12" y="-10" width="100" height="20" rx="2" fill="#070e1d" stroke="#ffb95f" strokeWidth="1" />
                    <text x="18" y="4" fill="#ffb95f" fontFamily="JetBrains Mono" fontSize="8" fontWeight="bold">
                      SN-SLOPE-088
                    </text>
                  </g>

                  {/* Sensor 90 (Cyan) */}
                  <g transform="translate(590, 365)" className="cursor-pointer" onClick={() => setSelectedNode('SN-SLOPE-090')}>
                    <circle cx="0" cy="0" r="6" fill="#4cd7f6" />
                    <rect x="12" y="-10" width="100" height="20" rx="2" fill="#070e1d" stroke="#4cd7f6" strokeWidth="1" />
                    <text x="18" y="4" fill="#4cd7f6" fontFamily="JetBrains Mono" fontSize="8" fontWeight="bold">
                      SN-SLOPE-090
                    </text>
                  </g>
                </>
              )}

              {/* Sentinel-1 InSAR LOS Vectors if active */}
              {overlays.insar && (
                <g stroke="#ffb95f" strokeWidth="1.5" strokeDasharray="3 3">
                  <line x1="510" y1="406" x2="480" y2="460" />
                  <line x1="430" y1="365" x2="410" y2="410" />
                  <polygon points="480,460 484,450 476,452" fill="#ffb95f" />
                </g>
              )}

              {/* Live Location Sentinel Marker, Presence Area & Vector */}
              {location?.enabled && location.lat !== null && (() => {
                // Map coordinate positioning for GPS Sentinel & Territorial Presence Area
                let userX = 490;
                let userY = 440;
                let areaPolygon = "385,370 475,340 575,385 575,490 480,530 385,475";
                let egressX = 390;
                let egressY = 320;

                if (location.lat === 27.0582) {
                  userX = 490;
                  userY = 440;
                  areaPolygon = "385,370 475,340 575,385 575,490 480,530 385,475";
                  egressX = 390;
                  egressY = 320;
                } else if (location.lat === 27.0650) {
                  userX = 340;
                  userY = 520;
                  areaPolygon = "240,460 370,430 440,500 410,600 280,620 230,530";
                  egressX = 230;
                  egressY = 400;
                } else if (location.lat === 27.1760) {
                  userX = 790;
                  userY = 210;
                  areaPolygon = "700,140 850,130 890,230 840,290 720,285 680,210";
                  egressX = 850;
                  egressY = 130;
                } else {
                  // Dynamic coordinate offset relative to sector
                  const [secLat, secLng] = sector.coordinates;
                  const dLat = (location.lat || secLat) - secLat;
                  const dLng = (location.lng || secLng) - secLng;
                  userX = Math.max(120, Math.min(880, Math.round(510 + dLng * 2800)));
                  userY = Math.max(120, Math.min(680, Math.round(406 - dLat * 2800)));
                  const r = Math.max(45, Math.min(85, (location.accuracy || 15) * 3.2));
                  areaPolygon = `${userX - r},${userY} ${userX - r * 0.7},${userY - r * 0.7} ${userX},${userY - r} ${userX + r * 0.7},${userY - r * 0.7} ${userX + r},${userY} ${userX + r * 0.7},${userY + r * 0.7} ${userX},${userY + r} ${userX - r * 0.7},${userY + r * 0.7}`;
                  egressX = userX - 70;
                  egressY = userY - 70;
                }

                const isInside = location.insideGeofence;
                const markerColor = isInside ? '#EF4444' : '#4cd7f6';
                const glowId = isInside ? 'url(#presenceAreaGlowRed)' : 'url(#presenceAreaGlowCyan)';
                const hatchId = isInside ? 'url(#presenceAreaHatchRed)' : 'url(#presenceAreaHatchCyan)';
                const areaInfo = location.presenceArea;
                const areaTitle = areaInfo?.areaName || (isInside ? 'Sector 4 - KM 42.8 Cut-Slope Runout Chute' : 'Corridor Sector Buffer');
                const zoneCode = areaInfo?.zoneCode || (isInside ? 'ZONE-ALPHA' : 'ZONE-BUFFER');
                const radiusM = areaInfo?.radiusMeters || 85;

                return (
                  <g className="cursor-pointer" onClick={onNavigateToLiveLocation}>
                    {/* === 1. HIGHLIGHTED AREA WHERE YOU ARE PRESENT === */}
                    {/* Presence Area Solid Ambient Glow */}
                    <polygon
                      points={areaPolygon}
                      fill={glowId}
                    />

                    {/* Presence Area Tactical Hatch Fill */}
                    <polygon
                      points={areaPolygon}
                      fill={hatchId}
                    />

                    {/* Presence Area Pulsing Boundary Contour */}
                    <polygon
                      points={areaPolygon}
                      fill="none"
                      stroke={markerColor}
                      strokeWidth="2.5"
                      strokeDasharray="8 5"
                      className="animate-pulse"
                      opacity="0.9"
                    />

                    {/* Outer Area Safety Margin Ring */}
                    <polygon
                      points={areaPolygon}
                      fill="none"
                      stroke={markerColor}
                      strokeWidth="1"
                      strokeDasharray="3 3"
                      opacity="0.4"
                      transform={`scale(1.06) translate(${-userX * 0.06}, ${-userY * 0.06})`}
                    />

                    {/* Presence Area Floating Tactical Identification HUD Card */}
                    <g transform={`translate(${userX}, ${Math.max(60, userY - 95)})`}>
                      {/* Drop shadow / dark backplate */}
                      <rect
                        x="-155"
                        y="-26"
                        width="310"
                        height="52"
                        rx="4"
                        fill="#070e1d"
                        stroke={markerColor}
                        strokeWidth="1.8"
                        filter="drop-shadow(0 4px 12px rgba(0,0,0,0.85))"
                      />
                      {/* Top Header Tag */}
                      <rect
                        x="-155"
                        y="-26"
                        width="310"
                        height="18"
                        fill={isInside ? 'rgba(239,68,68,0.22)' : 'rgba(76,215,246,0.18)'}
                      />
                      {/* Pulsing Alert Indicator */}
                      <circle cx="-140" cy="-17" r="4" fill={markerColor} className="animate-ping" />
                      <circle cx="-140" cy="-17" r="3" fill={markerColor} />
                      <text
                        x="-128"
                        y="-13"
                        fill={markerColor}
                        fontFamily="JetBrains Mono"
                        fontSize="9"
                        fontWeight="bold"
                        letterSpacing="0.08em"
                      >
                        AREA WHERE YOU ARE PRESENT
                      </text>
                      <text
                        x="142"
                        y="-13"
                        fill="#bcc9cd"
                        fontFamily="JetBrains Mono"
                        fontSize="8.5"
                        textAnchor="end"
                      >
                        {zoneCode.split(' ')[0]}
                      </text>

                      {/* Primary Area Name */}
                      <text
                        x="-142"
                        y="5"
                        fill="#ffffff"
                        fontFamily="Space Grotesk, sans-serif"
                        fontSize="10"
                        fontWeight="bold"
                      >
                        {areaTitle.length > 36 ? areaTitle.substring(0, 36) + '…' : areaTitle}
                      </text>

                      {/* Boundary and Radius Footprint */}
                      <text
                        x="-142"
                        y="19"
                        fill="#bcc9cd"
                        fontFamily="JetBrains Mono"
                        fontSize="8.5"
                      >
                        Footprint: ±{radiusM}m | Sub: {areaInfo?.subSector?.split('(')[0]?.trim() || 'Lower Teesta'}
                      </text>

                      {/* Target Reticle Stem Pointing to User */}
                      <line
                        x1="0"
                        y1="26"
                        x2="0"
                        y2={userY - Math.max(60, userY - 95) - 26}
                        stroke={markerColor}
                        strokeWidth="1.5"
                        strokeDasharray="3 2"
                      />
                    </g>

                    {/* === 2. SAFE EGRESS ESCAPE VECTOR FROM PRESENCE AREA === */}
                    {isInside && (
                      <g opacity="0.9">
                        <line
                          x1={userX}
                          y1={userY}
                          x2={egressX}
                          y2={egressY}
                          stroke="#22c55e"
                          strokeWidth="2.5"
                          strokeDasharray="5 3"
                        />
                        <polygon
                          points={`${egressX},${egressY} ${egressX + 8},${egressY + 12} ${egressX - 8},${egressY + 10}`}
                          fill="#22c55e"
                        />
                        <rect
                          x={egressX - 35}
                          y={egressY - 20}
                          width="70"
                          height="16"
                          rx="2"
                          fill="#070e1d"
                          stroke="#22c55e"
                          strokeWidth="1"
                        />
                        <text
                          x={egressX}
                          y={egressY - 9}
                          fill="#22c55e"
                          fontFamily="JetBrains Mono"
                          fontSize="8"
                          fontWeight="bold"
                          textAnchor="middle"
                        >
                          SAFE EGRESS
                        </text>
                      </g>
                    )}

                    {/* === 3. KINEMATIC VECTOR TO RUPTURE CROWN === */}
                    <line
                      x1={userX}
                      y1={userY}
                      x2="510"
                      y2="406"
                      stroke={markerColor}
                      strokeWidth="2"
                      strokeDasharray="6 4"
                      opacity="0.8"
                    />

                    {/* Vector Distance Badge */}
                    <rect
                      x={(userX + 510) / 2 - 42}
                      y={(userY + 406) / 2 - 12}
                      width="84"
                      height="22"
                      rx="3"
                      fill="#070e1d"
                      stroke={markerColor}
                      strokeWidth="1.5"
                    />
                    <text
                      x={(userX + 510) / 2}
                      y={(userY + 406) / 2 + 3}
                      fill={markerColor}
                      fontFamily="JetBrains Mono"
                      fontSize="9"
                      fontWeight="bold"
                      textAnchor="middle"
                    >
                      {location.distanceToActiveHazardKm !== null
                        ? `${location.distanceToActiveHazardKm.toFixed(1)} km to Crown`
                        : '0.1 km'}
                    </text>

                    {/* === 4. USER COORDINATE PIN & RADAR PULSE === */}
                    <circle
                      cx={userX}
                      cy={userY}
                      r="42"
                      fill="none"
                      stroke={markerColor}
                      strokeWidth="1.8"
                      className="animate-ping"
                      opacity="0.65"
                    />
                    <circle
                      cx={userX}
                      cy={userY}
                      r="22"
                      fill="none"
                      stroke={markerColor}
                      strokeWidth="1.5"
                      strokeDasharray="4 3"
                    />
                    <circle
                      cx={userX}
                      cy={userY}
                      r="9"
                      fill={markerColor}
                    />
                    <circle
                      cx={userX}
                      cy={userY}
                      r="3.5"
                      fill="#ffffff"
                    />

                    {/* Sentinel Marker Flag Tag */}
                    <rect
                      x={userX - 58}
                      y={userY + 16}
                      width="116"
                      height="24"
                      rx="3"
                      fill="#070e1d"
                      stroke={markerColor}
                      strokeWidth="1.5"
                    />
                    <text
                      x={userX}
                      y={userY + 31}
                      fill="#ffffff"
                      fontFamily="JetBrains Mono"
                      fontSize="9"
                      fontWeight="bold"
                      textAnchor="middle"
                    >
                      YOU (LIVE GPS)
                    </text>
                  </g>
                );
              })()}
            </svg>
          </div>

          {/* Floating Selected H3 Hex Inspection Flyout */}
          <div className="relative z-10 mx-3 my-auto max-w-sm bg-[#070e1d]/95 backdrop-blur-md p-3.5 rounded border border-[#ef4444]/40 shadow-[0_0_24px_rgba(239,68,68,0.3)] self-start font-mono-data text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-[#3d494c]/30">
              <div className="flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-[#ef4444]" />
                <span className="font-headline text-xs text-[#ef4444] font-bold uppercase">
                  Active Failure Cell
                </span>
              </div>
              <span className="px-1.5 py-0.5 bg-[#ef4444] text-[#070a0f] font-mono-data text-[9px] rounded font-bold">
                RES 9 HEX
              </span>
            </div>

            <div className="mt-2.5 flex flex-col gap-1 text-[11px]">
              <div className="flex justify-between">
                <span className="text-[#869397]">Uber H3 Cell ID:</span>
                <span className="text-[#dce2f7] font-bold">{selectedHex}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#869397]">Centroid Coordinates:</span>
                <span className="text-[#dce2f7] font-bold">
                  {sector.coordinates[0]}°N, {sector.coordinates[1]}°E
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#869397]">Crown Elevation:</span>
                <span className="text-[#dce2f7]">{sector.elevation}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#869397]">Slope Gradient:</span>
                <span className="text-[#ffb4ab] font-bold">{sector.slopeGradient}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#869397]">Lithological Facies:</span>
                <span className="text-[#dce2f7] truncate max-w-[190px]">{sector.lithology}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#869397]">InSAR 30d Velocity:</span>
                <span className="text-[#ffb95f]">{sector.insarVelocity}</span>
              </div>
            </div>

            <div className="mt-2.5 pt-2 border-t border-[#3d494c]/30 flex items-center justify-between">
              <span className="text-[10px] text-[#869397] uppercase">Runout Projection:</span>
              <span className="text-[10px] text-[#ffb4ab] font-bold">{sector.runoutVector}</span>
            </div>

            {/* Quick action button to AI Predictive Risk Engine */}
            <button
              id="btn-inspect-in-risk-engine"
              type="button"
              onClick={onNavigateToRiskEngine}
              className="w-full mt-2 py-1.5 bg-[#a40217] hover:bg-[#a40217]/90 text-[#ffdad6] rounded text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-95"
            >
              <span>Analyze in AI Risk Engine</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Bottom Layer Controls & Risk Legend */}
          <div className="relative z-10 p-3 mt-auto flex flex-col md:flex-row items-stretch md:items-end justify-between gap-2.5 pointer-events-none">
            {/* Layer Switcher Panel */}
            <div className="pointer-events-auto bg-[#070e1d]/90 backdrop-blur-md p-2 rounded border border-[#3d494c]/30 flex flex-wrap items-center gap-3 shadow-xl font-mono-data text-xs">
              <span className="text-[10px] text-[#869397] uppercase font-bold">Overlays:</span>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={overlays.h3Grid}
                  onChange={(e) => setOverlays((prev) => ({ ...prev, h3Grid: e.target.checked }))}
                  className="w-3.5 h-3.5 accent-[#4cd7f6] rounded cursor-pointer"
                />
                <span className="text-[11px] text-[#dce2f7]">Uber H3 Grid (Res 8/9)</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={overlays.borehole}
                  onChange={(e) => setOverlays((prev) => ({ ...prev, borehole: e.target.checked }))}
                  className="w-3.5 h-3.5 accent-[#4cd7f6] rounded cursor-pointer"
                />
                <span className="text-[11px] text-[#dce2f7]">Borehole Sensors</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={overlays.insar}
                  onChange={(e) => setOverlays((prev) => ({ ...prev, insar: e.target.checked }))}
                  className="w-3.5 h-3.5 accent-[#4cd7f6] rounded cursor-pointer"
                />
                <span className="text-[11px] text-[#dce2f7]">Sentinel-1 InSAR</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={overlays.radar}
                  onChange={(e) => setOverlays((prev) => ({ ...prev, radar: e.target.checked }))}
                  className="w-3.5 h-3.5 accent-[#4cd7f6] rounded cursor-pointer"
                />
                <span className="text-[11px] text-[#bcc9cd]">IMD Radar 4km dBZ</span>
              </label>
            </div>

            {/* Risk Tier Legend */}
            <div className="pointer-events-auto bg-[#070e1d]/90 backdrop-blur-md p-2 px-3 rounded border border-[#3d494c]/30 flex items-center gap-3 shadow-xl font-mono-data text-xs">
              <span className="text-[10px] text-[#869397] uppercase font-bold">Risk Tier:</span>
              <div className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-sm bg-[#4cd7f6]" />
                <span className="text-[11px] text-[#dce2f7]">&lt;0.40</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-sm bg-[#ffb95f]" />
                <span className="text-[11px] text-[#dce2f7]">0.40-0.65</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-sm bg-[#e79400]" />
                <span className="text-[11px] text-[#dce2f7]">0.65-0.80</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-sm bg-[#ef4444]" />
                <span className="text-[11px] text-[#ef4444] font-bold">&gt;0.80</span>
              </div>
            </div>
          </div>
        </main>

        {/* ========================================================= */}
        {/* COLUMN 3: AI ENGINE, IMPACT & CAP LOG (3 Cols)            */}
        {/* ========================================================= */}
        <aside className={`${viewMode === 'map' ? 'hidden' : 'lg:col-span-3'} bg-[#070e1d] p-3 flex flex-col gap-2.5 border-l border-[#3d494c]/30 shadow-2xl overflow-y-auto max-h-[calc(100vh-10.5rem)]`}>
          {/* Panel Header */}
          <div className="flex items-center justify-between bg-[#141b2b] p-2 rounded border border-[#3d494c]/40">
            <button
              onClick={onNavigateToRiskEngine}
              className="flex items-center gap-1.5 text-left group hover:text-[#4cd7f6] transition-colors"
            >
              <TrendingUp className="w-4 h-4 text-[#4cd7f6] group-hover:scale-110 transition-transform" />
              <span className="font-headline text-xs font-bold text-[#dce2f7] uppercase tracking-wide group-hover:text-[#4cd7f6]">
                AI Predictive Risk Engine
              </span>
            </button>
            <span className="px-1.5 py-0.5 bg-[#232a3a] font-mono-data text-[10px] text-[#4cd7f6] rounded font-bold">
              LATENCY: 310ms
            </span>
          </div>

          {/* Dynamic Failure Formula Card */}
          <div className="bg-[#141b2b] p-2.5 rounded flex flex-col gap-1.5 border border-[#3d494c]/40 relative overflow-hidden font-mono-data text-xs">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-[#869397] uppercase font-bold">Dynamic Failure Formula</span>
              <span className="text-xs text-[#ffb4ab] font-bold">P(FAIL) = 0.89</span>
            </div>

            {/* Formula box */}
            <div className="bg-[#070e1d] p-1.5 rounded text-[11px] text-[#dce2f7] text-center border border-[#3d494c]/30">
              <span className="text-[#869397]">S<sub>H3</sub> = </span>
              <span className="text-[#4cd7f6]">0.25×LSZ</span> +{' '}
              <span className="text-[#ffb95f]">0.45×Φ<sub>hydro</sub></span> +{' '}
              <span className="text-[#ffb4ab]">0.30×Ω<sub>kin</sub></span>
            </div>

            {/* Contribution bars */}
            <div className="flex flex-col gap-1.5 mt-1">
              <div className="flex justify-between items-center text-[10px]">
                <span className="text-[#869397]">Static LSZ (XGBoost):</span>
                <span className="text-[#4cd7f6] font-semibold">0.78 (High)</span>
              </div>
              <div className="w-full bg-[#2e3545] h-1.5 rounded overflow-hidden">
                <div className="bg-[#4cd7f6] h-full w-[78%]" />
              </div>

              <div className="flex justify-between items-center text-[10px] mt-0.5">
                <span className="text-[#869397]">Hydro LSTM (I-D, PWP):</span>
                <span className="text-[#ffb95f] font-semibold">0.94 (Extreme)</span>
              </div>
              <div className="w-full bg-[#2e3545] h-1.5 rounded overflow-hidden">
                <div className="bg-[#ffb95f] h-full w-[94%]" />
              </div>

              <div className="flex justify-between items-center text-[10px] mt-0.5">
                <span className="text-[#869397]">Kinematic Tilt Velocity:</span>
                <span className="text-[#ffb4ab] font-semibold">0.91 (Pre-collapse)</span>
              </div>
              <div className="w-full bg-[#2e3545] h-1.5 rounded overflow-hidden">
                <div className="bg-[#ffb4ab] h-full w-[91%]" />
              </div>
            </div>

            <div className="flex items-center justify-between pt-1.5 border-t border-[#3d494c]/30 text-[11px]">
              <span className="text-[#869397]">Estimated Runout Time:</span>
              <span className="text-[#ffb4ab] font-bold uppercase tracking-wider">
                {formatCountdown(countdown)} (Imminent)
              </span>
            </div>
          </div>

          {/* Live GPS Sentinel Proximity Telemetry Box */}
          {location && (
            <div className="bg-[#141b2b] p-2.5 rounded flex flex-col gap-1.5 border border-[#3d494c]/40 font-mono-data text-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Crosshair className="w-3.5 h-3.5 text-[#4cd7f6]" />
                  <span className="text-[10px] text-[#869397] uppercase font-bold">
                    Field Sentinel Proximity
                  </span>
                </div>
                <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase ${
                  location.enabled
                    ? location.insideGeofence
                      ? 'bg-[#a40217] text-[#ffdad6] animate-pulse'
                      : 'bg-[#06b6d4] text-[#00424f]'
                    : 'bg-[#232a3a] text-[#869397]'
                }`}>
                  {location.enabled ? location.proximityStatus : 'INACTIVE'}
                </span>
              </div>

              {location.enabled ? (
                <div className="flex flex-col gap-1 mt-0.5">
                  <div className="bg-[#070e1d] p-1.5 rounded flex justify-between items-center border border-[#3d494c]/20">
                    <span className="text-[10px] text-[#869397]">Distance to Failure:</span>
                    <span className={`font-bold text-[11px] ${location.insideGeofence ? 'text-[#ffb4ab]' : 'text-[#4cd7f6]'}`}>
                      {location.distanceToActiveHazardKm?.toFixed(2)} km
                    </span>
                  </div>

                  <div className="bg-[#070e1d] p-1.5 rounded flex justify-between items-center border border-[#3d494c]/20">
                    <span className="text-[10px] text-[#869397]">Bearing to Crown:</span>
                    <span className="text-[#ffb95f] font-bold text-[11px]">
                      {location.bearingToActiveHazardDeg !== null ? `${location.bearingToActiveHazardDeg}° Azimuth` : '042° NE'}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={onNavigateToLiveLocation}
                    className="w-full py-1 bg-[#232a3a] hover:bg-[#2e3545] text-[#4cd7f6] rounded text-[10px] uppercase font-bold transition-colors mt-0.5"
                  >
                    Open Live Location HUD & Briefing →
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={onNavigateToLiveLocation}
                  className="w-full py-1.5 bg-[#06b6d4] hover:bg-[#06b6d4]/90 text-[#003640] rounded text-[10px] uppercase font-bold transition-all mt-0.5 shadow-sm"
                >
                  Enable Live Field GPS Tracking
                </button>
              )}
            </div>
          )}

          {/* Highway & Community Impact Assessment */}
          <div className="bg-[#141b2b] p-2.5 rounded flex flex-col gap-1.5 border border-[#3d494c]/40 font-mono-data text-xs">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-[#869397] uppercase font-bold">
                Corridor & Habitation Impact
              </span>
              <span className="px-1.5 py-0.5 bg-[#a40217] text-[#ffdad6] text-[9px] rounded font-bold uppercase">
                SECTOR 4
              </span>
            </div>

            <div className="flex flex-col gap-1.5 mt-1">
              <div className="bg-[#070e1d] p-1.5 rounded flex justify-between items-center border border-[#3d494c]/20">
                <div className="flex flex-col">
                  <span className="text-[9px] text-[#869397]">Corridor Section</span>
                  <span className="text-[#dce2f7] font-semibold text-[11px]">NH-10 KM 42.1 to 45.3</span>
                </div>
                <span className="text-[#ffb4ab] font-bold text-[11px]">3.2 km High Risk</span>
              </div>

              <div className="bg-[#070e1d] p-1.5 rounded flex justify-between items-center border border-[#3d494c]/20">
                <div className="flex flex-col">
                  <span className="text-[9px] text-[#869397]">Vehicles in Transit</span>
                  <span className="text-[#dce2f7] font-semibold text-[11px]">38 Vehicles</span>
                </div>
                <span className="text-[#869397] text-[10px]">FASTag Rangpo Poll</span>
              </div>

              <div className="bg-[#070e1d] p-1.5 rounded flex justify-between items-center border border-[#3d494c]/20">
                <div className="flex flex-col">
                  <span className="text-[9px] text-[#869397]">Downslope Habitations</span>
                  <span className="text-[#dce2f7] font-semibold text-[11px]">Singtam & Teesta Bazaar</span>
                </div>
                <span className="text-[#ffb3ad] font-bold text-[11px]">420 Exposed</span>
              </div>

              <div className="bg-[#070e1d] p-1.5 rounded flex justify-between items-center border border-[#3d494c]/20">
                <div className="flex flex-col">
                  <span className="text-[9px] text-[#869397]">BRO Heavy Staging</span>
                  <span className="text-[#dce2f7] font-semibold text-[11px]">Unit 14 Heavy Excavator</span>
                </div>
                <span className="text-[#4cd7f6] font-bold text-[11px]">6.4 km (Rangpo)</span>
              </div>
            </div>
          </div>

          {/* Automated CAP v1.2 Execution Log */}
          <div className="bg-[#141b2b] p-2.5 rounded flex flex-col gap-1.5 border border-[#3d494c]/40 mt-auto font-mono-data text-xs">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-[#869397] uppercase font-bold">
                Automated CAP v1.2 Dispatch
              </span>
              <span className="text-[10px] text-[#4cd7f6]">07-21-0089</span>
            </div>

            <div className="flex flex-col gap-1.5 mt-1">
              <div className="p-1.5 bg-[#070e1d] rounded flex items-center justify-between border border-[#3d494c]/20">
                <div className="flex items-center gap-1.5">
                  <Radio className="w-3.5 h-3.5 text-[#4cd7f6]" />
                  <div className="flex flex-col">
                    <span className="text-[10px] text-[#dce2f7] font-semibold">NDMA/CDAC SMS Geofence</span>
                    <span className="text-[8px] text-[#869397]">Nepali, Bengali, Hindi, English</span>
                  </div>
                </div>
                <span className="text-[10px] text-[#4cd7f6] font-bold">1,840 Queued (98%)</span>
              </div>

              <div className="p-1.5 bg-[#070e1d] rounded flex items-center justify-between border border-[#3d494c]/20">
                <div className="flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-[#ffb4ab]" />
                  <div className="flex flex-col">
                    <span className="text-[10px] text-[#dce2f7] font-semibold">Highway Solar Sirens</span>
                    <span className="text-[8px] text-[#869397]">S-04A & S-04B @ 110dB Warble</span>
                  </div>
                </div>
                <span className="text-[10px] text-[#ffb4ab] font-bold">ACTIVATED</span>
              </div>

              <div className="p-1.5 bg-[#070e1d] rounded flex items-center justify-between border border-[#3d494c]/20">
                <div className="flex items-center gap-1.5">
                  <PhoneCall className="w-3.5 h-3.5 text-[#ffb95f]" />
                  <div className="flex flex-col">
                    <span className="text-[10px] text-[#dce2f7] font-semibold">DEOC Kalimpong & Gangtok</span>
                    <span className="text-[8px] text-[#869397]">Priority IVRS Escalation</span>
                  </div>
                </div>
                <span className="text-[10px] text-[#ffb95f] font-bold">CONFIRMED</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1 text-[10px] text-[#869397]">
              <span>End-to-End Latency:</span>
              <span className="text-[#4cd7f6] font-bold">6.8 Seconds</span>
            </div>

            {onOpenReportModal && (
              <button
                type="button"
                onClick={onOpenReportModal}
                className="w-full mt-2 py-2 px-3 bg-[#191f2f] hover:bg-[#232a3a] text-[#4cd7f6] rounded border border-[#4cd7f6]/40 flex items-center justify-center gap-2 text-[11px] font-bold uppercase transition-all shadow-sm active:scale-95"
              >
                <FileDown className="w-3.5 h-3.5 text-[#4cd7f6]" />
                <span>Export Official Risk Report (PDF)</span>
              </button>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
};
