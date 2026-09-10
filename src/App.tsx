import React, { useState, useRef, useEffect } from 'react';
import { ScreenType, SectorConfig, SectorId } from './types';
import { SECTORS } from './data/mockTacticalData';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { Footer } from './components/Footer';
import { GisCommandCenter } from './components/GisCommandCenter';
import { PredictiveRiskEngine } from './components/PredictiveRiskEngine';
import { TacticalConsoles } from './components/TacticalConsoles';
import { CapModal } from './components/CapModal';
import { LiveLocationConsole } from './components/LiveLocationConsole';
import { AiGeotechnicalAssistant } from './components/AiGeotechnicalAssistant';
import { ReportExportModal } from './components/ReportExportModal';
import { useLiveLocation } from './hooks/useLiveLocation';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<ScreenType>('3d-gis-command-center');
  const [currentSectorId, setCurrentSectorId] = useState<string>('kalimpong');
  const [isCapModalOpen, setIsCapModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [sirenActive, setSirenActive] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isAiCopilotOpen, setIsAiCopilotOpen] = useState(false);

  // AudioContext reference for tactical siren warble
  const audioCtxRef = useRef<AudioContext | null>(null);
  const oscRef = useRef<OscillatorNode | null>(null);
  const gainRef = useRef<GainNode | null>(null);

  const currentSector: SectorConfig =
    SECTORS.find((s) => s.id === currentSectorId) || SECTORS[0];

  // Geolocation Sentinel hook with active sector coordinate calculation
  const { location, startWatching, stopWatching, setSimulatedLocation, presets } =
    useLiveLocation(currentSector);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3800);
  };

  // Toggle tactical warning siren
  const handleToggleSiren = () => {
    if (!sirenActive) {
      setSirenActive(true);
      showToast('⚠️ SOLAR SIRENS ACTIVATED: 110dB Warble Triggered for NH-10 Sector 4');
      
      // Start subtle audio warble if audio context is allowed
      try {
        const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (AudioContextClass) {
          const ctx = new AudioContextClass();
          audioCtxRef.current = ctx;
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(650, ctx.currentTime);
          
          // Modulate frequency for warble effect
          const now = ctx.currentTime;
          osc.frequency.linearRampToValueAtTime(850, now + 0.4);
          osc.frequency.linearRampToValueAtTime(650, now + 0.8);
          osc.frequency.linearRampToValueAtTime(850, now + 1.2);
          osc.frequency.linearRampToValueAtTime(650, now + 1.6);
          
          gain.gain.setValueAtTime(0.08, ctx.currentTime);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start();
          oscRef.current = osc;
          gainRef.current = gain;

          // Auto stop sound after 4 seconds to be gentle
          setTimeout(() => {
            try {
              gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.5);
              setTimeout(() => osc.stop(), 500);
            } catch {
              // ignore
            }
          }, 3500);
        }
      } catch {
        // AudioContext may be restricted by autoplay policy
      }
    } else {
      setSirenActive(false);
      showToast('Solar Sirens Silenced • Returned to Autonomous Watch Mode');
      if (oscRef.current) {
        try {
          oscRef.current.stop();
        } catch {
          // ignore
        }
      }
    }
  };

  // Clean up audio on unmount
  useEffect(() => {
    return () => {
      if (audioCtxRef.current) {
        try {
          audioCtxRef.current.close();
        } catch {
          // ignore
        }
      }
    };
  }, []);

  const handleOpenCapModal = () => {
    setIsCapModalOpen(true);
  };

  const handleCloseCapModal = () => {
    setIsCapModalOpen(false);
  };

  const handleConfirmCapDispatch = () => {
    showToast('🚨 CAP v1.2 DISPATCH BROADCASTED: 6 Emergency Channels Synchronized');
  };

  const handleTriggerCapForCell = (cellId: string) => {
    setIsCapModalOpen(true);
    showToast(`Initiated CAP Broadcast payload for cell ${cellId}`);
  };

  const handleNavigateToRiskEngine = () => {
    setCurrentScreen('ai-predictive-risk-engine');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigateTo3D = (cellId?: string) => {
    setCurrentScreen('3d-gis-command-center');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (cellId) {
      showToast(`Focused 3D viewport on H3 Hex Cell: ${cellId}`);
    }
  };

  const handleToggleLocation = () => {
    if (location.enabled) {
      stopWatching();
      showToast('Live Location Sentinel disabled.');
    } else {
      startWatching();
      showToast('Live Location Sentinel enabled. Geofencing active.');
    }
  };

  return (
    <div className="dark min-h-screen bg-[#0c1322] text-[#dce2f7] flex flex-col antialiased selection:bg-[#4cd7f6] selection:text-[#003640]">
      {/* GLOBAL HEADER */}
      <Header
        currentSector={currentSectorId as SectorId}
        onSelectSector={(s) => setCurrentSectorId(s)}
        onOpenCapModal={handleOpenCapModal}
        sirenActive={sirenActive}
        onToggleSiren={handleToggleSiren}
        location={location}
        onToggleLocation={handleToggleLocation}
        onNavigateToLocationConsole={() => setCurrentScreen('live-location-sentinel')}
        isAiCopilotOpen={isAiCopilotOpen}
        onToggleAiCopilot={() => setIsAiCopilotOpen(!isAiCopilotOpen)}
        onOpenReportModal={() => setIsReportModalOpen(true)}
      />

      {/* BODY WITH FIXED SIDEBAR AND MAIN CONTENT */}
      <div className="flex flex-1 pt-16 pb-10">
        {/* SIDEBAR NAVIGATION */}
        <Sidebar
          currentScreen={currentScreen}
          onNavigate={setCurrentScreen}
          sector={currentSector}
          location={location}
          onOpenReportModal={() => setIsReportModalOpen(true)}
        />

        {/* MAIN DISPLAY VIEWPORT (Offset by 60 for sidebar) */}
        <div className="flex-1 ml-0 md:ml-60 flex flex-col min-w-0">
          {currentScreen === '3d-gis-command-center' && (
            <GisCommandCenter
              sector={currentSector}
              onNavigateToRiskEngine={handleNavigateToRiskEngine}
              onOpenCapModal={handleOpenCapModal}
              onTriggerSirens={handleToggleSiren}
              sirenActive={sirenActive}
              location={location}
              onToggleAiCopilot={() => setIsAiCopilotOpen(true)}
              onNavigateToLiveLocation={() => setCurrentScreen('live-location-sentinel')}
              onOpenReportModal={() => setIsReportModalOpen(true)}
            />
          )}

          {currentScreen === 'ai-predictive-risk-engine' && (
            <PredictiveRiskEngine
              sector={currentSector}
              onTriggerCapForCell={handleTriggerCapForCell}
              onNavigateTo3D={handleNavigateTo3D}
              location={location}
              onToggleAiCopilot={() => setIsAiCopilotOpen(true)}
              onOpenReportModal={() => setIsReportModalOpen(true)}
            />
          )}

          {currentScreen === 'live-location-sentinel' && (
            <LiveLocationConsole
              sector={currentSector}
              location={location}
              onStartTracking={startWatching}
              onStopTracking={stopWatching}
              onSelectPreset={setSimulatedLocation}
              presets={presets}
              onOpenCapModal={handleOpenCapModal}
              onNavigateToMap={() => setCurrentScreen('3d-gis-command-center')}
            />
          )}

          {(currentScreen === 'cap-incident-dispatch' ||
            currentScreen === 'iot-sensor-mesh' ||
            currentScreen === 'system-health') && (
            <TacticalConsoles
              screen={currentScreen}
              sector={currentSector}
              onOpenCapModal={handleOpenCapModal}
              onTriggerSirens={handleToggleSiren}
              sirenActive={sirenActive}
              onNavigateToScreen={setCurrentScreen}
              onOpenReportModal={() => setIsReportModalOpen(true)}
            />
          )}
        </div>
      </div>

      {/* AI GEOTECHNICAL COPILOT (DRAWER/MODAL) */}
      <AiGeotechnicalAssistant
        sector={currentSector}
        location={location}
        isOpen={isAiCopilotOpen}
        onClose={() => setIsAiCopilotOpen(false)}
        onOpenCapModal={handleOpenCapModal}
        onOpenReportModal={() => setIsReportModalOpen(true)}
      />

      {/* FOOTER SYSTEM STATUS BAR */}
      <Footer />

      {/* CAP v1.2 OASIS MACHINE-READABLE SCHEMA MODAL */}
      <CapModal
        isOpen={isCapModalOpen}
        onClose={handleCloseCapModal}
        onConfirmDispatch={handleConfirmCapDispatch}
        onExportPdf={() => setIsReportModalOpen(true)}
      />

      {/* SECTOR RISK ASSESSMENT REPORT PDF EXPORT MODAL */}
      <ReportExportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        sector={currentSector}
        location={location}
        sirenActive={sirenActive}
        onNotify={showToast}
      />

      {/* TACTICAL TOAST NOTIFICATION */}
      {toastMessage && (
        <div className="fixed bottom-14 right-6 z-50 max-w-md bg-[#141b2b] border border-[#ffb4ab]/60 p-3.5 rounded shadow-[0_0_20px_rgba(0,0,0,0.8)] flex items-center gap-3 font-mono-data text-xs animate-in slide-in-from-bottom-5 duration-300">
          <div className="w-2.5 h-2.5 rounded-full bg-[#ffb4ab] animate-ping flex-shrink-0" />
          <span className="text-[#dce2f7] font-semibold leading-snug">{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
