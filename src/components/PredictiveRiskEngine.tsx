import React, { useState, useEffect } from 'react';
import { SectorConfig, H3ClusterRow, LiveLocationState, AiGeotechnicalAssessment } from '../types';
import { H3_CLUSTERS } from '../data/mockTacticalData';
import { 
  TrendingUp, 
  Layers, 
  Droplets, 
  Activity, 
  Satellite, 
  Download, 
  Sliders, 
  RefreshCw, 
  Filter, 
  Check, 
  AlertTriangle,
  Timer,
  Grid,
  Radio,
  BrainCircuit,
  Sparkles,
  ShieldAlert,
  Crosshair,
  FileDown
} from 'lucide-react';

interface PredictiveRiskEngineProps {
  sector: SectorConfig;
  onTriggerCapForCell: (cellId: string) => void;
  onNavigateTo3D: (cellId?: string) => void;
  location?: LiveLocationState;
  onToggleAiCopilot?: () => void;
  onOpenReportModal?: () => void;
}

export const PredictiveRiskEngine: React.FC<PredictiveRiskEngineProps> = ({
  sector,
  onTriggerCapForCell,
  onNavigateTo3D,
  location,
  onToggleAiCopilot,
  onOpenReportModal,
}) => {
  // Model weights for interactive calibration
  const [weights, setWeights] = useState({ w1: 0.25, w2: 0.45, w3: 0.30 });
  const [filterBreached, setFilterBreached] = useState(false);
  const [isQueryingPostGIS, setIsQueryingPostGIS] = useState(false);
  const [geoTiffDownloaded, setGeoTiffDownloaded] = useState(false);
  const [runwaySeconds, setRunwaySeconds] = useState(856); // 14m 16s
  const [aiAssessment, setAiAssessment] = useState<AiGeotechnicalAssessment | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);

  const handleRunAiAnalysis = async () => {
    setIsAiLoading(true);
    try {
      const res = await fetch('/api/ai/geotechnical-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sector,
          weights,
          userLocation: location?.lat
            ? {
                lat: location.lat,
                lng: location.lng,
                altitude: location.altitude,
                distanceKm: location.distanceToActiveHazardKm,
                insideGeofence: location.insideGeofence,
              }
            : null,
        }),
      });
      const data = await res.json();
      if (data.success && data.data) {
        setAiAssessment(data.data);
      }
    } catch (err) {
      console.error('AI analysis error:', err);
    } finally {
      setIsAiLoading(false);
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setRunwaySeconds((prev) => (prev > 0 ? prev - 1 : 856));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatRunway = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}m ${s < 10 ? '0' : ''}${s}s`;
  };

  // Dynamically calculate composite risk based on calibrated weights
  const compositeRisk = Number(
    (0.78 * weights.w1 + 0.94 * weights.w2 + 0.91 * weights.w3).toFixed(2)
  );

  const handleForcePostGIS = () => {
    setIsQueryingPostGIS(true);
    setTimeout(() => {
      setIsQueryingPostGIS(false);
    }, 1200);
  };

  const handleDownloadGeoTIFF = () => {
    setGeoTiffDownloaded(true);
    setTimeout(() => setGeoTiffDownloaded(false), 2500);
  };

  const displayedClusters = filterBreached
    ? H3_CLUSTERS.filter((c) => c.threatStatus === 'CRITICAL RED' || c.threatStatus === 'WARNING ORG')
    : H3_CLUSTERS;

  return (
    <div className="flex flex-col w-full min-h-screen bg-[#0c1322] pb-16 font-body">
      
      {/* ========================================================= */}
      {/* TOP KPI ANALYTICAL STRIP (5 Cards)                        */}
      {/* ========================================================= */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3 p-4 bg-[#070e1d] border-b border-[#3d494c]/30 font-mono-data">
        {/* Card 1: Primary Risk Gauge */}
        <div className="flex flex-col justify-between p-3 rounded bg-[#141b2b] border border-[#3d494c]/40 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-[#869397] uppercase tracking-wider font-bold">
              Dynamic Risk Index
            </span>
            <span className="px-1.5 py-0.5 rounded bg-[#a40217] text-[#ffdad6] text-[10px] font-bold animate-pulse">
              CRITICAL RED
            </span>
          </div>
          <div className="flex items-baseline gap-1.5 my-2">
            <span className="font-headline text-3xl text-[#ffb4ab] font-bold tracking-tight">
              {compositeRisk}
            </span>
            <span className="text-xs text-[#869397]">/ 1.00 S_H3</span>
          </div>
          <div className="flex flex-col gap-1">
            <div className="w-full h-1.5 bg-[#2e3545] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#ffb4ab] rounded-full transition-all duration-300"
                style={{ width: `${Math.round(compositeRisk * 100)}%` }}
              />
            </div>
            <span className="text-[9px] text-[#869397] truncate">
              {weights.w1}*LSZ + {weights.w2}*Φ_hydro + {weights.w3}*Ω_kin
            </span>
          </div>
        </div>

        {/* Card 2: Predicted Runway */}
        <div className="flex flex-col justify-between p-3 rounded bg-[#141b2b] border border-[#3d494c]/40 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-[#869397] uppercase tracking-wider font-bold">
              Predicted Runway
            </span>
            <Timer className="w-4 h-4 text-[#ffb4ab]" />
          </div>
          <div className="flex items-baseline gap-1 my-2">
            <span className="font-headline text-3xl text-[#ffb4ab] font-bold tracking-tight">
              {formatRunway(runwaySeconds)}
            </span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-[#869397] text-[11px]">Model Confidence</span>
            <span className="text-[#4cd7f6] font-bold text-[11px]">94.2%</span>
          </div>
        </div>

        {/* Card 3: Active Monitored H3 Cells */}
        <div className="flex flex-col justify-between p-3 rounded bg-[#141b2b] border border-[#3d494c]/40 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-[#869397] uppercase tracking-wider font-bold">
              H3 Hex Cells (Res 8/9)
            </span>
            <Grid className="w-4 h-4 text-[#4cd7f6]" />
          </div>
          <div className="flex items-baseline gap-1.5 my-2">
            <span className="font-headline text-3xl text-[#dce2f7] font-bold tracking-tight">48</span>
            <span className="text-xs text-[#869397]">Clusters Active</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="px-1.5 py-0.5 rounded bg-[#a40217] text-[#ffdad6] text-[9px] font-bold">1 RED</span>
            <span className="px-1.5 py-0.5 rounded bg-[#e79400] text-[#2a1700] text-[9px] font-bold">4 ORG</span>
            <span className="px-1.5 py-0.5 rounded bg-[#232a3a] text-[#ffb95f] text-[9px] font-semibold">11 YEL</span>
            <span className="px-1.5 py-0.5 rounded bg-[#232a3a] text-[#4cd7f6] text-[9px] font-semibold">32 GRN</span>
          </div>
        </div>

        {/* Card 4: InSAR Displacement */}
        <div className="flex flex-col justify-between p-3 rounded bg-[#141b2b] border border-[#3d494c]/40 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-[#869397] uppercase tracking-wider font-bold">
              InSAR LOS Rate
            </span>
            <Satellite className="w-4 h-4 text-[#ffb95f]" />
          </div>
          <div className="flex items-baseline gap-1 my-2">
            <span className="font-headline text-3xl text-[#ffb4ab] font-bold tracking-tight">
              -18.4
            </span>
            <span className="text-xs text-[#869397]">mm/mo</span>
          </div>
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-[#869397]">Sentinel-1 Asc Pass</span>
            <span className="text-[#ffb4ab] font-semibold">Tertiary Creep</span>
          </div>
        </div>

        {/* Card 5: Inference Pipeline Latency */}
        <div className="flex flex-col justify-between p-3 rounded bg-[#141b2b] border border-[#3d494c]/40 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-[#869397] uppercase tracking-wider font-bold">
              Inference Pipeline
            </span>
            <Activity className="w-4 h-4 text-[#4cd7f6]" />
          </div>
          <div className="flex items-baseline gap-1 my-2">
            <span className="font-headline text-3xl text-[#4cd7f6] font-bold tracking-tight">312</span>
            <span className="text-xs text-[#869397]">ms</span>
          </div>
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-[#869397]">ONNX Batch: 64</span>
            <span className="text-[#4cd7f6] font-bold">LIVE SYNC</span>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* SECTION 1: MULTI-MODAL AI FUSION ARCHITECTURE (3 TIERS)   */}
      {/* ========================================================= */}
      <section className="p-4 flex flex-col gap-3">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-2.5 h-2.5 rounded-full bg-[#ffb4ab] animate-ping" />
            <span className="font-headline text-xl text-[#dce2f7] font-bold tracking-tight">
              Multi-Modal AI Fusion Architecture
            </span>
            <span className="px-2 py-0.5 rounded bg-[#2e3545] text-[#4cd7f6] font-mono-data text-xs font-semibold">
              FORMULA RECONCILIATION ENGINE
            </span>
          </div>
          <div className="flex items-center gap-2 font-mono-data text-xs">
            <span className="text-[#869397] text-[10px] uppercase">Spatial Cell:</span>
            <span className="px-3 py-1 rounded bg-[#191f2f] text-[#4cd7f6] font-bold border border-[#3d494c]/40">
              {sector.h3HexId} ({sector.corridor})
            </span>
          </div>
        </div>

        {/* 3-Tier Model Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
          {/* Tier 1: Static Susceptibility */}
          <div className="p-3.5 rounded bg-[#141b2b] border border-[#3d494c]/40 shadow-md flex flex-col justify-between font-mono-data text-xs">
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between pb-1 border-b border-[#3d494c]/20">
                <div className="flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-[#4cd7f6]" />
                  <span className="font-headline text-sm text-[#dce2f7] font-bold">
                    Tier 1: Static Susceptibility
                  </span>
                </div>
                <span className="px-2 py-0.5 rounded bg-[#191f2f] text-[#4cd7f6] text-[10px] font-bold">
                  XGBoost / RF
                </span>
              </div>
              <p className="text-[#869397] text-[11px] font-body leading-tight">
                Topographic derivatives & structural geology baseline
              </p>

              <div className="p-2 rounded bg-[#070e1d] flex items-center justify-between border border-[#3d494c]/30 my-1">
                <span className="text-[10px] text-[#869397] uppercase font-bold">LSZ_static Score</span>
                <span className="text-lg text-[#ffb95f] font-bold">
                  0.78 <span className="text-xs text-[#869397]">/ 1.0</span>
                </span>
              </div>

              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between p-1.5 rounded bg-[#070e1d] border border-[#3d494c]/20">
                  <span className="text-[#869397]">Slope Angle</span>
                  <span className="text-[#ffb4ab] font-bold">{sector.slopeGradient}</span>
                </div>
                <div className="flex items-center justify-between p-1.5 rounded bg-[#070e1d] border border-[#3d494c]/20">
                  <span className="text-[#869397]">Slope Aspect</span>
                  <span className="text-[#dce2f7] font-semibold">214° (South-West)</span>
                </div>
                <div className="flex items-center justify-between p-1.5 rounded bg-[#070e1d] border border-[#3d494c]/20">
                  <span className="text-[#869397]">Lithology Class</span>
                  <span className="text-[#ffb95f] font-semibold truncate max-w-[150px]">Schist / Gneiss Regolith</span>
                </div>
                <div className="flex items-center justify-between p-1.5 rounded bg-[#070e1d] border border-[#3d494c]/20">
                  <span className="text-[#869397]">Teesta Fault Proximity</span>
                  <span className="text-[#ffb4ab] font-bold">180 m (Seismic Active)</span>
                </div>
                <div className="flex items-center justify-between p-1.5 rounded bg-[#070e1d] border border-[#3d494c]/20">
                  <span className="text-[#869397]">TPI & Curvature</span>
                  <span className="text-[#dce2f7] font-semibold">-0.42 (Concave Convergent)</span>
                </div>
              </div>
            </div>

            <div className="mt-3 pt-2 border-t border-[#3d494c]/30 flex items-center justify-between">
              <span className="text-[10px] text-[#869397] uppercase">CALIBRATION WEIGHT w1</span>
              <span className="text-xs text-[#4cd7f6] font-bold">{weights.w1.toFixed(2)}</span>
            </div>
          </div>

          {/* Tier 2: Dynamic Hydro-Saturation */}
          <div className="p-3.5 rounded bg-[#141b2b] border border-[#3d494c]/40 shadow-md flex flex-col justify-between font-mono-data text-xs">
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between pb-1 border-b border-[#3d494c]/20">
                <div className="flex items-center gap-1.5">
                  <Droplets className="w-4 h-4 text-[#ffb4ab]" />
                  <span className="font-headline text-sm text-[#dce2f7] font-bold">
                    Tier 2: Hydro-Saturation
                  </span>
                </div>
                <span className="px-2 py-0.5 rounded bg-[#a40217] text-[#ffdad6] text-[10px] font-bold">
                  Bi-LSTM / TFT
                </span>
              </div>
              <p className="text-[#869397] text-[11px] font-body leading-tight">
                Hydraulic pore pressure head and rainfall accumulation
              </p>

              <div className="p-2 rounded bg-[#070e1d] flex items-center justify-between border border-[#3d494c]/30 my-1">
                <span className="text-[10px] text-[#869397] uppercase font-bold">Φ_hydro Score</span>
                <span className="text-lg text-[#ffb4ab] font-bold">
                  0.94 <span className="text-xs text-[#869397]">/ 1.0</span>
                </span>
              </div>

              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between p-1.5 rounded bg-[#070e1d] border border-[#3d494c]/20">
                  <span className="text-[#869397]">Antecedent Rain (API 72h)</span>
                  <span className="text-[#ffb4ab] font-bold">{sector.precipitation72h} mm (Severe)</span>
                </div>
                <div className="flex items-center justify-between p-1.5 rounded bg-[#070e1d] border border-[#3d494c]/20">
                  <span className="text-[#869397]">I-D Threshold Ratio</span>
                  <span className="text-[#ffb4ab] font-bold">1.82x [Breached]</span>
                </div>
                <div className="flex items-center justify-between p-1.5 rounded bg-[#070e1d] border border-[#3d494c]/20">
                  <span className="text-[#869397]">Pore Water Pressure (PWP)</span>
                  <span className="text-[#ffb4ab] font-bold">{sector.porePressure} kPa (94% Head)</span>
                </div>
                <div className="flex items-center justify-between p-1.5 rounded bg-[#070e1d] border border-[#3d494c]/20">
                  <span className="text-[#869397]">Volumetric Water Content</span>
                  <span className="text-[#ffb95f] font-semibold">38.4% (Liquefaction band)</span>
                </div>
                <div className="flex items-center justify-between p-1.5 rounded bg-[#070e1d] border border-[#3d494c]/20">
                  <span className="text-[#869397]">Drainage Transmissivity</span>
                  <span className="text-[#869397] font-semibold">Blocked Culvert S-04</span>
                </div>
              </div>
            </div>

            <div className="mt-3 pt-2 border-t border-[#3d494c]/30 flex items-center justify-between">
              <span className="text-[10px] text-[#869397] uppercase">CALIBRATION WEIGHT w2</span>
              <span className="text-xs text-[#4cd7f6] font-bold">{weights.w2.toFixed(2)}</span>
            </div>
          </div>

          {/* Tier 3: Subsurface Kinematic Tilt */}
          <div className="p-3.5 rounded bg-[#141b2b] border border-[#3d494c]/40 shadow-md flex flex-col justify-between font-mono-data text-xs">
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between pb-1 border-b border-[#3d494c]/20">
                <div className="flex items-center gap-1.5">
                  <Activity className="w-4 h-4 text-[#ffb95f]" />
                  <span className="font-headline text-sm text-[#dce2f7] font-bold">
                    Tier 3: Kinematic Tilt
                  </span>
                </div>
                <span className="px-2 py-0.5 rounded bg-[#191f2f] text-[#ffb95f] text-[10px] font-bold">
                  Kalman-MEMS
                </span>
              </div>
              <p className="text-[#869397] text-[11px] font-body leading-tight">
                Subsurface micro-shear displacement rate & shear acoustics
              </p>

              <div className="p-2 rounded bg-[#070e1d] flex items-center justify-between border border-[#3d494c]/30 my-1">
                <span className="text-[10px] text-[#869397] uppercase font-bold">Ω_kinematic Score</span>
                <span className="text-lg text-[#ffb4ab] font-bold">
                  0.91 <span className="text-xs text-[#869397]">/ 1.0</span>
                </span>
              </div>

              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between p-1.5 rounded bg-[#070e1d] border border-[#3d494c]/20">
                  <span className="text-[#869397]">Tilt Velocity dθ/dt</span>
                  <span className="text-[#ffb4ab] font-bold">{sector.tiltVelocity}°/min (&gt;0.05 limit)</span>
                </div>
                <div className="flex items-center justify-between p-1.5 rounded bg-[#070e1d] border border-[#3d494c]/20">
                  <span className="text-[#869397]">Shear Plane Vibration</span>
                  <span className="text-[#ffb4ab] font-bold">{sector.vibrationG}g RMS (Micro-rupture)</span>
                </div>
                <div className="flex items-center justify-between p-1.5 rounded bg-[#070e1d] border border-[#3d494c]/20">
                  <span className="text-[#869397]">Triaxial Vectors [X,Y,Z]</span>
                  <span className="text-[#4cd7f6] font-semibold">+14.8°, -3.1°, +0.9°</span>
                </div>
                <div className="flex items-center justify-between p-1.5 rounded bg-[#070e1d] border border-[#3d494c]/20">
                  <span className="text-[#869397]">Inclinometer Node</span>
                  <span className="text-[#dce2f7] font-semibold">SN-SLOPE-089 (8.4m)</span>
                </div>
                <div className="flex items-center justify-between p-1.5 rounded bg-[#070e1d] border border-[#3d494c]/20">
                  <span className="text-[#869397]">Sensor Sampling Mode</span>
                  <span className="text-[#ffb4ab] font-bold">BURST (30s cadence)</span>
                </div>
              </div>
            </div>

            <div className="mt-3 pt-2 border-t border-[#3d494c]/30 flex items-center justify-between">
              <span className="text-[10px] text-[#869397] uppercase">CALIBRATION WEIGHT w3</span>
              <span className="text-xs text-[#4cd7f6] font-bold">{weights.w3.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Real-time Mathematical Weight Tuner Strip */}
        <div className="p-3 rounded bg-[#141b2b] border border-[#3d494c]/40 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 shadow-sm font-mono-data text-xs">
          <div className="flex flex-col">
            <span className="font-headline text-sm font-bold text-[#dce2f7]">
              Calibrated Risk Equilibrium Tuner
            </span>
            <span className="text-[#869397] text-[11px] font-body">
              Formula back-analyzed against 2020-2024 Teesta Basin Monsoon failures (N=1,420 events)
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5 bg-[#070e1d] px-2 py-1 rounded border border-[#3d494c]/30">
              <span className="text-[10px] text-[#4cd7f6] font-bold">w1(Static):</span>
              <button
                onClick={() => setWeights((w) => ({ ...w, w1: Math.max(0.1, Number((w.w1 - 0.05).toFixed(2))), w2: Number((w.w2 + 0.05).toFixed(2)) }))}
                className="text-[#869397] hover:text-white px-1"
              >-</button>
              <span className="font-bold text-[#dce2f7]">{weights.w1.toFixed(2)}</span>
              <button
                onClick={() => setWeights((w) => ({ ...w, w1: Math.min(0.5, Number((w.w1 + 0.05).toFixed(2))), w2: Number((w.w2 - 0.05).toFixed(2)) }))}
                className="text-[#869397] hover:text-white px-1"
              >+</button>
            </div>

            <div className="flex items-center gap-1.5 bg-[#070e1d] px-2 py-1 rounded border border-[#3d494c]/30">
              <span className="text-[10px] text-[#ffb4ab] font-bold">w2(Hydro):</span>
              <span className="font-bold text-[#dce2f7]">{weights.w2.toFixed(2)}</span>
            </div>

            <div className="flex items-center gap-1.5 bg-[#070e1d] px-2 py-1 rounded border border-[#3d494c]/30">
              <span className="text-[10px] text-[#ffb95f] font-bold">w3(Kin):</span>
              <span className="font-bold text-[#dce2f7]">{weights.w3.toFixed(2)}</span>
            </div>

            <div className="px-3 py-1 rounded bg-[#06b6d4] text-[#00424f] font-bold text-xs tracking-wider">
              Σ w = {(weights.w1 + weights.w2 + weights.w3).toFixed(2)}
            </div>

            <button
              onClick={() => setWeights({ w1: 0.25, w2: 0.45, w3: 0.30 })}
              className="px-2 py-1 bg-[#191f2f] hover:bg-[#232a3a] text-[#bcc9cd] rounded text-[10px] font-bold transition-colors"
            >
              Reset
            </button>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* SECTION 2: INSAR RADAR INTERFEROMETRY & TELEMETRY         */}
      {/* ========================================================= */}
      <section className="p-4 grid grid-cols-1 lg:grid-cols-12 gap-3">
        {/* Left InSAR Displacement Chart (8 Cols) */}
        <div className="lg:col-span-8 p-3.5 rounded bg-[#141b2b] border border-[#3d494c]/40 shadow-md flex flex-col gap-3 font-mono-data text-xs">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Satellite className="w-4 h-4 text-[#4cd7f6]" />
              <span className="font-headline text-base text-[#dce2f7] font-bold">
                Sentinel-1 InSAR Deformation Tracking
              </span>
            </div>
            <div className="flex items-center gap-1 text-[10px]">
              <span className="px-2 py-0.5 rounded bg-[#191f2f] text-[#869397]">Orbit 128 Ascending</span>
              <span className="px-2 py-0.5 rounded bg-[#191f2f] text-[#869397]">C-Band (5.4 GHz)</span>
              <span className="px-2 py-0.5 rounded bg-[#191f2f] text-[#4cd7f6] font-bold">γ = 0.84 (High Coherence)</span>
            </div>
          </div>

          {/* Line-of-Sight Displacement Chart */}
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-[10px] text-[#869397] uppercase">
                30-Day Cumulative LOS Ground Displacement Curve (mm)
              </span>
              <span className="text-[#ffb4ab] font-bold">Failure Asymptote Active</span>
            </div>

            <div className="w-full h-52 bg-[#070e1d] rounded p-2 relative overflow-hidden flex flex-col justify-end border border-[#3d494c]/30">
              <svg className="w-full h-full" viewBox="0 0 700 180" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="insarRedGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#ffb3ad" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#ffb3ad" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Safe baseline boundary */}
                <line x1="0" y1="40" x2="700" y2="40" stroke="#869397" strokeDasharray="4 4" strokeWidth="1" opacity="0.4" />
                <text x="10" y="35" fill="#869397" fontFamily="JetBrains Mono" fontSize="10">
                  Creep Threshold (-5.0 mm)
                </text>

                {/* Tertiary acceleration boundary */}
                <line x1="0" y1="130" x2="700" y2="130" stroke="#a40217" strokeDasharray="6 4" strokeWidth="1.5" opacity="0.8" />
                <text x="10" y="125" fill="#ffb4ab" fontFamily="JetBrains Mono" fontSize="10" fontWeight="bold">
                  CRITICAL FAILURE ASYMPTOTE (-18.0 mm)
                </text>

                {/* Projected Area Fill */}
                <path d="M 0,20 L 100,22 L 200,25 L 300,28 L 400,38 L 480,55 L 540,82 L 600,120 L 650,158 L 680,178 L 680,180 L 0,180 Z" fill="url(#insarRedGrad)" />

                {/* Main Displacement Line */}
                <path d="M 0,20 L 100,22 L 200,25 L 300,28 L 400,38 L 480,55 L 540,82 L 600,120 L 650,158 L 680,178" fill="none" stroke="#ffb3ad" strokeWidth="3" strokeLinecap="round" />

                {/* Current tertiary pulse */}
                <circle cx="680" cy="178" r="6" fill="#a40217" className="animate-ping" />
                <circle cx="680" cy="178" r="3.5" fill="#ffb4ab" />

                {/* Stable Sector 3 comparison baseline */}
                <path d="M 0,20 L 120,21 L 240,23 L 360,24 L 480,26 L 600,28 L 680,30" fill="none" stroke="#4cd7f6" strokeDasharray="3 3" strokeWidth="1.5" />
              </svg>

              <div className="flex justify-between items-center text-[10px] text-[#869397] px-1 mt-1 border-t border-[#3d494c]/20 pt-0.5">
                <span>T-30 Days</span>
                <span>T-20 Days</span>
                <span>T-10 Days</span>
                <span>T-48 Hrs</span>
                <span>T-24 Hrs</span>
                <span className="text-[#ffb4ab] font-bold">Now (Tertiary Phase)</span>
              </div>
            </div>
          </div>

          {/* Telemetry Matrix Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
            <div className="p-2 rounded bg-[#070e1d] border border-[#3d494c]/20 flex flex-col">
              <span className="text-[9px] text-[#869397]">Satellite Look Angle</span>
              <span className="text-xs font-bold text-[#dce2f7]">39.4° WGS84</span>
            </div>
            <div className="p-2 rounded bg-[#070e1d] border border-[#3d494c]/20 flex flex-col">
              <span className="text-[9px] text-[#869397]">Perpendicular Baseline</span>
              <span className="text-xs font-bold text-[#4cd7f6]">82.4 m</span>
            </div>
            <div className="p-2 rounded bg-[#070e1d] border border-[#3d494c]/20 flex flex-col">
              <span className="text-[9px] text-[#869397]">Temporal Decorrelation</span>
              <span className="text-xs font-bold text-[#dce2f7]">0.16 (Low)</span>
            </div>
            <div className="p-2 rounded bg-[#070e1d] border border-[#3d494c]/20 flex flex-col">
              <span className="text-[9px] text-[#869397]">PS-InSAR Persistent Pts</span>
              <span className="text-xs font-bold text-[#ffb95f]">412 Reflectors</span>
            </div>
          </div>
        </div>

        {/* Right Side: Fringe & Coherence Profile (4 Cols) */}
        <div className="lg:col-span-4 p-3.5 rounded bg-[#141b2b] border border-[#3d494c]/40 shadow-md flex flex-col justify-between font-mono-data text-xs">
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between pb-1 border-b border-[#3d494c]/20">
              <span className="font-headline text-sm text-[#dce2f7] font-bold">
                Fringe & Coherence Profile
              </span>
              <span className="px-1.5 py-0.5 rounded bg-[#191f2f] text-[#4cd7f6] text-[10px] font-bold">
                ISRO 10m DEM
              </span>
            </div>
            <p className="text-[#869397] text-[11px] font-body leading-tight">
              Wrapped phase fringes indicate 28mm LOS displacement cycle
            </p>

            {/* Wrapped Phase Fringe Visualizer */}
            <div className="h-32 rounded bg-[#070e1d] relative overflow-hidden flex items-center justify-center my-1 border border-[#3d494c]/30">
              <svg className="w-full h-full opacity-80" viewBox="0 0 300 120">
                <ellipse cx="150" cy="60" rx="130" ry="50" fill="none" stroke="#4cd7f6" strokeWidth="4" strokeOpacity="0.25" />
                <ellipse cx="150" cy="60" rx="100" ry="38" fill="none" stroke="#ffb95f" strokeWidth="4" strokeOpacity="0.45" />
                <ellipse cx="150" cy="60" rx="70" ry="26" fill="none" stroke="#ffb3ad" strokeWidth="4" strokeOpacity="0.65" />
                <ellipse cx="150" cy="60" rx="40" ry="15" fill="none" stroke="#ffb3ad" strokeWidth="5" strokeOpacity="0.9" />
                <circle cx="150" cy="60" r="5" fill="#a40217" className="animate-ping" />
                <circle cx="150" cy="60" r="3" fill="#ffffff" />
              </svg>
              <div className="absolute bottom-2 left-2 flex items-center gap-1 bg-[#070e1d]/90 px-2 py-0.5 rounded border border-[#3d494c]/40">
                <span className="text-[9px] text-[#869397]">Phase Delta:</span>
                <span className="text-[10px] text-[#ffb4ab] font-bold">4.2π rad</span>
              </div>
            </div>

            {/* Fringe Color Scale */}
            <div className="flex flex-col gap-1">
              <div className="w-full h-2 rounded-full bg-gradient-to-r from-[#4cd7f6] via-[#ffb95f] to-[#ffb4ab]" />
              <div className="flex justify-between text-[9px] text-[#869397]">
                <span>+5 mm (Uplift)</span>
                <span>0 mm</span>
                <span>-25 mm (Subsidence)</span>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-[#3d494c]/30 flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-[9px] text-[#869397]">DEM Coregistration</span>
              <span className="text-xs text-[#4cd7f6] font-bold">Cartosat 10m Aligned</span>
            </div>
            <button
              onClick={handleDownloadGeoTIFF}
              className="px-2.5 py-1 rounded bg-[#191f2f] hover:bg-[#232a3a] text-[#dce2f7] text-[11px] font-bold transition-colors flex items-center gap-1 border border-[#3d494c]/40"
            >
              {geoTiffDownloaded ? <Check className="w-3.5 h-3.5 text-[#4cd7f6]" /> : <Download className="w-3.5 h-3.5" />}
              <span>{geoTiffDownloaded ? 'Exported' : 'GeoTIFF'}</span>
            </button>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* SECTION 3: 72H TEMPORAL HORIZON & I-D THRESHOLD ENVELOPE  */}
      {/* ========================================================= */}
      <section className="p-4 grid grid-cols-1 lg:grid-cols-12 gap-3">
        {/* Empirical I-D Threshold Envelope (6 Cols) */}
        <div className="lg:col-span-6 p-3.5 rounded bg-[#141b2b] border border-[#3d494c]/40 shadow-md flex flex-col justify-between gap-2 font-mono-data text-xs">
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between pb-1 border-b border-[#3d494c]/20">
              <div className="flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-[#ffb4ab]" />
                <span className="font-headline text-sm text-[#dce2f7] font-bold">
                  Empirical I-D Threshold Envelope
                </span>
              </div>
              <span className="text-[10px] text-[#4cd7f6] font-bold">
                Caine (1980) / Guzzetti Formula
              </span>
            </div>
            <p className="text-[#869397] text-[11px] font-body">
              Intensity I = 14.82 × D<sup>-0.39</sup> vs Real-time Hydro Telemetry
            </p>

            <div className="w-full h-48 bg-[#070e1d] rounded p-2 relative overflow-hidden flex flex-col justify-end border border-[#3d494c]/30 my-1">
              <svg className="w-full h-full" viewBox="0 0 500 180" preserveAspectRatio="none">
                <path d="M 30,150 Q 150,90 480,60 L 480,180 L 30,180 Z" fill="#06b6d4" fillOpacity="0.08" />
                <path d="M 30,150 Q 150,90 480,60 L 480,10 L 30,10 Z" fill="#a40217" fillOpacity="0.18" />

                {/* Critical Threshold curve */}
                <path d="M 30,150 Q 150,90 480,60" fill="none" stroke="#ffb95f" strokeWidth="2.5" strokeDasharray="4 2" />

                {/* Storm Breach Dot */}
                <circle cx="180" cy="45" r="8" fill="#ef4444" className="animate-ping" />
                <circle cx="180" cy="45" r="4.5" fill="#a40217" />
                <circle cx="180" cy="45" r="2.5" fill="#ffb3ad" />

                <text x="195" y="42" fill="#ffb4ab" fontFamily="JetBrains Mono" fontSize="11" fontWeight="bold">
                  CURRENT: 48 mm/hr (3.2h)
                </text>
                <text x="195" y="56" fill="#ffb4ab" fontFamily="JetBrains Mono" fontSize="9">
                  [DEBRIS FLOW IMMINENT]
                </text>

                <text x="320" y="85" fill="#ffb95f" fontFamily="JetBrains Mono" fontSize="10">
                  Threshold Envelope (I_crit)
                </text>
                <text x="320" y="140" fill="#4cd7f6" fontFamily="JetBrains Mono" fontSize="10">
                  Stable Domain
                </text>
              </svg>

              <div className="flex justify-between items-center text-[10px] text-[#869397] px-1 border-t border-[#3d494c]/20 pt-0.5">
                <span>Duration D: 1 Hour</span>
                <span>3 Hours</span>
                <span>6 Hours</span>
                <span>12 Hours</span>
                <span>24 Hours</span>
              </div>
            </div>
          </div>

          <div className="p-2 rounded bg-[#070e1d] border border-[#3d494c]/30 flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-[9px] text-[#869397]">Threshold Exceedance Factor</span>
              <span className="text-xs text-[#ffb4ab] font-bold">1.82 × Safety Limit</span>
            </div>
            <div className="flex flex-col text-right">
              <span className="text-[9px] text-[#869397]">Calculated API 72h</span>
              <span className="text-xs text-[#ffb95f] font-bold">142.8 mm</span>
            </div>
          </div>
        </div>

        {/* Dual-Axis Factor of Safety (FoS) & PWP Trend (6 Cols) */}
        <div className="lg:col-span-6 p-3.5 rounded bg-[#141b2b] border border-[#3d494c]/40 shadow-md flex flex-col justify-between gap-2 font-mono-data text-xs">
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between pb-1 border-b border-[#3d494c]/20">
              <div className="flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-[#4cd7f6]" />
                <span className="font-headline text-sm text-[#dce2f7] font-bold">
                  Factor of Safety (FoS) & PWP Trend
                </span>
              </div>
              <span className="px-2 py-0.5 rounded bg-[#a40217] text-[#ffdad6] text-[10px] font-bold">
                FoS: 1.18 ➔ 0.82
              </span>
            </div>
            <p className="text-[#869397] text-[11px] font-body">
              72-Hour sliding window: Pore Pressure vs Projected Slope Rupture
            </p>

            <div className="w-full h-48 bg-[#070e1d] rounded p-2 relative overflow-hidden flex flex-col justify-end border border-[#3d494c]/30 my-1">
              <svg className="w-full h-full" viewBox="0 0 500 180" preserveAspectRatio="none">
                {/* FoS 1.0 Limit Line */}
                <line x1="0" y1="100" x2="500" y2="100" stroke="#ef4444" strokeDasharray="6 3" strokeWidth="1.5" />
                <text x="10" y="94" fill="#ffb4ab" fontFamily="JetBrains Mono" fontSize="10">
                  Limit Equilibrium Baseline (FoS = 1.00)
                </text>

                {/* FoS Decay Curve */}
                <path d="M 0,30 L 100,32 L 200,38 L 300,50 L 380,80 L 440,120 L 490,165" fill="none" stroke="#4cd7f6" strokeWidth="2.5" />

                {/* PWP Head Rise Curve */}
                <path d="M 0,160 L 100,155 L 200,140 L 300,120 L 380,85 L 440,45 L 490,20" fill="none" stroke="#ffb95f" strokeWidth="2" strokeDasharray="3 3" />

                {/* Failure Point */}
                <circle cx="440" cy="120" r="5" fill="#a40217" />
                <text x="340" y="145" fill="#ffb4ab" fontFamily="JetBrains Mono" fontSize="10" fontWeight="bold">
                  Failure Inception T-0
                </text>
              </svg>

              <div className="flex justify-between items-center text-[10px] text-[#869397] px-1 border-t border-[#3d494c]/20 pt-0.5">
                <span>T-72h (FoS 1.65)</span>
                <span>T-48h (FoS 1.52)</span>
                <span>T-24h (FoS 1.34)</span>
                <span>Now (FoS 1.18)</span>
                <span className="text-[#ffb4ab] font-bold">+30m Proj (0.82)</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div className="p-1.5 rounded bg-[#070e1d] border border-[#3d494c]/20 flex flex-col">
              <span className="text-[9px] text-[#869397]">Current FoS</span>
              <span className="text-xs text-[#ffb95f] font-bold">1.18 (Critical)</span>
            </div>
            <div className="p-1.5 rounded bg-[#070e1d] border border-[#3d494c]/20 flex flex-col">
              <span className="text-[9px] text-[#869397]">Slope Saturation</span>
              <span className="text-xs text-[#ffb4ab] font-bold">94% Head</span>
            </div>
            <div className="p-1.5 rounded bg-[#070e1d] border border-[#3d494c]/20 flex flex-col">
              <span className="text-[9px] text-[#869397]">Velocity Spike</span>
              <span className="text-xs text-[#4cd7f6] font-bold">+210% / 6h</span>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* SECTION 3B: GEMINI MULTI-MODAL AI GEOTECHNICAL MATRIX     */}
      {/* ========================================================= */}
      <section className="px-4 pb-2">
        <div className="p-4 rounded-lg bg-[#141b2b] border border-[#4cd7f6]/40 shadow-lg font-mono-data text-xs flex flex-col gap-3">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-2 border-b border-[#3d494c]/30">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded bg-[#06b6d4]/20 border border-[#4cd7f6]/50 flex items-center justify-center text-[#4cd7f6]">
                <BrainCircuit className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-headline text-base text-[#dce2f7] font-bold uppercase">
                    Gemini Multi-Modal Geotechnical Reasoning Engine
                  </h3>
                  <span className="px-2 py-0.5 rounded bg-[#06b6d4] text-[#003640] text-[9px] font-bold">
                    GEMINI 3.8 FLASH
                  </span>
                </div>
                <p className="text-[11px] text-[#869397] font-body">
                  Correlating sensor tilt velocity, pore pressure head, InSAR phase gradients, and live GPS telemetry.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {onOpenReportModal && (
                <button
                  type="button"
                  onClick={onOpenReportModal}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-[#191f2f] hover:bg-[#232a3a] text-[#4cd7f6] rounded border border-[#4cd7f6]/40 text-xs font-bold uppercase transition-colors shadow-sm"
                  title="Export Formatted PDF Risk Assessment Report"
                >
                  <FileDown className="w-3.5 h-3.5 text-[#4cd7f6]" />
                  <span>Export Report PDF</span>
                </button>
              )}
              {onToggleAiCopilot && (
                <button
                  type="button"
                  onClick={onToggleAiCopilot}
                  className="px-3 py-1.5 bg-[#191f2f] hover:bg-[#232a3a] text-[#4cd7f6] rounded border border-[#4cd7f6]/40 text-xs font-bold uppercase transition-colors"
                >
                  Interactive Copilot Chat
                </button>
              )}
              <button
                type="button"
                onClick={handleRunAiAnalysis}
                disabled={isAiLoading}
                className="flex items-center gap-1.5 px-4 py-1.5 bg-[#06b6d4] hover:bg-[#06b6d4]/90 text-[#00424f] rounded text-xs font-bold uppercase tracking-wider transition-all shadow-md active:scale-95"
              >
                <Sparkles className={`w-4 h-4 ${isAiLoading ? 'animate-spin' : ''}`} />
                <span>{isAiLoading ? 'Synthesizing Physics Model...' : 'Run Live AI Geotechnical Diagnosis'}</span>
              </button>
            </div>
          </div>

          {/* AI Assessment Display */}
          {aiAssessment ? (
            <div className="flex flex-col gap-3 animate-in fade-in duration-300">
              <div className="p-3 bg-[#070e1d] rounded border border-[#a40217]/50 flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="flex flex-col gap-0.5">
                  <span className="text-[10px] text-[#869397] uppercase font-bold">Threat Classification</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-[#ffb4ab]">{aiAssessment.threatLevel}</span>
                    <span className="text-xs text-[#869397]">• P(Catastrophic Rupture) = {aiAssessment.failureProbability}</span>
                  </div>
                </div>
                <div className="flex flex-col md:text-right">
                  <span className="text-[10px] text-[#869397] uppercase font-bold">Predicted Rupture Window</span>
                  <span className="text-sm font-bold text-[#ffdad6]">{aiAssessment.estimatedTimeWindow}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="p-3 rounded bg-[#070e1d] border border-[#3d494c]/30 flex flex-col gap-1">
                  <span className="text-[10px] text-[#869397] uppercase font-bold flex items-center gap-1">
                    <TrendingUp className="w-3.5 h-3.5 text-[#ffb95f]" />
                    Geomechanical Failure Mechanism
                  </span>
                  <p className="text-[#dce2f7] text-xs font-body leading-relaxed">
                    {aiAssessment.failureMechanism}
                  </p>
                </div>

                <div className="p-3 rounded bg-[#070e1d] border border-[#3d494c]/30 flex flex-col gap-1">
                  <span className="text-[10px] text-[#869397] uppercase font-bold flex items-center gap-1">
                    <ShieldAlert className="w-3.5 h-3.5 text-[#4cd7f6]" />
                    Evacuation & Mitigation SOP
                  </span>
                  <p className="text-[#dce2f7] text-xs font-body leading-relaxed">
                    {aiAssessment.evacuationAdvice}
                  </p>
                </div>
              </div>

              {aiAssessment.tacticalDirectives && aiAssessment.tacticalDirectives.length > 0 && (
                <div className="p-2.5 rounded bg-[#070e1d] border border-[#3d494c]/30 flex flex-col gap-1">
                  <span className="text-[10px] text-[#869397] uppercase font-bold">Immediate Tactical Directives:</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 mt-1">
                    {aiAssessment.tacticalDirectives.map((d, i) => (
                      <div key={i} className="p-2 rounded bg-[#141b2b] border border-[#3d494c]/20 text-[11px] text-[#bcc9cd] flex items-start gap-1.5">
                        <span className="text-[#4cd7f6] font-bold">•</span>
                        <span>{d}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="p-4 rounded bg-[#070e1d] border border-[#3d494c]/20 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <BrainCircuit className="w-6 h-6 text-[#4cd7f6] opacity-70" />
                <span className="text-xs text-[#bcc9cd]">
                  Click <strong>Run Live AI Geotechnical Diagnosis</strong> to query the fine-tuned Gemini model for continuous slope kinematic evaluation.
                </span>
              </div>
              <button
                type="button"
                onClick={handleRunAiAnalysis}
                className="px-3.5 py-1.5 bg-[#191f2f] hover:bg-[#232a3a] text-[#4cd7f6] rounded text-xs uppercase font-bold border border-[#4cd7f6]/40 transition-colors flex-shrink-0"
              >
                Analyze Telemetry Now
              </button>
            </div>
          )}
        </div>
      </section>

      {/* ========================================================= */}
      {/* SECTION 4: PRIORITY H3 HEXAGONAL SPATIAL CLUSTERS TABLE   */}
      {/* ========================================================= */}
      <section className="p-4 flex flex-col gap-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Grid className="w-4 h-4 text-[#4cd7f6]" />
            <span className="font-headline text-base text-[#dce2f7] font-bold">
              Priority H3 Hexagonal Spatial Clusters
            </span>
            <span className="font-mono-data text-xs text-[#869397]">
              (Uber H3 Res 8 & Res 9 Partitioning)
            </span>
          </div>

          <div className="flex items-center gap-2 font-mono-data text-xs">
            <button
              onClick={() => setFilterBreached(!filterBreached)}
              className={`px-3 py-1 rounded transition-colors flex items-center gap-1.5 border border-[#3d494c]/40 font-semibold ${
                filterBreached ? 'bg-[#4cd7f6] text-[#003640]' : 'bg-[#191f2f] text-[#bcc9cd] hover:bg-[#232a3a]'
              }`}
            >
              <Filter className="w-3.5 h-3.5" />
              <span>{filterBreached ? 'Showing Breached Only' : 'Filter Breached Sectors'}</span>
            </button>

            <button
              onClick={handleForcePostGIS}
              disabled={isQueryingPostGIS}
              className="px-3 py-1 rounded bg-[#06b6d4] hover:bg-[#06b6d4]/90 text-[#00424f] font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-sm active:scale-95"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isQueryingPostGIS ? 'animate-spin' : ''}`} />
              <span>{isQueryingPostGIS ? 'Querying...' : 'Force PostGIS Query'}</span>
            </button>
          </div>
        </div>

        {/* Dense Tactical Telemetry Table */}
        <div className="w-full overflow-x-auto rounded bg-[#141b2b] border border-[#3d494c]/40 shadow-md">
          <table className="w-full text-left border-collapse font-mono-data text-xs">
            <thead>
              <tr className="bg-[#070e1d] text-[#869397] uppercase text-[10px] border-b border-[#3d494c]/30">
                <th className="p-3">H3 Cell Index</th>
                <th className="p-3">Geographic Sector / Corridor</th>
                <th className="p-3">Static LSZ</th>
                <th className="p-3">Hydro Φ</th>
                <th className="p-3">Kinematic Ω</th>
                <th className="p-3">Composite S_H3</th>
                <th className="p-3">Threat Status</th>
                <th className="p-3 text-right">Tactical Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#3d494c]/20">
              {displayedClusters.map((row) => {
                const isCritical = row.threatStatus === 'CRITICAL RED';
                return (
                  <tr
                    key={row.cellId}
                    className={`transition-colors ${
                      isCritical
                        ? 'bg-[#a40217]/20 hover:bg-[#a40217]/30'
                        : 'hover:bg-[#191f2f]'
                    }`}
                  >
                    {/* H3 ID */}
                    <td className="p-3 font-bold text-[#4cd7f6] flex items-center gap-2">
                      <span
                        className={`w-2 h-2 rounded-full ${
                          isCritical
                            ? 'bg-[#ffb4ab] animate-ping'
                            : row.statusType === 'tertiary'
                            ? 'bg-[#ffb95f]'
                            : 'bg-[#4cd7f6]'
                        }`}
                      />
                      <span>{row.cellId}</span>
                    </td>

                    {/* Sector name & description */}
                    <td className="p-3 text-[#dce2f7]">
                      <span className="font-semibold block">{row.sectorName}</span>
                      <span className="text-[10px] text-[#869397]">{row.threatDescription}</span>
                    </td>

                    <td className="p-3 text-[#ffb95f]">{row.staticLSZ.toFixed(2)}</td>
                    <td className={`p-3 font-bold ${row.hydroPhi >= 0.8 ? 'text-[#ffb4ab]' : 'text-[#ffb95f]'}`}>
                      {row.hydroPhi.toFixed(2)}
                    </td>
                    <td className={`p-3 font-bold ${row.kinematicOmega >= 0.8 ? 'text-[#ffb4ab]' : 'text-[#ffb95f]'}`}>
                      {row.kinematicOmega.toFixed(2)}
                    </td>

                    {/* Composite Score with mini bar */}
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <span className={`font-bold ${isCritical ? 'text-[#ffb4ab] text-sm' : 'text-[#dce2f7]'}`}>
                          {row.compositeScore.toFixed(2)}
                        </span>
                        <div className="w-14 h-1.5 bg-[#2e3545] rounded-full overflow-hidden">
                          <div
                            className={`h-full ${isCritical ? 'bg-[#ffb4ab]' : 'bg-[#ffb95f]'}`}
                            style={{ width: `${Math.round(row.compositeScore * 100)}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    {/* Threat Status Badge */}
                    <td className="p-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          row.threatStatus === 'CRITICAL RED'
                            ? 'bg-[#a40217] text-[#ffdad6]'
                            : row.threatStatus === 'WARNING ORG'
                            ? 'bg-[#e79400] text-[#2a1700]'
                            : 'bg-[#191f2f] text-[#4cd7f6]'
                        }`}
                      >
                        {row.threatStatus}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {isCritical ? (
                          <>
                            <button
                              onClick={() => onTriggerCapForCell(row.cellId)}
                              className="px-2.5 py-1 rounded bg-[#a40217] hover:bg-[#a40217]/90 text-[#ffdad6] font-bold uppercase text-[10px] transition-all shadow-[0_0_8px_rgba(164,2,23,0.4)]"
                            >
                              Trigger CAP
                            </button>
                            <button
                              onClick={() => onNavigateTo3D(row.cellId)}
                              className="px-2.5 py-1 rounded bg-[#070e1d] hover:bg-[#191f2f] text-[#4cd7f6] text-[10px] font-bold border border-[#4cd7f6]/30 transition-colors"
                            >
                              Cone 3D
                            </button>
                          </>
                        ) : row.threatStatus === 'WARNING ORG' ? (
                          <>
                            <button
                              onClick={() => onTriggerCapForCell(row.cellId)}
                              className="px-2.5 py-1 rounded bg-[#191f2f] hover:bg-[#232a3a] text-[#ffb95f] font-bold uppercase text-[10px] transition-colors border border-[#ffb95f]/30"
                            >
                              Evac Prep
                            </button>
                            <button
                              onClick={() => onNavigateTo3D(row.cellId)}
                              className="px-2.5 py-1 rounded bg-[#070e1d] hover:bg-[#191f2f] text-[#4cd7f6] text-[10px] transition-colors"
                            >
                              InSAR PS
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => onNavigateTo3D(row.cellId)}
                              className="px-2.5 py-1 rounded bg-[#191f2f] hover:bg-[#232a3a] text-[#bcc9cd] font-semibold text-[10px] transition-colors"
                            >
                              Log Survey
                            </button>
                            <button
                              onClick={() => onNavigateTo3D(row.cellId)}
                              className="px-2.5 py-1 rounded bg-[#070e1d] hover:bg-[#191f2f] text-[#4cd7f6] text-[10px] transition-colors"
                            >
                              Inspect
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};
