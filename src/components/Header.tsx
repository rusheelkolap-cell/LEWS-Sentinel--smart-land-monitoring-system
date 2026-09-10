import React from 'react';
import { SectorId, LiveLocationState } from '../types';
import { Volume2, VolumeX, ShieldAlert, Crosshair, BrainCircuit, FileDown, MapPin, ChevronDown } from 'lucide-react';

interface HeaderProps {
  currentSector: SectorId;
  onSelectSector: (sector: SectorId) => void;
  onOpenCapModal: () => void;
  sirenActive: boolean;
  onToggleSiren: () => void;
  location?: LiveLocationState;
  onToggleLocation?: () => void;
  onNavigateToLocationConsole?: () => void;
  isAiCopilotOpen?: boolean;
  onToggleAiCopilot?: () => void;
  onOpenReportModal?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentSector,
  onSelectSector,
  onOpenCapModal,
  sirenActive,
  onToggleSiren,
  location,
  onToggleLocation,
  onNavigateToLocationConsole,
  isAiCopilotOpen,
  onToggleAiCopilot,
  onOpenReportModal,
}) => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-16 bg-[#070e1d]/95 backdrop-blur-xl border-b border-[#3d494c]/30 shadow-md px-4 lg:px-6 flex items-center justify-between gap-3">
      {/* Brand & Sector Selection */}
      <div className="flex items-center gap-3 md:gap-5 flex-shrink-0">
        <div className="flex items-center gap-2.5">
          {/* Clean Radar Beacon Logo */}
          <div className="w-9 h-9 rounded-lg bg-[#141b2b] border border-[#4cd7f6]/40 flex items-center justify-center relative shadow-[0_0_10px_rgba(76,215,246,0.2)]">
            <div className="w-2.5 h-2.5 rounded-full bg-[#4cd7f6] animate-pulse" />
          </div>

          <div className="flex flex-col leading-tight">
            <div className="flex items-center gap-2">
              <span className="font-headline text-base md:text-lg text-white font-bold tracking-tight">
                LEWS <span className="text-[#4cd7f6]">Sentinel</span>
              </span>
              <span className="hidden sm:inline-flex items-center gap-1 px-1.5 py-0.5 bg-[#141b2b] rounded text-[#86efac] text-[10px] font-mono-data font-semibold border border-[#22c55e]/30">
                <span className="w-1.5 h-1.5 rounded-full bg-[#22c55e] animate-ping" />
                Live
              </span>
            </div>
            <span className="text-[10px] text-[#869397] font-mono-data hidden sm:inline">
              Landslide Early Warning & Response
            </span>
          </div>
        </div>

        {/* Clean Sector Selector */}
        <div className="relative flex items-center bg-[#141b2b] hover:bg-[#191f2f] transition-colors rounded-lg border border-[#3d494c]/50 px-2.5 py-1.5 text-xs">
          <MapPin className="w-3.5 h-3.5 text-[#4cd7f6] mr-1.5 flex-shrink-0" />
          <select
            id="sector-select-header"
            value={currentSector}
            onChange={(e) => onSelectSector(e.target.value as SectorId)}
            className="bg-transparent font-medium text-[#dce2f7] focus:outline-none cursor-pointer pr-5 appearance-none text-xs"
          >
            <option className="bg-[#141b2b] text-[#dce2f7]" value="kalimpong">
              NH-10 Kalimpong Corridor
            </option>
            <option className="bg-[#141b2b] text-[#dce2f7]" value="ghats">
              Western Ghats SH-72
            </option>
            <option className="bg-[#141b2b] text-[#dce2f7]" value="uttarakhand">
              Uttarakhand NH-58 Axis
            </option>
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-[#869397] absolute right-2 pointer-events-none" />
        </div>
      </div>

      {/* Primary Action Controls */}
      <div className="flex items-center gap-2 md:gap-3 flex-shrink-0">
        {/* Live GPS Sentinel Status Pill */}
        {location && (
          <button
            id="header-btn-gps-toggle"
            type="button"
            onClick={onNavigateToLocationConsole || onToggleLocation}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border transition-all text-xs font-mono-data ${
              location.enabled
                ? location.insideGeofence
                  ? 'bg-[#a40217]/30 text-[#ffdad6] border-[#ffb4ab] animate-pulse shadow-sm'
                  : 'bg-[#06b6d4]/15 text-[#4cd7f6] border-[#4cd7f6]/50'
                : 'bg-[#141b2b] text-[#869397] border-[#3d494c]/40 hover:text-[#dce2f7]'
            }`}
            title="Live Field Location Sentinel"
          >
            <Crosshair className={`w-3.5 h-3.5 ${location.enabled ? 'text-current animate-spin' : 'text-[#869397]'}`} style={{ animationDuration: '8s' }} />
            <span className="font-semibold hidden md:inline">
              {location.enabled
                ? location.insideGeofence
                  ? 'In Danger Zone'
                  : 'GPS Tracking'
                : 'GPS Off'}
            </span>
          </button>
        )}

        {/* AI Geotechnical Copilot Button */}
        {onToggleAiCopilot && (
          <button
            id="header-btn-ai-copilot"
            type="button"
            onClick={onToggleAiCopilot}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              isAiCopilotOpen
                ? 'bg-[#4cd7f6] text-[#003640] font-bold shadow-md'
                : 'bg-[#141b2b] hover:bg-[#191f2f] text-[#4cd7f6] border border-[#4cd7f6]/40'
            }`}
            title="Open AI Geotechnical Assistant"
          >
            <BrainCircuit className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">AI Assistant</span>
          </button>
        )}

        {/* Export Report PDF Button */}
        {onOpenReportModal && (
          <button
            id="header-btn-export-pdf"
            type="button"
            onClick={onOpenReportModal}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-[#141b2b] hover:bg-[#191f2f] text-[#dce2f7] rounded-lg border border-[#3d494c]/60 text-xs font-medium transition-all hover:border-[#4cd7f6]/50"
            title="Export Sector Report as PDF"
          >
            <FileDown className="w-3.5 h-3.5 text-[#4cd7f6]" />
            <span>Report PDF</span>
          </button>
        )}

        {/* Siren Toggle Switch */}
        <button
          id="header-btn-siren-toggle"
          type="button"
          onClick={onToggleSiren}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border transition-all text-xs font-medium ${
            sirenActive
              ? 'bg-[#93000a] text-white border-[#ffb4ab] shadow-[0_0_10px_rgba(239,68,68,0.5)] animate-pulse'
              : 'bg-[#141b2b] text-[#869397] border-[#3d494c]/50 hover:text-[#dce2f7]'
          }`}
          title={sirenActive ? 'Solar Siren Warbling (Click to Silence)' : 'Activate Warning Siren'}
        >
          {sirenActive ? (
            <Volume2 className="w-3.5 h-3.5 text-[#ffdad6]" />
          ) : (
            <VolumeX className="w-3.5 h-3.5" />
          )}
          <span className="hidden lg:inline">{sirenActive ? 'Siren On' : 'Siren'}</span>
        </button>

        {/* Emergency Alert (CAP Dispatch) */}
        <button
          id="header-btn-cap-dispatch"
          type="button"
          onClick={onOpenCapModal}
          className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#a40217] hover:bg-[#a40217]/90 text-white rounded-lg text-xs font-bold uppercase tracking-wider transition-all shadow-md active:scale-95"
        >
          <ShieldAlert className="w-3.5 h-3.5 text-[#ffdad6]" />
          <span>Alert Dispatch</span>
        </button>
      </div>
    </header>
  );
};
