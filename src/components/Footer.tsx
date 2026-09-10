import React from 'react';
import { ShieldCheck, Wifi, Radio } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="fixed bottom-0 left-0 right-0 h-9 bg-[#070e1d]/95 backdrop-blur-xl border-t border-[#3d494c]/30 z-50 flex items-center justify-between px-4 text-xs font-mono-data">
      <div className="flex items-center gap-5 overflow-x-auto text-[11px]">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[#22c55e] animate-pulse" />
          <span className="text-[#869397]">Sensors:</span>
          <span className="text-white font-medium">48 Active</span>
        </div>

        <div className="hidden sm:flex items-center gap-1.5 text-[#869397]">
          <Radio className="w-3 h-3 text-[#4cd7f6]" />
          <span>Radar:</span>
          <span className="text-[#dce2f7]">Live (Gangtok Doppler)</span>
        </div>

        <div className="hidden md:flex items-center gap-1.5 text-[#869397]">
          <Wifi className="w-3 h-3 text-[#22c55e]" />
          <span>Sync:</span>
          <span className="text-[#86efac]">Sub-second</span>
        </div>
      </div>

      <div className="flex items-center gap-2 text-[11px] text-[#869397]">
        <ShieldCheck className="w-3.5 h-3.5 text-[#4cd7f6]" />
        <span className="hidden sm:inline">LEWS Network Secure</span>
      </div>
    </footer>
  );
};
