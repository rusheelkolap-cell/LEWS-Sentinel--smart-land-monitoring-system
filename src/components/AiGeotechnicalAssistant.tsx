import React, { useState, useRef, useEffect } from 'react';
import { SectorConfig, LiveLocationState, AiChatMessage, AiGeotechnicalAssessment } from '../types';
import { 
  BrainCircuit, 
  Send, 
  Sparkles, 
  ShieldAlert, 
  X, 
  Maximize2, 
  Minimize2, 
  Activity, 
  MapPin, 
  CheckCircle2, 
  AlertTriangle,
  RotateCcw,
  FileDown
} from 'lucide-react';

interface AiGeotechnicalAssistantProps {
  sector: SectorConfig;
  location: LiveLocationState;
  isOpen: boolean;
  onClose: () => void;
  onOpenCapModal?: () => void;
  onOpenReportModal?: () => void;
}

export const AiGeotechnicalAssistant: React.FC<AiGeotechnicalAssistantProps> = ({
  sector,
  location,
  isOpen,
  onClose,
  onOpenCapModal,
  onOpenReportModal,
}) => {
  const [messages, setMessages] = useState<AiChatMessage[]>([
    {
      id: 'welcome-1',
      sender: 'assistant',
      text: `Hello Controller. I am the LEWS Sentinel AI Geotechnical Specialist powered by Gemini. I continuously correlate in-situ tilt velocity (${sector.tiltVelocity}°/min), pore water pressure (${sector.porePressure} kPa), and Sentinel-1 InSAR subsidence for ${sector.name}. How can I assist with geotechnical analysis or emergency SOP dispatch?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      poweredBy: 'gemini-3.8-flash',
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [deepAssessment, setDeepAssessment] = useState<AiGeotechnicalAssessment | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement | null>(null);

  // Auto scroll chat to bottom
  useEffect(() => {
    if (isOpen) {
      chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  // Request comprehensive geotechnical assessment from Gemini backend
  const handleRunDeepDiagnostic = async () => {
    setIsAnalyzing(true);
    try {
      const res = await fetch('/api/ai/geotechnical-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sector,
          userLocation: location.lat
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
        setDeepAssessment(data.data);
        // Also push a summary message to chat
        setMessages((prev) => [
          ...prev,
          {
            id: `diag-${Date.now()}`,
            sender: 'assistant',
            text: `📊 **Geotechnical Deep Diagnostic Completed:**\n\n• **Failure Mechanism:** ${data.data.failureMechanism}\n• **Probability:** ${Math.round(data.data.failureProbability * 100)}% (${data.data.threatLevel})\n• **Runway:** ${data.data.estimatedTimeWindow}\n• **Evacuation:** ${data.data.evacuationAdvice}`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            poweredBy: data.poweredBy || 'gemini-3.8-flash',
          },
        ]);
      }
    } catch (err) {
      console.error('Diagnostic failed:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputText.trim();
    if (!text || isLoading) return;

    const userMsg: AiChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          sector,
          userLocation: location.lat
            ? {
                lat: location.lat,
                lng: location.lng,
                distanceKm: location.distanceToActiveHazardKm,
                insideGeofence: location.insideGeofence,
              }
            : null,
        }),
      });
      const data = await res.json();

      setMessages((prev) => [
        ...prev,
        {
          id: `ai-${Date.now()}`,
          sender: 'assistant',
          text: data.reply || 'Analysis received.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          poweredBy: data.poweredBy || 'gemini-3.8-flash',
        },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: `ai-err-${Date.now()}`,
          sender: 'assistant',
          text: 'Temporary network anomaly in tactical AI channel. Local physics-informed model indicates continuous high hazard for NH-10 Sector 4.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          poweredBy: 'local-fallback',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const quickPrompts = [
    'Assess failure timeline for NH-10 Sector 4',
    location.enabled
      ? `Is my current GPS position (${location.distanceToActiveHazardKm?.toFixed(1) || '0'}km away) safe?`
      : 'What is the evacuation protocol for Teesta Bazaar?',
    'What would happen if rainfall intensifies to 60 mm/hr?',
    'Evaluate InSAR creep rate vs tilt velocity',
  ];

  if (!isOpen) return null;

  return (
    <div
      className={`fixed z-50 transition-all duration-300 shadow-[0_0_30px_rgba(0,0,0,0.85)] border border-[#4cd7f6]/40 bg-[#070e1d]/98 backdrop-blur-2xl flex flex-col ${
        isExpanded
          ? 'top-4 bottom-4 left-4 right-4 md:left-20 md:right-20 rounded-xl'
          : 'bottom-6 right-6 w-[94vw] sm:w-[460px] h-[640px] max-h-[88vh] rounded-lg'
      }`}
    >
      {/* HEADER */}
      <div className="p-3.5 bg-[#141b2b] border-b border-[#3d494c]/40 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded bg-[#06b6d4]/20 border border-[#4cd7f6]/50 flex items-center justify-center text-[#4cd7f6]">
            <BrainCircuit className="w-5 h-5 animate-pulse" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-headline text-sm font-bold text-[#dce2f7] uppercase tracking-wide">
                LEWS Sentinel AI Copilot
              </span>
              <span className="px-1.5 py-0.5 rounded bg-[#06b6d4] text-[#003640] text-[9px] font-mono-data font-bold">
                GEMINI 3.8
              </span>
            </div>
            <span className="text-[10px] font-mono-data text-[#869397]">
              Geotechnical In-Situ & Satellite Reasoning Engine
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {onOpenReportModal && (
            <button
              type="button"
              onClick={onOpenReportModal}
              className="p-1.5 rounded text-[#4cd7f6] hover:bg-[#232a3a] transition-colors"
              title="Export Geotechnical Risk Report (PDF)"
            >
              <FileDown className="w-4 h-4" />
            </button>
          )}
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 rounded text-[#bcc9cd] hover:text-[#dce2f7] hover:bg-[#232a3a] transition-colors"
            title={isExpanded ? 'Collapse' : 'Expand'}
          >
            {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded text-[#bcc9cd] hover:text-[#ffb4ab] hover:bg-[#232a3a] transition-colors"
            title="Close AI Copilot"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* TELEMETRY CONTEXT BAR */}
      <div className="px-3.5 py-2 bg-[#0c1322] border-b border-[#3d494c]/30 flex flex-wrap items-center justify-between gap-2 font-mono-data text-[10px] text-[#869397]">
        <div className="flex items-center gap-2">
          <span className="text-[#4cd7f6] font-bold">SECTOR:</span>
          <span className="text-[#dce2f7] font-semibold">{sector.corridor}</span>
          <span>|</span>
          <span>FoS: <strong className="text-[#ffb4ab]">{sector.fos}</strong></span>
          <span>|</span>
          <span>Tilt: <strong className="text-[#ffb4ab]">{sector.tiltVelocity}°/m</strong></span>
        </div>

        {location.enabled && location.lat !== null && (
          <div className="flex items-center gap-1.5">
            <MapPin className="w-3 h-3 text-[#4cd7f6]" />
            <span className={location.insideGeofence ? 'text-[#ffb4ab] font-bold' : 'text-[#4cd7f6]'}>
              GPS: {location.distanceToActiveHazardKm?.toFixed(2)} km to Rupture ({location.insideGeofence ? 'DANGER ZONE' : 'BUFFER'})
            </span>
          </div>
        )}
      </div>

      {/* QUICK ACTIONS ROW */}
      <div className="p-2.5 bg-[#141b2b]/60 border-b border-[#3d494c]/20 flex items-center justify-between gap-2 flex-shrink-0">
        <button
          type="button"
          onClick={handleRunDeepDiagnostic}
          disabled={isAnalyzing}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#06b6d4] hover:bg-[#06b6d4]/90 text-[#00424f] rounded text-xs font-mono-data font-bold uppercase transition-all shadow-sm active:scale-95"
        >
          <Sparkles className={`w-3.5 h-3.5 ${isAnalyzing ? 'animate-spin' : ''}`} />
          <span>{isAnalyzing ? 'Analyzing Physics Model...' : 'Run Deep AI Diagnostic'}</span>
        </button>

        {onOpenCapModal && (
          <button
            type="button"
            onClick={onOpenCapModal}
            className="flex items-center gap-1 px-2.5 py-1.5 bg-[#191f2f] hover:bg-[#232a3a] text-[#ffb4ab] rounded text-xs font-mono-data uppercase border border-[#a40217]/40"
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Generate CAP Alert</span>
          </button>
        )}
      </div>

      {/* MESSAGES VIEWPORT */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 font-body text-xs">
        {/* Deep Assessment Card if available */}
        {deepAssessment && (
          <div className="p-3.5 rounded bg-[#141b2b] border border-[#a40217]/60 shadow-lg font-mono-data text-xs flex flex-col gap-2 animate-in fade-in duration-300">
            <div className="flex items-center justify-between pb-1 border-b border-[#3d494c]/40">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-[#ffb4ab]" />
                <span className="font-headline text-xs font-bold text-[#ffdad6] uppercase">
                  AI Geotechnical Hazard Matrix
                </span>
              </div>
              <span className="px-1.5 py-0.5 rounded bg-[#a40217] text-[#ffdad6] text-[9px] font-bold">
                {deepAssessment.threatLevel} (P={deepAssessment.failureProbability})
              </span>
            </div>

            <p className="text-[#dce2f7] leading-relaxed font-body">
              {deepAssessment.summary}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-1 text-[11px]">
              <div className="p-2 rounded bg-[#070e1d] border border-[#3d494c]/30">
                <span className="text-[9px] text-[#869397] uppercase font-bold block mb-0.5">
                  Predicted Failure Mechanism
                </span>
                <span className="text-[#ffb95f] leading-snug">{deepAssessment.failureMechanism}</span>
              </div>
              <div className="p-2 rounded bg-[#070e1d] border border-[#3d494c]/30">
                <span className="text-[9px] text-[#869397] uppercase font-bold block mb-0.5">
                  Estimated Rupture Window
                </span>
                <span className="text-[#ffb4ab] font-bold text-sm block">{deepAssessment.estimatedTimeWindow}</span>
              </div>
            </div>

            <div className="p-2 rounded bg-[#070e1d] border border-[#3d494c]/30">
              <span className="text-[9px] text-[#869397] uppercase font-bold block mb-1">
                Field Evacuation Directive
              </span>
              <span className="text-[#dce2f7] leading-snug">{deepAssessment.evacuationAdvice}</span>
            </div>

            {deepAssessment.tacticalDirectives && deepAssessment.tacticalDirectives.length > 0 && (
              <div className="flex flex-col gap-1 mt-0.5">
                <span className="text-[9px] text-[#869397] uppercase font-bold">Tactical Action List:</span>
                <ul className="list-disc pl-4 space-y-0.5 text-[#bcc9cd] text-[11px]">
                  {deepAssessment.tacticalDirectives.map((d, idx) => (
                    <li key={idx}>{d}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Chat History */}
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';
          return (
            <div
              key={msg.id}
              className={`flex flex-col max-w-[88%] ${isUser ? 'ml-auto items-end' : 'mr-auto items-start'}`}
            >
              <div
                className={`p-3 rounded-lg leading-relaxed ${
                  isUser
                    ? 'bg-[#06b6d4] text-[#003640] font-medium shadow-md'
                    : 'bg-[#141b2b] text-[#dce2f7] border border-[#3d494c]/40 shadow-sm whitespace-pre-wrap'
                }`}
              >
                {msg.text}
              </div>
              <div className="flex items-center gap-1.5 mt-1 px-1 text-[9px] font-mono-data text-[#869397]">
                <span>{msg.timestamp}</span>
                {msg.poweredBy && (
                  <>
                    <span>•</span>
                    <span className="text-[#4cd7f6]">{msg.poweredBy}</span>
                  </>
                )}
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="mr-auto flex items-center gap-2 p-3 bg-[#141b2b] rounded-lg border border-[#3d494c]/40 text-[#4cd7f6] font-mono-data text-xs">
            <Sparkles className="w-3.5 h-3.5 animate-spin" />
            <span>Consulting Gemini Geotechnical Core...</span>
          </div>
        )}

        <div ref={chatBottomRef} />
      </div>

      {/* QUICK PROMPT CHIPS */}
      <div className="px-3 py-2 bg-[#0c1322] border-t border-[#3d494c]/30 flex items-center gap-1.5 overflow-x-auto no-scrollbar flex-shrink-0">
        <span className="text-[9px] font-mono-data text-[#869397] uppercase flex-shrink-0">Prompts:</span>
        {quickPrompts.map((prompt, i) => (
          <button
            key={i}
            type="button"
            onClick={() => handleSendMessage(prompt)}
            className="flex-shrink-0 px-2.5 py-1 rounded bg-[#141b2b] hover:bg-[#232a3a] text-[#4cd7f6] border border-[#3d494c]/40 text-[10px] font-mono-data truncate max-w-[240px] transition-colors"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* INPUT FORM */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
        className="p-3 bg-[#141b2b] border-t border-[#3d494c]/40 flex items-center gap-2 flex-shrink-0"
      >
        <input
          id="ai-copilot-input"
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Ask AI Geotechnical Specialist about slope, telemetry, or evacuation..."
          className="flex-1 bg-[#070e1d] text-[#dce2f7] placeholder-[#869397] px-3.5 py-2 rounded text-xs border border-[#3d494c]/50 focus:outline-none focus:border-[#4cd7f6]"
        />
        <button
          type="submit"
          disabled={!inputText.trim() || isLoading}
          className="px-3.5 py-2 bg-[#06b6d4] disabled:bg-[#232a3a] text-[#00424f] disabled:text-[#869397] rounded font-bold transition-colors flex items-center justify-center shadow-sm"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
