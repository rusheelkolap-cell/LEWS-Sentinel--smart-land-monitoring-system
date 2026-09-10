export type ScreenType = 
  | '3d-gis-command-center' 
  | 'ai-predictive-risk-engine' 
  | 'cap-incident-dispatch' 
  | 'iot-sensor-mesh' 
  | 'system-health'
  | 'live-location-sentinel';

export type SectorId = 'kalimpong' | 'ghats' | 'uttarakhand';

export interface PresenceAreaInfo {
  areaName: string;
  zoneCode: string;
  subSector: string;
  elevationMeters: number;
  terrainType: string;
  hazardClassification: 'RED_RUNOUT_ZONE' | 'AMBER_BUFFER_ZONE' | 'GREEN_SAFE_HAVEN';
  riskLevel: string;
  immediateAction: string;
  safeExitVector: string;
  radiusMeters: number;
  landmarkNear: string;
}

export interface LiveLocationState {
  enabled: boolean;
  status: 'idle' | 'locating' | 'tracking' | 'error' | 'permission-denied';
  lat: number | null;
  lng: number | null;
  accuracy: number | null;
  altitude: number | null;
  speed: number | null;
  heading: number | null;
  timestamp: number | null;
  error: string | null;
  isSimulated: boolean;
  simulationName?: string;
  distanceToActiveHazardKm: number | null;
  bearingToActiveHazardDeg: number | null;
  insideGeofence: boolean;
  proximityStatus: 'CRITICAL_ZONE' | 'WARNING_BUFFER' | 'SAFE_PERIMETER';
  presenceArea?: PresenceAreaInfo;
}

export interface AiGeotechnicalAssessment {
  summary: string;
  failureProbability: number;
  threatLevel: 'CRITICAL RED' | 'WARNING ORANGE' | 'ADVISORY YELLOW';
  estimatedTimeWindow: string;
  failureMechanism: string;
  evacuationAdvice: string;
  tacticalDirectives: string[];
  fieldLocationAlert?: string;
}

export interface AiFieldLocationBriefing {
  safetyStatus: 'IMMEDIATE EVACUATION' | 'HEIGHTENED ALERT' | 'SAFE STANDBY';
  hazardProximitySummary: string;
  actionableSteps: string[];
  escapeVector: string;
  nearestShelterEstimate: string;
}

export interface AiChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  poweredBy?: string;
}

export interface SectorConfig {
  id: SectorId;
  name: string;
  corridor: string;
  threatIndex: string;
  fos: number;
  criticalKm: string;
  leadTimeMinutes: number;
  h3HexId: string;
  coordinates: [number, number]; // lat, lng
  elevation: string;
  slopeGradient: string;
  lithology: string;
  insarVelocity: string;
  runoutVector: string;
  vehiclesInTransit: number;
  exposedHabitations: number;
  habitationNames: string;
  precipitation72h: number;
  precipRate: number;
  porePressure: number;
  tiltVelocity: number;
  vibrationG: number;
}

export interface SlopeNode {
  id: string;
  name: string;
  km: string;
  status: 'BURST' | 'WATCH' | 'NORMAL';
  statusColor: 'error' | 'tertiary' | 'primary';
  cadence: string;
  depth: string;
  battery: string;
  tiltDeg: number;
  tiltRate?: string;
  rssi?: string;
}

export interface H3ClusterRow {
  cellId: string;
  sectorName: string;
  threatDescription: string;
  staticLSZ: number;
  hydroPhi: number;
  kinematicOmega: number;
  compositeScore: number;
  threatStatus: 'CRITICAL RED' | 'WARNING ORG' | 'WATCH YEL' | 'NOMINAL GRN';
  statusType: 'error' | 'tertiary' | 'primary' | 'normal';
}

export interface BroadcastChannelStats {
  targetImsis: number;
  delivered: number;
  degraded: number;
  ackPercentage: number;
  officialsRoster: number;
  officialsAcked: number;
  sirensActive: boolean;
  barriersDown: boolean;
  vehiclesCleared: number;
  vehiclesTotal: number;
}
