import { SectorConfig, SlopeNode, H3ClusterRow } from '../types';

export const SECTOR_CONFIGS: Record<string, SectorConfig> = {
  kalimpong: {
    id: 'kalimpong',
    name: 'NH-10 Kalimpong-Sikkim Corridor',
    corridor: 'Sector 4, KM 42.1 to 45.3',
    threatIndex: 'ELEVATED (FoS 1.18)',
    fos: 1.18,
    criticalKm: 'KM 42.8 to 43.4',
    leadTimeMinutes: 14,
    h3HexId: '8860a24b61fffff',
    coordinates: [27.0588, 88.4712],
    elevation: '1,420 m MSL',
    slopeGradient: '44.2° (Over-steepened)',
    lithology: 'Schist/Gneiss Weathered Regolith',
    insarVelocity: '-18.4 mm/mo (Downslope Creep)',
    runoutVector: 'Teesta River Axis (~340m)',
    vehiclesInTransit: 38,
    exposedHabitations: 420,
    habitationNames: 'Singtam & Teesta Bazaar',
    precipitation72h: 142.8,
    precipRate: 48.0,
    porePressure: 42.6,
    tiltVelocity: 0.084,
    vibrationG: 0.062,
  },
  ghats: {
    id: 'ghats',
    name: 'Western Ghats SH-72 Mahabaleshwar',
    corridor: 'Ambenali Ghat KM 18.4 to 22.0',
    threatIndex: 'WATCH (FoS 1.34)',
    fos: 1.34,
    criticalKm: 'KM 19.6 to 20.2',
    leadTimeMinutes: 48,
    h3HexId: '8860a24b63fffff',
    coordinates: [17.9237, 73.6586],
    elevation: '1,280 m MSL',
    slopeGradient: '38.6° (Basalt Flow Scarp)',
    lithology: 'Deccan Trap Compact Basalt / Laterite',
    insarVelocity: '-6.2 mm/mo (Seasonal Creep)',
    runoutVector: 'Savitri River Gorge (~520m)',
    vehiclesInTransit: 22,
    exposedHabitations: 180,
    habitationNames: 'Poladpur & Pratapgad Base',
    precipitation72h: 96.4,
    precipRate: 24.5,
    porePressure: 28.2,
    tiltVelocity: 0.032,
    vibrationG: 0.028,
  },
  uttarakhand: {
    id: 'uttarakhand',
    name: 'Uttarakhand NH-58 Joshimath Axis',
    corridor: 'Alaknanda Gorge KM 82.0 to 86.4',
    threatIndex: 'ELEVATED (FoS 1.22)',
    fos: 1.22,
    criticalKm: 'KM 84.1 to 85.0',
    leadTimeMinutes: 28,
    h3HexId: '8860a24b67fffff',
    coordinates: [30.5564, 79.5667],
    elevation: '1,890 m MSL',
    slopeGradient: '41.8° (Glacial Drift)',
    lithology: 'High-Grade Gneissic Moraine Soil',
    insarVelocity: '-12.8 mm/mo (Subsurface Subsidence)',
    runoutVector: 'Alaknanda Riverbed (~410m)',
    vehiclesInTransit: 45,
    exposedHabitations: 650,
    habitationNames: 'Marwari & Sunil Ward',
    precipitation72h: 118.2,
    precipRate: 36.0,
    porePressure: 37.4,
    tiltVelocity: 0.061,
    vibrationG: 0.048,
  },
};

export const SECTORS: SectorConfig[] = Object.values(SECTOR_CONFIGS);

export const SLOPE_NODES: SlopeNode[] = [
  {
    id: 'SN-SLOPE-089',
    name: 'SN-SLOPE-089',
    km: 'KM 43.4',
    status: 'BURST',
    statusColor: 'error',
    cadence: 'BURST (30s cadence)',
    depth: '8.4m Depth',
    battery: '3.62V (98%)',
    tiltDeg: 0.084,
  },
  {
    id: 'SN-SLOPE-088',
    name: 'SN-SLOPE-088',
    km: 'KM 42.8',
    status: 'WATCH',
    statusColor: 'tertiary',
    cadence: 'NORMAL (5m)',
    depth: '7.2m Depth',
    battery: '3.58V (95%)',
    tiltDeg: 0.042,
  },
  {
    id: 'SN-SLOPE-090',
    name: 'SN-SLOPE-090',
    km: 'KM 44.1',
    status: 'NORMAL',
    statusColor: 'primary',
    cadence: 'STANDBY (15m)',
    depth: '9.0m Depth',
    battery: '3.65V (100%)',
    tiltDeg: 0.015,
  },
  {
    id: 'SN-SLOPE-091',
    name: 'SN-SLOPE-091',
    km: 'KM 45.0',
    status: 'NORMAL',
    statusColor: 'primary',
    cadence: 'STANDBY (15m)',
    depth: '6.8m Depth',
    battery: '3.60V (96%)',
    tiltDeg: 0.009,
  },
];

export const H3_CLUSTERS: H3ClusterRow[] = [
  {
    cellId: '8860a24b61fffff',
    sectorName: 'Sector 4 — KM 42.8 Kalimpong-Sikkim',
    threatDescription: 'National Highway NH-10 Severance Threat',
    staticLSZ: 0.78,
    hydroPhi: 0.94,
    kinematicOmega: 0.91,
    compositeScore: 0.89,
    threatStatus: 'CRITICAL RED',
    statusType: 'error',
  },
  {
    cellId: '8860a24b63fffff',
    sectorName: 'Sector 4 — KM 44.1 Cut-Slope S-04A',
    threatDescription: 'Retaining Wall Stress Anomaly',
    staticLSZ: 0.72,
    hydroPhi: 0.76,
    kinematicOmega: 0.71,
    compositeScore: 0.74,
    threatStatus: 'WARNING ORG',
    statusType: 'tertiary',
  },
  {
    cellId: '8860a24b67fffff',
    sectorName: 'Sector 5 — Singtam Habitation Perimeter',
    threatDescription: 'Basal Shear Riverbed Siltation',
    staticLSZ: 0.64,
    hydroPhi: 0.72,
    kinematicOmega: 0.65,
    compositeScore: 0.68,
    threatStatus: 'WARNING ORG',
    statusType: 'tertiary',
  },
  {
    cellId: '8860a24b60fffff',
    sectorName: 'Sector 3 — KM 39.5 Teesta Valley Bridgehead',
    threatDescription: 'Culvert Saturation Infiltration',
    staticLSZ: 0.42,
    hydroPhi: 0.49,
    kinematicOmega: 0.38,
    compositeScore: 0.44,
    threatStatus: 'WATCH YEL',
    statusType: 'primary',
  },
];

export const CAP_VERNACULARS = {
  en: "CRITICAL RED ALERT: Active slope rupture detected at KM 42.8 NH-10. Immediate evacuation of lower Teesta catchment ordered. High-intensity sirens active. Traffic halted at Rangpo & Teesta Bazaar checkposts.",
  ne: "अत्यन्त गम्भीर रातो चेतावनी: NH-10 को KM 42.8 मा सक्रिय पहिरो खसेको सूचना। तल्लो टिस्टा जलाधार क्षेत्र तुरुन्त खाली गर्न आदेश दिइएको छ। आपतकालीन साइरन सक्रिय गरिएको छ। रङ्पो र टिस्टा बजारमा आवागमन पूर्ण बन्द।",
  bn: "জরুরি লাল সতর্কতা: NH-10 করিডোরের ৪২.৮ কিলোমিটারে সক্রিয় ভূমিধসের আশঙ্কা। তিস্তা অববাহিকার নিচু এলাকা অবিলম্বে খালি করার নির্দেশ। সতর্কীকরণ সাইরেন চালু। রংপো এবং তিস্তা বাজার চেকপোস্টে যান চলাচল সম্পূর্ণ বন্ধ।",
  hi: "अति गंभीर लाल चेतावनी: NH-10 कॉरिडोर किमी 42.8 पर ढलान विफलता दर्ज। निचले तीस्ता जलक्षेत्र को तत्काल खाली करने का निर्देश। 110dB चेतावनी सायरन सक्रिय। रंगपो और तीस्ता बाजार चेकपोस्ट पर यातायात रोका गया।"
};

export const RAW_CAP_XML = `<?xml version="1.0" encoding="UTF-8"?>
<alert xmlns="urn:oasis:names:tc:emergency:cap:1.2">
  <identifier>LEWS-ALERT-2025-07-21-0089</identifier>
  <sender>sdma-lews-core@nic.in</sender>
  <sent>2025-07-21T14:37:10+05:30</sent>
  <status>Actual</status>
  <msgType>Alert</msgType>
  <scope>Public</scope>
  <info>
    <category>Geo</category>
    <event>Imminent Landslide Hazard Warning</event>
    <urgency>Immediate</urgency>
    <severity>Extreme</severity>
    <certainty>Observed</certainty>
    <eventCode><valueName>SAME</valueName><value>LSW</value></eventCode>
    <headline>CRITICAL RED ALERT: Active Slope Failure along NH-10 Corridor KM 42-45</headline>
    <description>In-situ slope inclinometers and pore pressure sensors indicate active subsurface shear failure. Rapid debris flow predicted within 15 minutes due to continuous extreme precipitation (48 mm/hr).</description>
    <instruction>Halt all vehicular traffic immediately. Evacuate roadside settlements towards designated upland shelter zones.</instruction>
    <area>
      <areaDesc>National Highway 10, Sector 4, Kalimpong-Sikkim Corridor (H3 Cell 8860a24b61fffff)</areaDesc>
      <circle>27.0588,88.4712,1.5</circle>
    </area>
  </info>
</alert>`;
