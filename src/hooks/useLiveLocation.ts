import { useState, useEffect, useRef, useCallback } from 'react';
import { LiveLocationState, SectorConfig, PresenceAreaInfo } from '../types';

// Haversine formula to compute great-circle distance in kilometers
export function calculateDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Number((R * c).toFixed(2));
}

// Bearing in degrees (0 - 360) from point 1 to point 2
export function calculateBearingDeg(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const y = Math.sin(((lon2 - lon1) * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180);
  const x =
    Math.cos((lat1 * Math.PI) / 180) * Math.sin((lat2 * Math.PI) / 180) -
    Math.sin((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.cos(((lon2 - lon1) * Math.PI) / 180);
  const b = (Math.atan2(y, x) * 180) / Math.PI;
  return Math.round((b + 360) % 360);
}

// Synthesize localized area and presence zone metadata where the user is located
export function determinePresenceArea(
  lat: number,
  lng: number,
  accuracy: number | null,
  altitude: number | null,
  currentSector: SectorConfig,
  distanceKm: number
): PresenceAreaInfo {
  const radius = Math.max(accuracy || 15, 65);

  if (currentSector.id === 'ghats') {
    if (distanceKm <= 2.5) {
      return {
        areaName: 'Fitzgerald Ghat KM 18 Horseshoe Hairpin Bend',
        zoneCode: 'ZONE-ALPHA (Basalt Cleavage Slip Chute)',
        subSector: 'Mahabaleshwar-Poladpur Escarpment',
        elevationMeters: altitude || 620,
        terrainType: 'Vesicular Basalt & Saturated Laterite Regolith',
        hazardClassification: 'RED_RUNOUT_ZONE',
        riskLevel: 'CRITICAL THREAT (Active Debris Scour)',
        immediateAction: 'Clear roadway immediately. Move uphill away from outer precipice toward Pratapgad slope.',
        safeExitVector: 'Ascend SH-72 toward Pratapgad Ridge (Azimuth 035°)',
        radiusMeters: radius,
        landmarkNear: 'Hairpin Bend #7 Retaining Wall & Sensor Array #4',
      };
    } else if (distanceKm <= 6.0) {
      return {
        areaName: 'Ambenali Ghat Road Junction & Forest Checkpost',
        zoneCode: 'ZONE-BRAVO (Mid-Slope Buffer)',
        subSector: 'Koyna Catchment Buffer',
        elevationMeters: altitude || 940,
        terrainType: 'Stratified Basaltic Lava Flows',
        hazardClassification: 'AMBER_BUFFER_ZONE',
        riskLevel: 'ELEVATED ADVISORY (Catchment Runoff)',
        immediateAction: 'Halt non-essential transit. Monitor drainage culverts and road cracks.',
        safeExitVector: 'Proceed eastward toward Mahabaleshwar Plateau (Azimuth 090°)',
        radiusMeters: Math.max(accuracy || 25, 120),
        landmarkNear: 'Forest Dept Checkpost & Fuel Station',
      };
    } else {
      return {
        areaName: 'Mahabaleshwar Municipal Helipad & Relief Base',
        zoneCode: 'ZONE-CHARLIE (Plateau Safe Haven)',
        subSector: 'High Altitude Laterite Plateau',
        elevationMeters: altitude || 1350,
        terrainType: 'Laterite Hardpan Bedrock',
        hazardClassification: 'GREEN_SAFE_HAVEN',
        riskLevel: 'SAFE PERIMETER (Upland Staging)',
        immediateAction: 'Maintain incident command and communications. Oversee relief logistics.',
        safeExitVector: 'Plateau Egress Highway & Helipad Pad-01',
        radiusMeters: Math.max(accuracy || 30, 200),
        landmarkNear: 'PWD Rest House & Sports Ground Helipad',
      };
    }
  }

  if (currentSector.id === 'uttarakhand') {
    if (distanceKm <= 2.5) {
      return {
        areaName: 'Sunil Ward & Marwari Chokepoint (Active Subsidence Zone)',
        zoneCode: 'ZONE-ALPHA (Moraine Subsidence Slip)',
        subSector: 'Joshimath Ancient Glacial Moraine',
        elevationMeters: altitude || 1890,
        terrainType: 'Gneissic Moraine Boulders & Loose Colluvium',
        hazardClassification: 'RED_RUNOUT_ZONE',
        riskLevel: 'CRITICAL THREAT (Continuous Slope Creep)',
        immediateAction: 'Evacuate fissured structures immediately. Keep distance from overhanging retaining walls.',
        safeExitVector: 'Retreat toward Auli Road Upper Spur (Azimuth 160°)',
        radiusMeters: radius,
        landmarkNear: 'Marwari Alaknanda Bridge Access / Hydro Plant Inlet',
      };
    } else if (distanceKm <= 6.0) {
      return {
        areaName: 'Joshimath Upper Bazaar & Barracks Perimeter',
        zoneCode: 'ZONE-BRAVO (Subsidence Perimeter Buffer)',
        subSector: 'Mid-Slope Glacial Moraine Terrace',
        elevationMeters: altitude || 2050,
        terrainType: 'Consolidated Scree & Moraine Matrix',
        hazardClassification: 'AMBER_BUFFER_ZONE',
        riskLevel: 'ELEVATED ADVISORY (Ground Subsidence Monitoring)',
        immediateAction: 'Inspect structural cracks and soil seepage. Prepare family emergency kit.',
        safeExitVector: 'Ascend along Ropeway Ridge toward Auli (Azimuth 140°)',
        radiusMeters: Math.max(accuracy || 25, 130),
        landmarkNear: 'Joshimath Main Post Office & ITBP Gate',
      };
    } else {
      return {
        areaName: 'Pipalkoti Disaster Staging Hub & NDRF Camp',
        zoneCode: 'ZONE-CHARLIE (Valley Relief Haven)',
        subSector: 'Alaknanda Valley Floor',
        elevationMeters: altitude || 1260,
        terrainType: 'Stable Quartzite & Granite Bedrock',
        hazardClassification: 'GREEN_SAFE_HAVEN',
        riskLevel: 'SAFE PERIMETER (Lowland Staging)',
        immediateAction: 'Receive displaced families, manage medical triage and supply convoys.',
        safeExitVector: 'NH-58 Chamoli Main Highway',
        radiusMeters: Math.max(accuracy || 30, 240),
        landmarkNear: 'NDRF Regional Response Centre & District Depot',
      };
    }
  }

  // Default: Kalimpong-Sikkim NH-10 Corridor
  if (distanceKm <= 2.5) {
    return {
      areaName: 'Sector 4 - KM 42.8 Cut-Slope & Debris Runout Fan',
      zoneCode: 'ZONE-ALPHA (Active Rupture & Runout Chute)',
      subSector: 'Lower Teesta Gorge (NH-10 Km 42-44)',
      elevationMeters: altitude || 1390,
      terrainType: 'Unconsolidated Colluvium & Phyllite Scree',
      hazardClassification: 'RED_RUNOUT_ZONE',
      riskLevel: 'CRITICAL THREAT (Direct Debris Trajectory)',
      immediateAction: 'Evacuate laterally perpendicular to fall line. Move 350m East toward Ridge 14.',
      safeExitVector: 'Azimuth 310° NW toward Upper Singtam Bypass (380m lateral climb)',
      radiusMeters: radius,
      landmarkNear: 'NH-10 Culvert KM 42.8 / Slope Sensor Array SN-089',
    };
  } else if (distanceKm <= 6.0) {
    return {
      areaName: 'Teesta Bazaar Low-Lying Habitation & Bridge Axis',
      zoneCode: 'ZONE-BRAVO (Fluvial Retention & Buffer)',
      subSector: 'Teesta River Confluence Basin',
      elevationMeters: altitude || 720,
      terrainType: 'Alluvial River Terraces & Highway Embankment',
      hazardClassification: 'AMBER_BUFFER_ZONE',
      riskLevel: 'ELEVATED ADVISORY (Damming & Debris Flood Risk)',
      immediateAction: 'Evacuate riverfront structures and bridge approaches. Ascend above 800m contour elevation.',
      safeExitVector: 'Azimuth 085° E toward Kalimpong Ridge Havens',
      radiusMeters: Math.max(accuracy || 25, 140),
      landmarkNear: 'Teesta Police Outpost & Suspension Bridge Pier',
    };
  } else {
    return {
      areaName: 'Rangpo Upland BRO Staging Facility & Helipad Zone',
      zoneCode: 'ZONE-CHARLIE (Upland Safe Haven)',
      subSector: 'Upper Rangpo Valley Ridge',
      elevationMeters: altitude || 1840,
      terrainType: 'Competent Quartzite Bedrock Ridge',
      hazardClassification: 'GREEN_SAFE_HAVEN',
      riskLevel: 'SAFE PERIMETER (Beyond Rupture Trajectory)',
      immediateAction: 'Maintain emergency staging and coordination. Prepare heavy earthmovers and relief kits.',
      safeExitVector: 'Secure Inside Facility Compound (Pad-01 & Operations Shed)',
      radiusMeters: Math.max(accuracy || 30, 220),
      landmarkNear: 'BRO Base Compound Gate & Helipad Alpha',
    };
  }
}

export const PRESET_SIMULATED_LOCATIONS = [
  {
    id: 'km42-runout',
    name: 'NH-10 KM 42.8 Cut-Slope (Inside Runout Geofence)',
    lat: 27.0582,
    lng: 88.4715,
    altitude: 1390,
    proximityDescription: '0.12 km from active failure plane',
  },
  {
    id: 'teesta-bazaar',
    name: 'Teesta Bazaar Checkpost (High Alert Buffer)',
    lat: 27.0650,
    lng: 88.4410,
    altitude: 720,
    proximityDescription: '3.1 km downstream from KM 42.8',
  },
  {
    id: 'rangpo-depot',
    name: 'Rangpo Upland BRO Staging Depot (Safe Perimeter)',
    lat: 27.1760,
    lng: 88.5280,
    altitude: 1840,
    proximityDescription: '14.2 km upland from hazard corridor',
  },
];

export function useLiveLocation(currentSector: SectorConfig) {
  const [state, setState] = useState<LiveLocationState>({
    enabled: false,
    status: 'idle',
    lat: null,
    lng: null,
    accuracy: null,
    altitude: null,
    speed: null,
    heading: null,
    timestamp: null,
    error: null,
    isSimulated: false,
    simulationName: undefined,
    distanceToActiveHazardKm: null,
    bearingToActiveHazardDeg: null,
    insideGeofence: false,
    proximityStatus: 'SAFE_PERIMETER',
  });

  const watchIdRef = useRef<number | null>(null);

  const computeMetrics = useCallback(
    (lat: number, lng: number, accuracy?: number | null, altitude?: number | null) => {
      const [targetLat, targetLng] = currentSector.coordinates;
      const distance = calculateDistanceKm(lat, lng, targetLat, targetLng);
      const bearing = calculateBearingDeg(lat, lng, targetLat, targetLng);
      const insideGeofence = distance <= 2.5;
      const proximityStatus =
        distance <= 2.5
          ? 'CRITICAL_ZONE'
          : distance <= 6.0
          ? 'WARNING_BUFFER'
          : 'SAFE_PERIMETER';

      const presenceArea = determinePresenceArea(
        lat,
        lng,
        accuracy ?? null,
        altitude ?? null,
        currentSector,
        distance
      );

      return {
        distanceToActiveHazardKm: distance,
        bearingToActiveHazardDeg: bearing,
        insideGeofence,
        proximityStatus: proximityStatus as 'CRITICAL_ZONE' | 'WARNING_BUFFER' | 'SAFE_PERIMETER',
        presenceArea,
      };
    },
    [currentSector]
  );

  // Start real browser geolocation
  const startWatching = useCallback(() => {
    if (!navigator.geolocation) {
      setState((prev) => ({
        ...prev,
        enabled: false,
        status: 'error',
        error: 'Geolocation API is not supported by your browser.',
      }));
      return;
    }

    setState((prev) => ({
      ...prev,
      enabled: true,
      status: 'locating',
      error: null,
      isSimulated: false,
      simulationName: undefined,
    }));

    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
    }

    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude, longitude, accuracy, altitude, speed, heading } = pos.coords;
        const metrics = computeMetrics(latitude, longitude, accuracy, altitude);

        setState((prev) => ({
          ...prev,
          enabled: true,
          status: 'tracking',
          lat: latitude,
          lng: longitude,
          accuracy: accuracy ? Math.round(accuracy) : null,
          altitude: altitude ? Math.round(altitude) : null,
          speed: speed ? Number((speed * 3.6).toFixed(1)) : null, // m/s to km/h
          heading: heading !== null && !isNaN(heading) ? Math.round(heading) : null,
          timestamp: pos.timestamp,
          error: null,
          isSimulated: false,
          simulationName: undefined,
          ...metrics,
        }));
      },
      (err) => {
        let msg = 'Unable to retrieve location.';
        if (err.code === err.PERMISSION_DENIED) {
          msg = 'Location permission denied by user or container.';
        } else if (err.code === err.POSITION_UNAVAILABLE) {
          msg = 'Location information is currently unavailable.';
        } else if (err.code === err.TIMEOUT) {
          msg = 'Location request timed out.';
        }

        // On error or permission denied, smoothly offer fallback simulation so system is immediately interactive
        setState((prev) => {
          const fallback = PRESET_SIMULATED_LOCATIONS[0];
          const metrics = computeMetrics(fallback.lat, fallback.lng, 12, fallback.altitude);
          return {
            ...prev,
            enabled: true,
            status: err.code === err.PERMISSION_DENIED ? 'permission-denied' : 'error',
            error: msg,
            lat: fallback.lat,
            lng: fallback.lng,
            accuracy: 12,
            altitude: fallback.altitude,
            speed: 0,
            heading: 42,
            timestamp: Date.now(),
            isSimulated: true,
            simulationName: `${fallback.name} (Simulated Demo)`,
            ...metrics,
          };
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  }, [computeMetrics]);

  // Stop watching
  const stopWatching = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setState((prev) => ({
      ...prev,
      enabled: false,
      status: 'idle',
      error: null,
    }));
  }, []);

  // Set a simulated test location
  const setSimulatedLocation = useCallback(
    (presetId: string) => {
      const preset =
        PRESET_SIMULATED_LOCATIONS.find((p) => p.id === presetId) ||
        PRESET_SIMULATED_LOCATIONS[0];

      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }

      const metrics = computeMetrics(preset.lat, preset.lng, 8, preset.altitude);

      setState({
        enabled: true,
        status: 'tracking',
        lat: preset.lat,
        lng: preset.lng,
        accuracy: 8,
        altitude: preset.altitude,
        speed: 15.4,
        heading: 68,
        timestamp: Date.now(),
        error: null,
        isSimulated: true,
        simulationName: preset.name,
        ...metrics,
      });
    },
    [computeMetrics]
  );

  // Recalculate metrics when sector changes
  useEffect(() => {
    if (state.lat !== null && state.lng !== null) {
      const metrics = computeMetrics(state.lat, state.lng, state.accuracy, state.altitude);
      setState((prev) => ({
        ...prev,
        ...metrics,
      }));
    }
  }, [currentSector, computeMetrics, state.lat, state.lng, state.accuracy, state.altitude]);

  // Clean up
  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  return {
    location: state,
    startWatching,
    stopWatching,
    setSimulatedLocation,
    presets: PRESET_SIMULATED_LOCATIONS,
  };
}
