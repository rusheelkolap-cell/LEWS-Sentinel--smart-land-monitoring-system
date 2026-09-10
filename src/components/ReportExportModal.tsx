import React, { useState } from 'react';
import { SectorConfig, AiGeotechnicalAssessment, LiveLocationState, SlopeNode } from '../types';
import { downloadRiskAssessmentPdf } from '../utils/exportRiskAssessmentPdf';
import { 
  FileDown, 
  X, 
  Check, 
  BrainCircuit, 
  ShieldAlert, 
  Radio, 
  MapPin, 
  FileText, 
  CheckCircle2, 
  Printer,
  Sparkles
} from 'lucide-react';

interface ReportExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  sector: SectorConfig;
  aiAssessment?: AiGeotechnicalAssessment | null;
  location?: LiveLocationState;
  sirenActive?: boolean;
  nodes?: SlopeNode[];
  onNotify?: (message: string) => void;
}

export const ReportExportModal: React.FC<ReportExportModalProps> = ({
  isOpen,
  onClose,
  sector,
  aiAssessment,
  location,
  sirenActive = true,
  nodes,
  onNotify,
}) => {
  const [officerName, setOfficerName] = useState('Cmdr. V. R. Sharma (SDMA Lead Controller)');
  const [includeAi, setIncludeAi] = useState(true);
  const [includeAlerts, setIncludeAlerts] = useState(true);
  const [includeSensors, setIncludeSensors] = useState(true);
  const [includeLocation, setIncludeLocation] = useState(true);
  const [commanderNotes, setCommanderNotes] = useState(
    'Red alert condition confirmed by in-situ inclinometers. Emergency containment active along NH-10. SDRF and BRO on standby.'
  );
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  if (!isOpen) return null;

  const handleDownload = () => {
    setIsDownloading(true);
    try {
      downloadRiskAssessmentPdf({
        sector,
        aiAssessment: includeAi ? aiAssessment : null,
        location: includeLocation ? location : undefined,
        sirenActive,
        officerName,
        reportNotes: commanderNotes,
        nodes,
      });

      setDownloadSuccess(true);
      if (onNotify) {
        onNotify(`PDF Risk Assessment Report downloaded for ${sector.name}`);
      }

      setTimeout(() => {
        setIsDownloading(false);
        setDownloadSuccess(false);
        onClose();
      }, 1400);
    } catch (err) {
      console.error('PDF generation error:', err);
      setIsDownloading(false);
      if (onNotify) {
        onNotify('Error generating PDF report. Please try again.');
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#070e1d]/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#141b2b] max-w-2xl w-full rounded-lg border border-[#3d494c]/60 shadow-[0_0_35px_rgba(0,0,0,0.85)] flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="p-4 bg-[#070e1d] flex items-center justify-between border-b border-[#3d494c]/40">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded bg-[#191f2f] flex items-center justify-center text-[#4cd7f6] border border-[#4cd7f6]/40 shadow-sm">
              <FileDown className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-headline text-base text-[#dce2f7] font-bold">
                  Export Sector Risk Assessment Report
                </h3>
                <span className="px-2 py-0.5 rounded bg-[#a40217] text-[#ffdad6] text-[10px] font-mono-data font-bold uppercase">
                  PDF FORMAT
                </span>
              </div>
              <p className="text-[11px] font-mono-data text-[#869397]">
                Official NDMA & SDMA Field Summary • {sector.name}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded bg-[#191f2f] hover:bg-[#232a3a] text-[#869397] hover:text-[#dce2f7] flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto flex flex-col gap-4 font-body text-xs text-[#dce2f7]">
          {/* Executive Overview Card */}
          <div className="p-3.5 bg-[#070e1d] rounded border border-[#3d494c]/40 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="font-mono-data text-[11px] uppercase text-[#869397] font-bold">
                Target Sector Overview
              </span>
              <span className="px-2 py-0.5 rounded bg-[#a40217]/20 border border-[#a40217]/60 text-[#ffb4ab] font-mono-data text-[10px] font-bold">
                {sector.threatIndex}
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono-data text-[11px] mt-1">
              <div className="bg-[#141b2b] p-2 rounded">
                <span className="text-[#869397] text-[10px] block">CORRIDOR</span>
                <span className="font-bold text-[#dce2f7]">{sector.criticalKm}</span>
              </div>
              <div className="bg-[#141b2b] p-2 rounded">
                <span className="text-[#869397] text-[10px] block">FACTOR OF SAFETY</span>
                <span className="font-bold text-[#ffb95f]">{sector.fos.toFixed(2)} FoS</span>
              </div>
              <div className="bg-[#141b2b] p-2 rounded">
                <span className="text-[#869397] text-[10px] block">LEAD TIME RUNWAY</span>
                <span className="font-bold text-[#ffb4ab]">{sector.leadTimeMinutes} min</span>
              </div>
              <div className="bg-[#141b2b] p-2 rounded">
                <span className="text-[#869397] text-[10px] block">CIVIL EXPOSURE</span>
                <span className="font-bold text-[#4cd7f6]">{sector.exposedHabitations} homes</span>
              </div>
            </div>
          </div>

          {/* Included Sections Checklist */}
          <div className="flex flex-col gap-2">
            <span className="font-mono-data text-[11px] text-[#869397] uppercase font-bold">
              Included Intelligence Modules
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 font-mono-data text-xs">
              {/* AI Geotechnical Predictions */}
              <label className="flex items-start gap-2.5 p-3 rounded bg-[#070e1d] border border-[#3d494c]/30 hover:border-[#4cd7f6]/40 cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  checked={includeAi}
                  onChange={(e) => setIncludeAi(e.target.checked)}
                  className="mt-0.5 accent-[#4cd7f6]"
                />
                <div className="flex flex-col">
                  <span className="font-bold text-[#dce2f7] flex items-center gap-1.5">
                    <BrainCircuit className="w-3.5 h-3.5 text-[#4cd7f6]" />
                    AI Kinematic Predictions
                  </span>
                  <span className="text-[10px] text-[#869397] font-body">
                    Gemini 3.8 Flash failure probability, time window, and geomechanical diagnosis
                  </span>
                </div>
              </label>

              {/* Active Alerts & CAP v1.2 */}
              <label className="flex items-start gap-2.5 p-3 rounded bg-[#070e1d] border border-[#3d494c]/30 hover:border-[#4cd7f6]/40 cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  checked={includeAlerts}
                  onChange={(e) => setIncludeAlerts(e.target.checked)}
                  className="mt-0.5 accent-[#4cd7f6]"
                />
                <div className="flex flex-col">
                  <span className="font-bold text-[#dce2f7] flex items-center gap-1.5">
                    <ShieldAlert className="w-3.5 h-3.5 text-[#ffb4ab]" />
                    Active Alerts & Multi-Lingual Dispatches
                  </span>
                  <span className="text-[10px] text-[#869397] font-body">
                    CAP v1.2 emergency orders, siren status, English, Hindi, Nepali dispatches
                  </span>
                </div>
              </label>

              {/* In-situ Sensor Mesh */}
              <label className="flex items-start gap-2.5 p-3 rounded bg-[#070e1d] border border-[#3d494c]/30 hover:border-[#4cd7f6]/40 cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  checked={includeSensors}
                  onChange={(e) => setIncludeSensors(e.target.checked)}
                  className="mt-0.5 accent-[#4cd7f6]"
                />
                <div className="flex flex-col">
                  <span className="font-bold text-[#dce2f7] flex items-center gap-1.5">
                    <Radio className="w-3.5 h-3.5 text-[#ffb95f]" />
                    Sensor Mesh & H3 Spatial Grid
                  </span>
                  <span className="text-[10px] text-[#869397] font-body">
                    Inclinometer tilt rates, borehole depths, battery levels, H3 composite scores
                  </span>
                </div>
              </label>

              {/* Live Location Sentinel Telemetry */}
              <label className="flex items-start gap-2.5 p-3 rounded bg-[#070e1d] border border-[#3d494c]/30 hover:border-[#4cd7f6]/40 cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  checked={includeLocation}
                  onChange={(e) => setIncludeLocation(e.target.checked)}
                  className="mt-0.5 accent-[#4cd7f6]"
                />
                <div className="flex flex-col">
                  <span className="font-bold text-[#dce2f7] flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#4cd7f6]" />
                    Live Field GPS Sentinel Telemetry
                  </span>
                  <span className="text-[10px] text-[#869397] font-body">
                    Responder coordinates, distance to failure crown, geofence safety envelope
                  </span>
                </div>
              </label>
            </div>
          </div>

          {/* Authorized Officer Sign-off */}
          <div className="flex flex-col gap-1.5 font-mono-data text-xs">
            <label className="text-[11px] text-[#869397] uppercase font-bold">
              Authorized Incident Commander
            </label>
            <input
              type="text"
              value={officerName}
              onChange={(e) => setOfficerName(e.target.value)}
              className="px-3 py-2 bg-[#070e1d] border border-[#3d494c]/50 rounded text-[#dce2f7] focus:outline-none focus:border-[#4cd7f6] text-xs"
              placeholder="Officer Name & Designation"
            />
          </div>

          {/* Commander Notes */}
          <div className="flex flex-col gap-1.5 font-mono-data text-xs">
            <label className="text-[11px] text-[#869397] uppercase font-bold">
              Tactical Dispatch Notes (Appended to Official Report)
            </label>
            <textarea
              rows={2}
              value={commanderNotes}
              onChange={(e) => setCommanderNotes(e.target.value)}
              className="px-3 py-2 bg-[#070e1d] border border-[#3d494c]/50 rounded text-[#dce2f7] focus:outline-none focus:border-[#4cd7f6] text-xs resize-none"
              placeholder="Add specific tactical instructions or situation remarks..."
            />
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-[#070e1d] flex items-center justify-between border-t border-[#3d494c]/40 flex-wrap gap-3">
          <div className="flex items-center gap-2 text-[#869397] text-[11px] font-mono-data">
            <FileText className="w-4 h-4 text-[#4cd7f6]" />
            <span>Standard A4 2-Page Tactical Intelligence Document</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 bg-[#191f2f] hover:bg-[#232a3a] text-[#869397] hover:text-[#dce2f7] rounded font-mono-data text-xs font-semibold transition-colors"
            >
              Cancel
            </button>

            <button
              type="button"
              disabled={isDownloading}
              onClick={handleDownload}
              className={`flex items-center gap-2 px-5 py-2 rounded font-mono-data text-xs font-bold uppercase tracking-wider transition-all shadow-md active:scale-95 ${
                downloadSuccess
                  ? 'bg-[#10b981] text-[#070a0f]'
                  : 'bg-[#4cd7f6] hover:bg-[#4cd7f6]/90 text-[#003640] shadow-[0_0_15px_rgba(76,215,246,0.4)]'
              }`}
            >
              {downloadSuccess ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Report Downloaded!</span>
                </>
              ) : isDownloading ? (
                <>
                  <Sparkles className="w-4 h-4 animate-spin" />
                  <span>Generating Vector PDF...</span>
                </>
              ) : (
                <>
                  <FileDown className="w-4 h-4" />
                  <span>Download Risk Assessment PDF</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
