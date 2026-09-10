import React from 'react';
import { ScreenType, SectorConfig, LiveLocationState } from '../types';
import { Globe, BrainCircuit, ShieldAlert, Cpu, Radio, AlertTriangle, Crosshair, FileDown } from 'lucide-react';

interface SidebarProps {
  currentScreen: ScreenType;
  onNavigate: (screen: ScreenType) => void;
  sector: SectorConfig;
  location?: LiveLocationState;
  onOpenReportModal?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentScreen, onNavigate, sector, location, onOpenReportModal }) => {
  const navItems = [
    {
      id: '3d-gis-command-center' as ScreenType,
      label: 'Geospatial Map',
      icon: Globe,
      badge: '3D',
    },
    {
      id: 'live-location-sentinel' as ScreenType,
      label: 'Live Location',
      icon: Crosshair,
      badge: location?.enabled 
        ? location.proximityStatus === 'CRITICAL_ZONE'
          ? 'DANGER'
          : 'ACTIVE'
        : undefined,
    },
    {
      id: 'ai-predictive-risk-engine' as ScreenType,
      label: 'Risk Forecast',
      icon: BrainCircuit,
      badge: 'AI',
    },
    {
      id: 'cap-incident-dispatch' as ScreenType,
      label: 'Alert Broadcast',
      icon: ShieldAlert,
      badge: undefined,
    },
    {
      id: 'iot-sensor-mesh' as ScreenType,
      label: 'Sensor Network',
      icon: Cpu,
      badge: '48 In-Situ',
    },
    {
      id: 'system-health' as ScreenType,
      label: 'System Status',
      icon: Radio,
      badge: undefined,
    },
  ];

  return (
    <aside className="fixed left-0 top-16 bottom-10 w-60 bg-[#070e1d]/95 backdrop-blur-md z-40 flex flex-col border-r border-[#3d494c]/30 shadow-sm">
      <div className="px-3 pt-4 pb-2">
        <div className="text-[11px] font-semibold text-[#869397] uppercase tracking-wider mb-2.5 px-2">
          Navigation
        </div>
        <nav className="flex flex-col gap-1">
          {navItems.map((item) => {
            const isActive = currentScreen === item.id;
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                id={`nav-${item.id}`}
                type="button"
                onClick={() => onNavigate(item.id)}
                className={`flex items-center justify-between px-3 py-2.5 rounded-lg transition-all text-left text-xs ${
                  isActive
                    ? 'bg-[#06b6d4] text-[#003640] font-bold shadow-sm'
                    : 'text-[#bcc9cd] hover:bg-[#141b2b] hover:text-white font-medium'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-[#003640]' : 'text-[#4cd7f6]'}`} />
                  <span className="truncate">{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-[9px] font-mono-data px-1.5 py-0.5 rounded font-bold ${
                      isActive
                        ? 'bg-[#003640] text-[#4cd7f6]'
                        : item.badge === 'DANGER'
                        ? 'bg-[#a40217] text-[#ffdad6]'
                        : 'bg-[#141b2b] text-[#869397] border border-[#3d494c]/40'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Simplified Threat Status Card in Footer */}
      <div className="mt-auto p-3.5 bg-[#141b2b]/90 border-t border-[#3d494c]/30 flex flex-col gap-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 text-[#ffb95f]" />
            <span className="text-[11px] text-[#869397] uppercase font-semibold">
              Threat Index
            </span>
          </div>
          <span className="font-mono-data text-xs text-[#ffb95f] font-bold">
            {sector.threatIndex}
          </span>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-[#2e3545] h-1.5 rounded-full overflow-hidden">
          <div
            className="bg-[#ffb95f] h-full transition-all duration-500 rounded-full"
            style={{ width: `${Math.min(100, Math.round((1.8 - sector.fos) * 110))}%` }}
          />
        </div>

        {onOpenReportModal && (
          <button
            type="button"
            onClick={onOpenReportModal}
            className="w-full mt-1 py-1.5 px-2 bg-[#141b2b] hover:bg-[#191f2f] text-[#4cd7f6] rounded-lg border border-[#4cd7f6]/40 flex items-center justify-center gap-1.5 text-xs font-medium transition-all shadow-sm"
            title="Download Sector Risk Assessment Report (PDF)"
          >
            <FileDown className="w-3.5 h-3.5" />
            <span>Download PDF SitRep</span>
          </button>
        )}
      </div>
    </aside>
  );
};
