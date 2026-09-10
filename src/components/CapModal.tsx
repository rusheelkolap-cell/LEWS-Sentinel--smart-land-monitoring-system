import React, { useState } from 'react';
import { RAW_CAP_XML, CAP_VERNACULARS } from '../data/mockTacticalData';
import { Code, Check, Copy, X, Radio, ShieldCheck, AlertCircle, FileDown } from 'lucide-react';

interface CapModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmDispatch?: () => void;
  onExportPdf?: () => void;
}

export const CapModal: React.FC<CapModalProps> = ({ isOpen, onClose, onConfirmDispatch, onExportPdf }) => {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'xml' | 'json' | 'cert'>('xml');
  const [lang, setLang] = useState<'en' | 'ne' | 'bn' | 'hi'>('en');
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [broadcastDone, setBroadcastDone] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard?.writeText(RAW_CAP_XML);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExecuteBroadcast = () => {
    setIsBroadcasting(true);
    setTimeout(() => {
      setIsBroadcasting(false);
      setBroadcastDone(true);
      if (onConfirmDispatch) onConfirmDispatch();
      setTimeout(() => {
        setBroadcastDone(false);
        onClose();
      }, 1500);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#070e1d]/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#141b2b] max-w-3xl w-full rounded border border-[#3d494c]/50 shadow-[0_0_30px_rgba(0,0,0,0.8)] flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="p-4 bg-[#070e1d] flex items-center justify-between border-b border-[#3d494c]/30">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded bg-[#191f2f] flex items-center justify-center text-[#4cd7f6] border border-[#4cd7f6]/30">
              <Code className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-headline text-base text-[#dce2f7] font-bold">
                  CAP v1.2 OASIS Machine-Readable Schema
                </span>
                <span className="px-1.5 py-0.5 rounded bg-[#a40217] text-[#ffdad6] text-[10px] font-mono-data font-bold uppercase">
                  CRITICAL DISPATCH
                </span>
              </div>
              <span className="text-[10px] font-mono-data text-[#869397]">
                LEWS-ALERT-2025-07-21-0089 • X.509 Cryptographically Authenticated
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[#869397] hover:text-[#dce2f7] p-1.5 rounded bg-[#141b2b] hover:bg-[#232a3a] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection & Vernacular Bar */}
        <div className="px-4 py-2 bg-[#0c1322] border-b border-[#3d494c]/20 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-1 bg-[#141b2b] p-0.5 rounded">
            <button
              onClick={() => setActiveTab('xml')}
              className={`px-3 py-1 rounded text-[11px] font-mono-data font-bold transition-all ${
                activeTab === 'xml'
                  ? 'bg-[#4cd7f6] text-[#003640]'
                  : 'text-[#bcc9cd] hover:text-[#dce2f7]'
              }`}
            >
              Formatted XML
            </button>
            <button
              onClick={() => setActiveTab('json')}
              className={`px-3 py-1 rounded text-[11px] font-mono-data font-bold transition-all ${
                activeTab === 'json'
                  ? 'bg-[#4cd7f6] text-[#003640]'
                  : 'text-[#bcc9cd] hover:text-[#dce2f7]'
              }`}
            >
              Raw JSON
            </button>
            <button
              onClick={() => setActiveTab('cert')}
              className={`px-3 py-1 rounded text-[11px] font-mono-data font-bold transition-all ${
                activeTab === 'cert'
                  ? 'bg-[#4cd7f6] text-[#003640]'
                  : 'text-[#bcc9cd] hover:text-[#dce2f7]'
              }`}
            >
              X.509 Cert
            </button>
          </div>

          <div className="flex items-center gap-1">
            <span className="text-[10px] font-mono-data text-[#869397] mr-1 uppercase">Vernacular:</span>
            {(['en', 'ne', 'bn', 'hi'] as const).map((l) => (
              <button
                key={l}
                onClick={() => setLang(l)}
                className={`px-2 py-0.5 rounded text-[10px] font-mono-data uppercase font-bold transition-colors ${
                  lang === l
                    ? 'bg-[#e79400] text-[#2a1700]'
                    : 'bg-[#191f2f] text-[#bcc9cd] hover:bg-[#232a3a]'
                }`}
              >
                {l.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Translation Alert Preview Box */}
        <div className="px-4 py-2.5 bg-[#191f2f]/80 border-b border-[#3d494c]/20 flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-[#ffb95f] flex-shrink-0 mt-0.5" />
          <div className="flex flex-col">
            <span className="text-[10px] font-mono-data text-[#869397] uppercase">
              Target Channel Geofence Payload Broadcast Body:
            </span>
            <p className="text-xs text-[#dce2f7] mt-0.5 leading-relaxed font-body">
              {CAP_VERNACULARS[lang]}
            </p>
          </div>
        </div>

        {/* Code Content Body */}
        <div className="p-4 bg-[#070e1d]/90 overflow-y-auto max-h-[360px] font-mono-data text-xs leading-relaxed">
          {activeTab === 'xml' && (
            <pre className="text-[#acedff] whitespace-pre-wrap select-all">
              <code>{RAW_CAP_XML}</code>
            </pre>
          )}

          {activeTab === 'json' && (
            <pre className="text-[#4cd7f6] whitespace-pre-wrap select-all">
              <code>{JSON.stringify(
                {
                  identifier: "LEWS-ALERT-2025-07-21-0089",
                  sender: "sdma-lews-core@nic.in",
                  sent: "2025-07-21T14:37:10+05:30",
                  status: "Actual",
                  msgType: "Alert",
                  scope: "Public",
                  info: {
                    category: "Geo",
                    event: "Landslide / Slope Failure",
                    urgency: "Immediate",
                    severity: "Extreme",
                    certainty: "Observed",
                    headline: "CRITICAL RED ALERT: Active Slope Rupture NH-10 KM 42-45",
                    area: {
                      h3_index: "8860a24b61fffff",
                      centroid: [27.0588, 88.4712],
                      radius_km: 1.5,
                      corridor: "NH-10 Sector 4"
                    }
                  },
                  signature: "SHA256withRSA:4f9ba10842fe..."
                },
                null,
                2
              )}</code>
            </pre>
          )}

          {activeTab === 'cert' && (
            <pre className="text-[#ffb95f] whitespace-pre-wrap select-all">
              <code>{`-----BEGIN CERTIFICATE-----
MIIDtzCCAp+gAwIBAgIUW6wO678a5XyT2L1KxL93Ew0GCSqGSIb3DQEBCwUAMIGC
MQswCQYDVQQGEwJJTjEdMBsGA1UECgwUTkRNQSAtIFNERUEgR2VvdGVjaDEnMCUG
A1UECwwETEVXUyBUYWN0aWNhbCBDb21tYW5kIFN1Yi1DQSAwMjEmMCQGA1UEAwwd
TkRNQS1MRVdTLVNJR05JTkctQ0EtMjAyNS0wNzgXDTI1MDEwMTAwMDAwMFoXDTM1
MDEAxMTk1OTU5WjCBiDELMAkGA1UEBhMCSU4xEDAOBgNVBAgMB1Npa2tpbTETMBEG
-----END CERTIFICATE-----
Issuer: National Disaster Management Authority (C-DOT / NDMA CAP Root)
Algorithm: SHA256withRSA (4096-bit FIPS 140-2 Level 3 Validated)`}</code>
            </pre>
          )}
        </div>

        {/* Modal Action Footer */}
        <div className="p-3.5 bg-[#070e1d] flex items-center justify-between border-t border-[#3d494c]/30 flex-wrap gap-2">
          <div className="flex items-center gap-2 text-[#869397] text-[11px] font-mono-data">
            <ShieldCheck className="w-4 h-4 text-[#4cd7f6]" />
            <span>Validated against ITU-T X.1303 / OASIS CAP v1.2</span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {onExportPdf && (
              <button
                type="button"
                onClick={onExportPdf}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#141b2b] hover:bg-[#191f2f] text-[#4cd7f6] rounded text-xs font-mono-data font-semibold border border-[#4cd7f6]/40 transition-colors shadow-sm"
                title="Download Formatted PDF Alert Order"
              >
                <FileDown className="w-3.5 h-3.5" />
                <span>Download Alert PDF</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#191f2f] hover:bg-[#232a3a] text-[#dce2f7] rounded text-xs font-mono-data font-semibold border border-[#3d494c]/40 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-[#4cd7f6]" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'XML Copied!' : 'Copy Raw XML'}</span>
            </button>

            <button
              type="button"
              disabled={isBroadcasting}
              onClick={handleExecuteBroadcast}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded text-xs font-mono-data uppercase font-bold tracking-wider transition-all shadow-md ${
                broadcastDone
                  ? 'bg-[#10b981] text-[#070a0f]'
                  : 'bg-[#a40217] hover:bg-[#a40217]/90 text-[#ffdad6] shadow-[0_0_12px_rgba(164,2,23,0.5)]'
              }`}
            >
              <Radio className={`w-4 h-4 ${isBroadcasting ? 'animate-spin' : ''}`} />
              <span>
                {isBroadcasting
                  ? 'Disseminating...'
                  : broadcastDone
                  ? 'Dispatched to 6 Channels!'
                  : 'Execute Instant Broadcast'}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
