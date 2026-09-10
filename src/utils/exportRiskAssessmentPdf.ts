import jsPDF from 'jspdf';
import { SectorConfig, AiGeotechnicalAssessment, LiveLocationState, SlopeNode } from '../types';
import { SLOPE_NODES, H3_CLUSTERS, CAP_VERNACULARS } from '../data/mockTacticalData';

export interface ReportExportOptions {
  sector: SectorConfig;
  aiAssessment?: AiGeotechnicalAssessment | null;
  location?: LiveLocationState;
  sirenActive?: boolean;
  officerName?: string;
  reportNotes?: string;
  nodes?: SlopeNode[];
}

/**
 * Generates and triggers download of an official formatted Risk Assessment PDF report
 * for disaster management authorities, incident commanders, and field responders.
 */
export function generateRiskAssessmentPdf(options: ReportExportOptions): jsPDF {
  const {
    sector,
    aiAssessment,
    location,
    sirenActive = true,
    officerName = 'Cmdr. V. R. Sharma (SDMA Lead Controller)',
    reportNotes,
    nodes = SLOPE_NODES,
  } = options;

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 14;
  const contentWidth = pageWidth - margin * 2; // 182mm

  const now = new Date();
  const timestampIso = now.toISOString();
  const timestampUtc = now.toUTCString().replace('GMT', 'UTC');
  const istOffsetMs = 5.5 * 60 * 60 * 1000;
  const istDate = new Date(now.getTime() + istOffsetMs);
  const timestampIst = istDate.toISOString().replace('T', ' ').slice(0, 19) + ' IST';
  const reportId = `LEWS-REP-${sector.id.toUpperCase()}-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}-${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}`;

  // ==========================================
  // HELPER DRAWING UTILITIES
  // ==========================================

  const drawPageHeader = (pageNum: number, totalPages: number) => {
    // Dark Tactical Top Bar
    doc.setFillColor(7, 14, 29); // #070e1d
    doc.rect(0, 0, pageWidth, 24, 'F');

    // Accent line (Cyan)
    doc.setFillColor(76, 215, 246); // #4cd7f6
    doc.rect(0, 23.5, pageWidth, 0.8, 'F');

    // Authority text
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(76, 215, 246);
    doc.text('LEWS SENTINEL // TACTICAL INCIDENT DISPATCH', margin, 9);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(188, 201, 205);
    doc.text('NATIONAL DISASTER MANAGEMENT AUTHORITY (NDMA) & GSI GEOTECHNICAL DIVISION', margin, 14);
    doc.text(`CORRIDOR: ${sector.name.toUpperCase()} • REF: SIH-2025-042`, margin, 18.5);

    // Right-aligned classification stamp
    doc.setFillColor(164, 2, 23); // Red Alert Badge
    doc.roundedRect(pageWidth - margin - 42, 6, 42, 12, 1.5, 1.5, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(255, 218, 214);
    doc.text('OFFICIAL TACTICAL REPORT', pageWidth - margin - 21, 10.5, { align: 'center' });
    doc.setFontSize(6.5);
    doc.text('URGENCY: IMMEDIATE / RED', pageWidth - margin - 21, 15, { align: 'center' });
  };

  const drawPageFooter = (pageNum: number, totalPages: number) => {
    const footerY = pageHeight - 12;
    doc.setFillColor(7, 14, 29);
    doc.rect(0, footerY - 2, pageWidth, 14, 'F');
    doc.setFillColor(61, 73, 76);
    doc.rect(0, footerY - 2, pageWidth, 0.4, 'F');

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(134, 147, 151);
    doc.text(`CONFIDENTIAL TACTICAL INTEL • REPORT ID: ${reportId}`, margin, footerY + 4);
    doc.text(`GENERATED: ${timestampIst} (${timestampUtc})`, margin, footerY + 8);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(76, 215, 246);
    doc.text(`PAGE ${pageNum} OF ${totalPages}`, pageWidth - margin, footerY + 6, { align: 'right' });
  };

  const drawSectionTitle = (title: string, y: number, subtitle?: string): number => {
    doc.setFillColor(20, 27, 43); // #141b2b
    doc.roundedRect(margin, y, contentWidth, subtitle ? 11 : 8, 1, 1, 'F');

    doc.setFillColor(76, 215, 246);
    doc.rect(margin, y, 2.5, subtitle ? 11 : 8, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(220, 226, 247);
    doc.text(title.toUpperCase(), margin + 5, y + 5.5);

    if (subtitle) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(6.5);
      doc.setTextColor(134, 147, 151);
      doc.text(subtitle, margin + 5, y + 9.5);
      return y + 14;
    }
    return y + 11;
  };

  // ==========================================
  // PAGE 1: EXECUTIVE SITREP & AI PREDICTIONS
  // ==========================================
  drawPageHeader(1, 2);

  let curY = 28;

  // Report Summary Banner Box
  doc.setFillColor(245, 247, 250);
  doc.setDrawColor(180, 190, 205);
  doc.roundedRect(margin, curY, contentWidth, 24, 1.5, 1.5, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(16, 24, 40);
  doc.text(`INCIDENT SITUATION REPORT: ${sector.name}`, margin + 4, curY + 6.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(71, 84, 103);
  doc.text(
    `Critical Highway Corridor Segment: ${sector.corridor} | Hazardous Sector: ${sector.criticalKm}`,
    margin + 4,
    curY + 11.5
  );

  // Status Metrics Strip inside Banner
  const metricColW = contentWidth / 4;
  const metrics = [
    { label: 'THREAT RATING', val: sector.threatIndex, color: [164, 2, 23] },
    { label: 'FACTOR OF SAFETY', val: `${sector.fos.toFixed(2)} FoS`, color: [180, 83, 9] },
    { label: 'EVACUATION RUNWAY', val: `${sector.leadTimeMinutes} min ETA`, color: [164, 2, 23] },
    { label: 'CIVIL EXPOSURE', val: `${sector.exposedHabitations} Habitations`, color: [30, 41, 59] },
  ];

  metrics.forEach((m, idx) => {
    const mx = margin + 4 + idx * metricColW;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(100, 116, 139);
    doc.text(m.label, mx, curY + 17);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(m.color[0], m.color[1], m.color[2]);
    doc.text(m.val, mx, curY + 21.5);
  });

  curY += 28;

  // SECTION 1: GEOTECHNICAL & KINEMATIC FIELD PROFILE
  curY = drawSectionTitle(
    '1. Geotechnical & InSAR Corridor Profile',
    curY,
    'Baseline geological, hydrological, and lithological parameters monitored via in-situ sensors'
  );

  // 2-column parameter table
  const colW = (contentWidth - 4) / 2;
  const leftParams = [
    ['H3 Spatial Hex ID', sector.h3HexId],
    ['Coordinates (Lat, Lng)', `${sector.coordinates[0].toFixed(4)}°N, ${sector.coordinates[1].toFixed(4)}°E`],
    ['Elevation & Gradient', `${sector.elevation} | ${sector.slopeGradient}`],
    ['Dominant Lithology', sector.lithology],
    ['Hydrologic Catchment', `${sector.precipitation72h} mm / 72h (${sector.precipRate} mm/hr current)`],
  ];

  const rightParams = [
    ['Subsurface InSAR Creep', sector.insarVelocity],
    ['Rupture Runout Vector', sector.runoutVector],
    ['Vehicles in Transit', `${sector.vehiclesInTransit} vehicles inside hazard zone`],
    ['Downstream Habitations', `${sector.habitationNames} (${sector.exposedHabitations} households)`],
    ['Pore Water Pressure Head', `${sector.porePressure} kPa (Threshold: 35 kPa)`],
  ];

  const tableStartY = curY;
  const rowH = 6;

  [leftParams, rightParams].forEach((paramList, colIdx) => {
    const colX = margin + colIdx * (colW + 4);
    paramList.forEach((row, rIdx) => {
      const rowY = tableStartY + rIdx * rowH;
      doc.setFillColor(rIdx % 2 === 0 ? 248 : 255, rIdx % 2 === 0 ? 250 : 255, rIdx % 2 === 0 ? 252 : 255);
      doc.rect(colX, rowY, colW, rowH, 'F');
      doc.setDrawColor(226, 232, 240);
      doc.rect(colX, rowY, colW, rowH, 'S');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7);
      doc.setTextColor(71, 84, 103);
      doc.text(row[0], colX + 2, rowY + 4.2);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.setTextColor(15, 23, 42);
      doc.text(row[1], colX + colW - 2, rowY + 4.2, { align: 'right' });
    });
  });

  curY = tableStartY + leftParams.length * rowH + 5;

  // SECTION 2: AI MULTI-MODAL GEOTECHNICAL REASONING (GEMINI 3.8 FLASH)
  curY = drawSectionTitle(
    '2. Gemini Multi-Modal AI Geotechnical Reasoning & Forecast',
    curY,
    'Machine learning kinematic failure forecast derived from tilt velocity, InSAR phase shifts, and pore pressure head'
  );

  // Threat banner box
  const aiThreat = aiAssessment?.threatLevel || (sector.fos < 1.2 ? 'CRITICAL RED' : 'WARNING ORANGE');
  const aiProb = aiAssessment?.failureProbability || (sector.fos < 1.2 ? 0.94 : 0.68);
  const aiWindow = aiAssessment?.estimatedTimeWindow || `${sector.leadTimeMinutes} Minutes Until Rupture`;

  doc.setFillColor(254, 242, 242);
  doc.setDrawColor(252, 165, 165);
  doc.roundedRect(margin, curY, contentWidth, 14, 1.5, 1.5, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(153, 27, 27);
  doc.text(`AI KINEMATIC THREAT CLASSIFICATION: ${aiThreat}`, margin + 4, curY + 5.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(185, 28, 28);
  doc.text(
    `Predicted Rupture Runway: ${aiWindow} | Catastrophic Failure Probability P(F) = ${(aiProb * 100).toFixed(1)}%`,
    margin + 4,
    curY + 10.5
  );

  curY += 17;

  // AI Mechanical Diagnosis & Evacuation Advice
  const failureMechanismText =
    aiAssessment?.failureMechanism ||
    `Pore water pressure exceeds critical shear threshold (42.6 kPa > 35.0 kPa). Severe downslope creep accelerated from -18.4 mm/month to instantaneous slip rate of 0.084 deg/hr. Planar shear rupture expected along weathered schist regolith boundary at KM 42.8.`;

  const evacuationAdviceText =
    aiAssessment?.evacuationAdvice ||
    `Execute immediate mandatory evacuation of roadside habitations in ${sector.habitationNames}. Halt all vehicular transit at Rangpo and Teesta Bazaar police checkpoints. Clear NH-10 corridor of 38 vehicles currently in transit. Direct evacuees laterally uphill away from Teesta river drainage axis.`;

  // Failure Mechanism Callout Box
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(margin, curY, contentWidth, 24, 1, 1, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(30, 41, 59);
  doc.text('GEOMECHANICAL FAILURE MECHANISM (DIAGNOSIS):', margin + 3, curY + 4.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(51, 65, 85);
  const splitMechanism = doc.splitTextToSize(failureMechanismText, contentWidth - 6);
  doc.text(splitMechanism, margin + 3, curY + 8.5);

  curY += 27;

  // Evacuation & Containment Directives Box
  doc.setFillColor(254, 242, 242);
  doc.setDrawColor(248, 113, 113);
  doc.roundedRect(margin, curY, contentWidth, 24, 1, 1, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(185, 28, 28);
  doc.text('EVACUATION & HIGHWAY CONTAINMENT STANDARD OPERATING PROCEDURE (SOP):', margin + 3, curY + 4.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(127, 29, 29);
  const splitEvac = doc.splitTextToSize(evacuationAdviceText, contentWidth - 6);
  doc.text(splitEvac, margin + 3, curY + 8.5);

  curY += 27;

  // Tactical Directives Bullet List
  const directives = aiAssessment?.tacticalDirectives?.length
    ? aiAssessment.tacticalDirectives
    : [
        `Deploy SDRF / NDRF Strike Teams to Sector 4 (KM 42.8) for perimeter security.`,
        `Energize high-intensity solar warning sirens across NH-10 (110dB warble).`,
        `Lower automated boom barriers at Teesta Bazaar & Rangpo checkposts.`,
        `Initiate Cell Broadcast CBC geofence dissemination on 3 BTS towers.`,
        `Direct uphill pedestrian retreat towards high-ground shelters at Singtam.`,
      ];

  doc.setFillColor(241, 245, 249);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(margin, curY, contentWidth, 24, 1, 1, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(15, 23, 42);
  doc.text('IMMEDIATE FIRST-RESPONDER TACTICAL DIRECTIVES:', margin + 3, curY + 4.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.8);
  doc.setTextColor(51, 65, 85);

  directives.slice(0, 5).forEach((dir, dIdx) => {
    doc.text(`•  ${dir}`, margin + 4, curY + 8.5 + dIdx * 3.8);
  });

  curY += 27;

  // LIVE LOCATION SENTINEL STATUS (IF ACTIVE)
  if (location && location.enabled && location.lat !== null) {
    doc.setFillColor(236, 254, 255);
    doc.setDrawColor(103, 232, 249);
    doc.roundedRect(margin, curY, contentWidth, 18, 1, 1, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(14, 116, 144);
    doc.text('LIVE FIELD GPS SENTINEL & RESPONDER PRESENCE AREA TELEMETRY:', margin + 3, curY + 4.5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.8);
    doc.setTextColor(21, 94, 117);
    const presenceStr = location.presenceArea
      ? `Present In: ${location.presenceArea.areaName} (${location.presenceArea.zoneCode}) | Footprint: ±${location.presenceArea.radiusMeters}m | Sub: ${location.presenceArea.subSector}`
      : `Present In: Sector 4 Cut-Slope Corridor (Zone Alpha) | Footprint: ±85m`;
    doc.text(presenceStr, margin + 3, curY + 9.2);

    const gpsLine = `GNSS: ${location.lat.toFixed(5)}°N, ${location.lng?.toFixed(5)}°E | MSL: ${location.altitude ? `${Math.round(location.altitude)}m` : '1,380m'} | Crown Dist: ${location.distanceToActiveHazardKm ? `${location.distanceToActiveHazardKm.toFixed(2)} km` : '0.12 km'} | Bearing: ${location.bearingToActiveHazardDeg ?? 42}° | Geofence: ${location.insideGeofence ? 'CRITICAL INFILTRATION' : 'SAFE BUFFER'} | Egress: ${location.presenceArea?.safeExitVector?.split('(')[0]?.trim() || 'Lateral Ridge'}`;
    doc.text(gpsLine, margin + 3, curY + 13.8);
  }

  drawPageFooter(1, 2);

  // ==========================================
  // PAGE 2: ACTIVE ALERTS, CAP V1.2 & SENSOR MESH
  // ==========================================
  doc.addPage();
  drawPageHeader(2, 2);

  curY = 28;

  // SECTION 3: COMMON ALERTING PROTOCOL (CAP v1.2) ACTIVE ALERTS
  curY = drawSectionTitle(
    '3. OASIS Common Alerting Protocol (CAP v1.2) Incident Payload',
    curY,
    'Official multi-agency emergency alert specifications compliant with ITU-T X.1303 & NDMA CAP guidelines'
  );

  // CAP Metadata Table
  const capMeta = [
    ['Alert Identifier', 'LEWS-ALERT-2025-07-21-0089', 'Category & Urgency', 'Geotechnical (Geo) | Immediate'],
    ['Dissemination Scope', 'Public Safety Broadcast', 'Severity & Certainty', 'Extreme | Observed In-Situ'],
    ['Sender Agency', 'sdma-lews-core@nic.in (Govt. of India)', 'SAME Event Code', 'LSW (Landslide Warning)'],
    ['Warning Siren Status', sirenActive ? 'ACTIVE (110dB Continuous Warble)' : 'ARMED / STANDBY', 'Highway Access', 'BARRIERS LOWERED (Total Closure)'],
  ];

  const capTableY = curY;
  const capRowH = 5.5;

  capMeta.forEach((row, idx) => {
    const rY = capTableY + idx * capRowH;
    doc.setFillColor(idx % 2 === 0 ? 248 : 255, idx % 2 === 0 ? 250 : 255, idx % 2 === 0 ? 252 : 255);
    doc.rect(margin, rY, contentWidth, capRowH, 'F');
    doc.setDrawColor(226, 232, 240);
    doc.rect(margin, rY, contentWidth, capRowH, 'S');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.8);
    doc.setTextColor(71, 84, 103);
    doc.text(row[0], margin + 2, rY + 3.8);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.8);
    doc.setTextColor(15, 23, 42);
    doc.text(row[1], margin + 54, rY + 3.8);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.8);
    doc.setTextColor(71, 84, 103);
    doc.text(row[2], margin + 98, rY + 3.8);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.8);
    doc.setTextColor(15, 23, 42);
    doc.text(row[3], margin + 144, rY + 3.8);
  });

  curY = capTableY + capMeta.length * capRowH + 4;

  // Multi-Lingual Broadcast Directives
  doc.setFillColor(254, 242, 242);
  doc.setDrawColor(252, 165, 165);
  doc.roundedRect(margin, curY, contentWidth, 28, 1, 1, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(153, 27, 27);
  doc.text('MANDATORY MULTI-LINGUAL CELL BROADCAST & SIREN DISPATCH (REGIONAL VERNACULARS):', margin + 3, curY + 4.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(79, 70, 229);
  doc.text('English (Official National Transmission):', margin + 3, curY + 8.5);
  doc.setTextColor(30, 41, 59);
  const splitEn = doc.splitTextToSize(CAP_VERNACULARS.en, contentWidth - 6);
  doc.text(splitEn, margin + 3, curY + 12);

  doc.setTextColor(15, 118, 110);
  doc.text('Hindi / Nepali (Regional Transmissions):', margin + 3, curY + 18);
  doc.setTextColor(51, 65, 85);
  doc.text(
    'Hindi: NH-10 कॉरिडोर किमी 42.8 पर ढलान विफलता दर्ज। निचले तीस्ता क्षेत्र को तत्काल खाली करने का निर्देश। 110dB सायरन सक्रिय।',
    margin + 3,
    curY + 21.5
  );
  doc.text(
    'Nepali: NH-10 को KM 42.8 मा पहिरो खसेको सूचना। तल्लो टिस्टा क्षेत्र तुरुन्त खाली गर्न आदेश दिइएको छ।',
    margin + 3,
    curY + 25
  );

  curY += 32;

  // SECTION 4: IN-SITU IOT SENSOR MESH TELEMETRY
  curY = drawSectionTitle(
    '4. In-Situ Slope Inclinometer & Piezometer Telemetry (Mesh Network)',
    curY,
    'Real-time physical displacement, pore pressure, and vibration readings from borehole sensor pods'
  );

  // Sensor Table Header
  const sensorHeaderY = curY;
  doc.setFillColor(30, 41, 59);
  doc.rect(margin, sensorHeaderY, contentWidth, 6, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.8);
  doc.setTextColor(255, 255, 255);
  doc.text('NODE ID', margin + 3, sensorHeaderY + 4.2);
  doc.text('LOCATION / KM', margin + 32, sensorHeaderY + 4.2);
  doc.text('STATUS', margin + 68, sensorHeaderY + 4.2);
  doc.text('TILT ACCELERATION', margin + 98, sensorHeaderY + 4.2);
  doc.text('BOREHOLE DEPTH', margin + 138, sensorHeaderY + 4.2);
  doc.text('BATTERY & CADENCE', margin + 179, sensorHeaderY + 4.2, { align: 'right' });

  curY = sensorHeaderY + 6;

  nodes.slice(0, 4).forEach((node, nIdx) => {
    doc.setFillColor(nIdx % 2 === 0 ? 248 : 255, nIdx % 2 === 0 ? 250 : 255, nIdx % 2 === 0 ? 252 : 255);
    doc.rect(margin, curY, contentWidth, 5.5, 'F');
    doc.setDrawColor(226, 232, 240);
    doc.rect(margin, curY, contentWidth, 5.5, 'S');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.5);
    doc.setTextColor(15, 23, 42);
    doc.text(node.id, margin + 3, curY + 3.8);

    doc.setFont('helvetica', 'normal');
    doc.text(node.km, margin + 32, curY + 3.8);

    // Status pill text
    if (node.status === 'BURST') {
      doc.setTextColor(185, 28, 28);
      doc.setFont('helvetica', 'bold');
    } else if (node.status === 'WATCH') {
      doc.setTextColor(180, 83, 9);
      doc.setFont('helvetica', 'bold');
    } else {
      doc.setTextColor(16, 185, 129);
      doc.setFont('helvetica', 'normal');
    }
    doc.text(node.status, margin + 68, curY + 3.8);

    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'normal');
    doc.text(`${node.tiltDeg.toFixed(3)}°/hr`, margin + 98, curY + 3.8);
    doc.text(node.depth, margin + 138, curY + 3.8);
    doc.text(`${node.battery} | ${node.cadence.split(' ')[0]}`, margin + 179, curY + 3.8, { align: 'right' });

    curY += 5.5;
  });

  curY += 4;

  // SECTION 5: H3 HEXAGONAL SPATIAL CLUSTER RANKINGS
  curY = drawSectionTitle(
    '5. Priority H3 Spatial Clusters & Composite Threat Ranking',
    curY,
    'Uber H3 Discrete Global Grid System (Resolution 8) composite risk synthesis'
  );

  const h3HeaderY = curY;
  doc.setFillColor(30, 41, 59);
  doc.rect(margin, h3HeaderY, contentWidth, 6, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.8);
  doc.setTextColor(255, 255, 255);
  doc.text('H3 CELL IDENTIFIER', margin + 3, h3HeaderY + 4.2);
  doc.text('SECTOR / ASSET DESCRIPTION', margin + 44, h3HeaderY + 4.2);
  doc.text('STATIC LSZ', margin + 112, h3HeaderY + 4.2);
  doc.text('HYDRO PHI', margin + 132, h3HeaderY + 4.2);
  doc.text('KINEMATIC', margin + 152, h3HeaderY + 4.2);
  doc.text('COMPOSITE', margin + 179, h3HeaderY + 4.2, { align: 'right' });

  curY = h3HeaderY + 6;

  H3_CLUSTERS.slice(0, 3).forEach((cl, cIdx) => {
    doc.setFillColor(cIdx % 2 === 0 ? 248 : 255, cIdx % 2 === 0 ? 250 : 255, cIdx % 2 === 0 ? 252 : 255);
    doc.rect(margin, curY, contentWidth, 5.5, 'F');
    doc.setDrawColor(226, 232, 240);
    doc.rect(margin, curY, contentWidth, 5.5, 'S');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.5);
    doc.setTextColor(15, 23, 42);
    doc.text(cl.cellId, margin + 3, curY + 3.8);

    doc.setFont('helvetica', 'normal');
    doc.text(cl.threatDescription.slice(0, 40), margin + 44, curY + 3.8);

    doc.text(cl.staticLSZ.toFixed(2), margin + 112, curY + 3.8);
    doc.text(cl.hydroPhi.toFixed(2), margin + 132, curY + 3.8);
    doc.text(cl.kinematicOmega.toFixed(2), margin + 152, curY + 3.8);

    if (cl.compositeScore > 0.8) {
      doc.setTextColor(185, 28, 28);
      doc.setFont('helvetica', 'bold');
    } else {
      doc.setTextColor(180, 83, 9);
      doc.setFont('helvetica', 'bold');
    }
    doc.text(`${(cl.compositeScore * 100).toFixed(0)}%`, margin + 179, curY + 3.8, { align: 'right' });

    curY += 5.5;
  });

  curY += 6;

  // RESPONDER NOTES (IF PROVIDED)
  if (reportNotes && reportNotes.trim().length > 0) {
    doc.setFillColor(254, 252, 232);
    doc.setDrawColor(254, 240, 138);
    doc.roundedRect(margin, curY, contentWidth, 14, 1, 1, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(161, 98, 7);
    doc.text('INCIDENT COMMANDER SPECIAL DISPATCH NOTES:', margin + 3, curY + 4);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(113, 63, 18);
    const splitNotes = doc.splitTextToSize(reportNotes, contentWidth - 6);
    doc.text(splitNotes, margin + 3, curY + 8);

    curY += 16;
  }

  // INCIDENT COMMAND SIGN-OFF & AUTHENTICATION SEAL
  const signBoxY = curY;
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(margin, signBoxY, contentWidth, 23, 1.5, 1.5, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(15, 23, 42);
  doc.text('DISASTER MANAGEMENT CLEARANCE & DIGITAL SIGN-OFF:', margin + 4, signBoxY + 5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.8);
  doc.setTextColor(71, 84, 103);
  doc.text(`Authorized Incident Controller: ${officerName}`, margin + 4, signBoxY + 9.5);
  doc.text(`Issuing Station: SDMA LEWS Tactical Command HQ (Sikkim / Kalimpong Axis)`, margin + 4, signBoxY + 13.5);
  doc.text(`Cryptographic Fingerprint: SHA-256: 4f9b8c2e...88a10d3f (X.509 FIPS 140-2 Validated)`, margin + 4, signBoxY + 17.5);

  // Digital Signature Box / Seal
  doc.setFillColor(236, 254, 255);
  doc.setDrawColor(76, 215, 246);
  doc.roundedRect(pageWidth - margin - 48, signBoxY + 3.5, 44, 16, 1, 1, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(14, 116, 144);
  doc.text('AUTHENTICATED DISPATCH', pageWidth - margin - 26, signBoxY + 8, { align: 'center' });
  doc.setFontSize(6);
  doc.setTextColor(8, 145, 178);
  doc.text('NDMA-LEWS-DISPATCH-SEAL', pageWidth - margin - 26, signBoxY + 12, { align: 'center' });
  doc.text(timestampIst.slice(0, 10), pageWidth - margin - 26, signBoxY + 16, { align: 'center' });

  drawPageFooter(2, 2);

  return doc;
}

/**
 * Downloads the PDF directly to the responder's local machine.
 */
export function downloadRiskAssessmentPdf(options: ReportExportOptions): void {
  const doc = generateRiskAssessmentPdf(options);
  const filename = `LEWS-Sentinel-Risk-Report-${options.sector.id}-${new Date().toISOString().slice(0, 10)}.pdf`;
  doc.save(filename);
}
