import React, { useState } from 'react';
import { ScreenType, SectorConfig } from '../types';
import { SLOPE_NODES } from '../data/mockTacticalData';
import { 
  ShieldAlert, 
  Cpu, 
  Radio, 
  Send, 
  Check, 
  AlertTriangle, 
  Satellite, 
  HardDrive, 
  Wifi, 
  BatteryCharging,
  Zap,
  FileDown
} from 'lucide-react';

interface TacticalConsolesProps {
  screen: ScreenType;
  sector: SectorConfig;
  onOpenCapModal: () => void;
  onTriggerSirens: () => void;
  sirenActive: boolean;
  onNavigateToScreen: (screen: ScreenType) => void;
  onOpenReportModal?: () => void;
}

export const TacticalConsoles: React.FC<TacticalConsolesProps> = ({
  screen,
  sector,
  onOpenCapModal,
  onTriggerSirens,
  sirenActive,
  onNavigateToScreen,
  onOpenReportModal,
}) => {
  const [dispatchStatus, setDispatchStatus] = useState<'idle' | 'sending' | 'sent'>('idle');
  const [pingTest, setPingTest] = useState<string | null>(null);

  const handleSimulateDispatch = () => {
    setDispatchStatus('sending');
    setTimeout(() => {
      setDispatchStatus('sent');
      setTimeout(() => setDispatchStatus('idle'), 3000);
    }, 1500);
  };

  const handleRunPingTest = () => {
    setPingTest('Testing ISRO NAVIC / GSAT-7A Ground Station Link...');
    setTimeout(() => {
      setPingTest('Ping: 18ms • Carrier Lock: GSAT-7A • Transponder 4 • Signal: 99.4% (EXCELLENT)');
    }, 1000);
  };

  if (screen === 'cap-incident-dispatch') {
    return (
      <div className="p-6 bg-[#0c1322] min-h-screen font-body flex flex-col gap-6 text-[#dce2f7]">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#3d494c]/30">
          <div>
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-6 h-6 text-[#ffb4ab]" />
              <h1 className="font-headline text-2xl font-bold">CAP v1.2 Incident Command & Broadcast Dispatch</h1>
            </div>
            <p className="text-xs font-mono-data text-[#869397] mt-1">
              Common Alerting Protocol (OASIS / ITU-T X.1303) Multi-Agency Dissemination Hub
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {onOpenReportModal && (
              <button
                type="button"
                onClick={onOpenReportModal}
                className="px-3.5 py-2 bg-[#141b2b] hover:bg-[#191f2f] text-[#4cd7f6] rounded text-xs font-mono-data font-bold border border-[#4cd7f6]/40 shadow-sm transition-all flex items-center gap-1.5"
                title="Export Formatted Incident Report PDF"
              >
                <FileDown className="w-3.5 h-3.5" />
                <span>Export SitRep (PDF)</span>
              </button>
            )}
            <button
              onClick={onOpenCapModal}
              className="px-4 py-2 bg-[#141b2b] hover:bg-[#191f2f] text-[#4cd7f6] rounded text-xs font-mono-data font-bold border border-[#4cd7f6]/40 shadow-sm transition-all"
            >
              View XML Schema Payload
            </button>
            <button
              onClick={handleSimulateDispatch}
              disabled={dispatchStatus === 'sending'}
              className="px-4 py-2 bg-[#a40217] hover:bg-[#a40217]/90 text-[#ffdad6] rounded text-xs font-mono-data font-bold uppercase tracking-wider transition-all shadow-[0_0_12px_rgba(164,2,23,0.5)] flex items-center gap-2"
            >
              <Send className={`w-4 h-4 ${dispatchStatus === 'sending' ? 'animate-spin' : ''}`} />
              <span>
                {dispatchStatus === 'sending'
                  ? 'Disseminating...'
                  : dispatchStatus === 'sent'
                  ? 'Dispatched to 6 Gateways!'
                  : 'Broadcast Geofence Alert'}
              </span>
            </button>
          </div>
        </div>

        {/* Channels Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-[#141b2b] p-4 rounded border border-[#3d494c]/40 font-mono-data text-xs flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-[#4cd7f6]">Cell Broadcast (CBC)</span>
              <span className="px-2 py-0.5 rounded bg-[#06b6d4] text-[#00424f] text-[10px] font-bold">READY</span>
            </div>
            <p className="text-[#869397] text-[11px] font-body">
              Targeting BTS Towers: Melli-01, Singtam-04, Rangpo-02. Reaches 100% of mobile handsets inside geofence polygon.
            </p>
            <div className="bg-[#070e1d] p-2 rounded text-[11px] flex justify-between">
              <span className="text-[#869397]">Estimated Reach:</span>
              <span className="text-[#4cd7f6] font-bold">14,820 Civilians</span>
            </div>
          </div>

          <div className="bg-[#141b2b] p-4 rounded border border-[#3d494c]/40 font-mono-data text-xs flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-[#ffb95f]">Solar Warning Sirens</span>
              <button
                onClick={onTriggerSirens}
                className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all ${
                  sirenActive ? 'bg-[#ffb4ab] text-[#690005] animate-pulse' : 'bg-[#191f2f] text-[#ffb95f]'
                }`}
              >
                {sirenActive ? 'ACTIVE (110dB)' : 'TRIGGER NOW'}
              </button>
            </div>
            <p className="text-[#869397] text-[11px] font-body">
              High-output piezoelectric warble sirens at KM 42.4, 43.1, and 44.8 along NH-10 with solar LiFePO4 battery banks.
            </p>
            <div className="bg-[#070e1d] p-2 rounded text-[11px] flex justify-between">
              <span className="text-[#869397]">Acoustic Coverage:</span>
              <span className="text-[#ffb95f] font-bold">2.4 km Radius</span>
            </div>
          </div>

          <div className="bg-[#141b2b] p-4 rounded border border-[#3d494c]/40 font-mono-data text-xs flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-[#dce2f7]">BRO Highway VMS Signs</span>
              <span className="px-2 py-0.5 rounded bg-[#10b981] text-[#070a0f] text-[10px] font-bold">OVERRIDDEN</span>
            </div>
            <p className="text-[#869397] text-[11px] font-body">
              Electronic Variable Message Signs at Rangpo Checkpost & Melli Crossing displaying diversion to Jorethang.
            </p>
            <div className="bg-[#070e1d] p-2 rounded text-[11px] flex justify-between">
              <span className="text-[#869397]">Active Display:</span>
              <span className="text-[#ffb4ab] font-bold">DIVERSION ENFORCED</span>
            </div>
          </div>
        </div>

        {/* Dispatched Incident Logs */}
        <div className="bg-[#141b2b] p-4 rounded border border-[#3d494c]/40 font-mono-data text-xs flex flex-col gap-3">
          <span className="font-headline text-sm font-bold text-[#dce2f7] uppercase tracking-wide">
            Immutable Audit Trail (X.509 Cryptographic Signatures)
          </span>
          <div className="divide-y divide-[#3d494c]/30">
            <div className="py-2.5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-[#869397]">14:37:10 IST</span>
                <span className="text-[#4cd7f6] font-bold">LEWS-ALERT-2025-07-21-0089</span>
                <span className="text-[#dce2f7]">Broadcast initiated by System Core (P=0.89 threshold breach)</span>
              </div>
              <span className="text-[#10b981] font-bold">DELIVERED</span>
            </div>
            <div className="py-2.5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-[#869397]">14:37:12 IST</span>
                <span className="text-[#4cd7f6] font-bold">BRO-DISPATCH-991</span>
                <span className="text-[#dce2f7]">Unit 14 Heavy Excavator alerted at Rangpo staging point</span>
              </div>
              <span className="text-[#10b981] font-bold">EN ROUTE</span>
            </div>
            <div className="py-2.5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-[#869397]">14:37:15 IST</span>
                <span className="text-[#4cd7f6] font-bold">DEOC-IVRS-CALLOUT</span>
                <span className="text-[#dce2f7]">District Disaster Officer Kalimpong acknowledged callout</span>
              </div>
              <span className="text-[#10b981] font-bold">ACKNOWLEDGED</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (screen === 'iot-sensor-mesh') {
    return (
      <div className="p-6 bg-[#0c1322] min-h-screen font-body flex flex-col gap-6 text-[#dce2f7]">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#3d494c]/30">
          <div>
            <div className="flex items-center gap-2">
              <Cpu className="w-6 h-6 text-[#4cd7f6]" />
              <h1 className="font-headline text-2xl font-bold">IoT Sensor Mesh & Inclinometer Telemetry</h1>
            </div>
            <p className="text-xs font-mono-data text-[#869397] mt-1">
              48 In-Situ MEMS Inclinometers, Vibrating Wire Piezometers, and Soil Moisture Probes
            </p>
          </div>
          <button
            onClick={() => onNavigateToScreen('3d-gis-command-center')}
            className="px-3 py-1.5 bg-[#141b2b] hover:bg-[#191f2f] text-[#4cd7f6] rounded text-xs font-mono-data font-bold border border-[#4cd7f6]/40"
          >
            Back to 3D GIS Console
          </button>
        </div>

        {/* Nodes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 font-mono-data text-xs">
          {SLOPE_NODES.map((node) => (
            <div
              key={node.id}
              className="bg-[#141b2b] p-3.5 rounded border border-[#3d494c]/40 flex flex-col gap-2 relative overflow-hidden"
            >
              <div
                className={`absolute left-0 top-0 bottom-0 w-1 ${
                  node.status === 'BURST' ? 'bg-[#ffb4ab]' : node.status === 'WATCH' ? 'bg-[#ffb95f]' : 'bg-[#4cd7f6]'
                }`}
              />
              <div className="flex items-center justify-between pl-1">
                <span className="font-bold text-sm text-[#dce2f7]">{node.id}</span>
                <span
                  className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                    node.status === 'BURST'
                      ? 'bg-[#a40217] text-[#ffdad6] animate-pulse'
                      : node.status === 'WATCH'
                      ? 'bg-[#ffb95f] text-[#2a1700]'
                      : 'bg-[#191f2f] text-[#4cd7f6]'
                  }`}
                >
                  {node.status}
                </span>
              </div>
              <div className="text-[11px] text-[#869397] pl-1">
                Location: <strong className="text-[#dce2f7]">{node.km}</strong> ({node.depth})
              </div>
              <div className="bg-[#070e1d] p-2 rounded flex flex-col gap-1 border border-[#3d494c]/20 text-[11px]">
                <div className="flex justify-between">
                  <span className="text-[#869397]">Tilt Rate:</span>
                  <span className="text-[#ffb4ab] font-bold">{node.tiltRate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#869397]">Battery:</span>
                  <span className="text-[#4cd7f6]">{node.battery}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#869397]">LoRa RSSI:</span>
                  <span className="text-[#dce2f7]">{node.rssi}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // System Health
  return (
    <div className="p-6 bg-[#0c1322] min-h-screen font-body flex flex-col gap-6 text-[#dce2f7]">
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#3d494c]/30">
        <div>
          <div className="flex items-center gap-2">
            <Radio className="w-6 h-6 text-[#4cd7f6]" />
            <h1 className="font-headline text-2xl font-bold">System Health & LoRaWAN Gateway Network</h1>
          </div>
          <p className="text-xs font-mono-data text-[#869397] mt-1">
            Redundant Multi-Hop Telemetry Mesh, Satellite Backhauls & Edge Power Auditing
          </p>
        </div>

        <button
          onClick={handleRunPingTest}
          className="px-4 py-2 bg-[#06b6d4] hover:bg-[#06b6d4]/90 text-[#00424f] font-mono-data font-bold rounded text-xs uppercase tracking-wider transition-all"
        >
          Test ISRO Uplink Ping
        </button>
      </div>

      {pingTest && (
        <div className="p-3 bg-[#141b2b] rounded border border-[#4cd7f6]/50 font-mono-data text-xs text-[#4cd7f6] flex items-center gap-2">
          <Satellite className="w-4 h-4 animate-spin" />
          <span>{pingTest}</span>
        </div>
      )}

      {/* Gateway Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono-data text-xs">
        <div className="bg-[#141b2b] p-4 rounded border border-[#3d494c]/40 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="font-bold text-sm text-[#4cd7f6]">GW-NE-NH10-04 (Sector 4)</span>
            <span className="text-[#10b981] font-bold">ACTIVE</span>
          </div>
          <div className="bg-[#070e1d] p-2.5 rounded flex flex-col gap-1.5 border border-[#3d494c]/20 text-[11px]">
            <div className="flex justify-between">
              <span className="text-[#869397]">Firmware:</span>
              <span className="text-[#dce2f7]">v3.4.12-LWS</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#869397]">Solar Power:</span>
              <span className="text-[#10b981] font-bold">14.2W (Battery 98%)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#869397]">Packet Delivery Ratio:</span>
              <span className="text-[#4cd7f6] font-bold">99.82%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#869397]">Primary Backhaul:</span>
              <span className="text-[#dce2f7]">4G/LTE (Airtel Band 3)</span>
            </div>
          </div>
        </div>

        <div className="bg-[#141b2b] p-4 rounded border border-[#3d494c]/40 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="font-bold text-sm text-[#4cd7f6]">GW-NE-NH10-03 (Sector 3)</span>
            <span className="text-[#10b981] font-bold">ACTIVE</span>
          </div>
          <div className="bg-[#070e1d] p-2.5 rounded flex flex-col gap-1.5 border border-[#3d494c]/20 text-[11px]">
            <div className="flex justify-between">
              <span className="text-[#869397]">Firmware:</span>
              <span className="text-[#dce2f7]">v3.4.12-LWS</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#869397]">Solar Power:</span>
              <span className="text-[#10b981] font-bold">12.8W (Battery 94%)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#869397]">Packet Delivery Ratio:</span>
              <span className="text-[#4cd7f6] font-bold">99.91%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#869397]">Primary Backhaul:</span>
              <span className="text-[#dce2f7]">Fiber Optic (BRO Leased)</span>
            </div>
          </div>
        </div>

        <div className="bg-[#141b2b] p-4 rounded border border-[#3d494c]/40 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="font-bold text-sm text-[#ffb95f]">ISRO SatCom Transceiver</span>
            <span className="text-[#ffb95f] font-bold">HOT STANDBY</span>
          </div>
          <div className="bg-[#070e1d] p-2.5 rounded flex flex-col gap-1.5 border border-[#3d494c]/20 text-[11px]">
            <div className="flex justify-between">
              <span className="text-[#869397]">Satellite:</span>
              <span className="text-[#dce2f7]">GSAT-7A / NavIC</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#869397]">Modem:</span>
              <span className="text-[#dce2f7]">Iridium SBD 9603</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#869397]">Heartbeat Interval:</span>
              <span className="text-[#4cd7f6] font-bold">60 seconds</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#869397]">Failover Latency:</span>
              <span className="text-[#4cd7f6] font-bold">&lt; 3.2 seconds</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
