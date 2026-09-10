# LEWS Sentinel: AI-Powered Early Warning & Land Monitoring System

**LEWS Sentinel** (Landslide Early Warning System) is a tactical command platform designed for real-time geotechnical monitoring, risk forecasting, and responder field safety. Powered by **Gemini 3.8 Flash**, the platform integrates live GPS geofencing, subsurface sensor telemetry, 3D GIS visualization, and automated Common Alerting Protocol (CAP) dispatches.

---

## Key Features

* **AI Geotechnical Diagnostic Assistant (Gemini 3.8 Flash)**
  * Multi-modal kinematic modeling and time-to-failure estimations.
  * Slide-over conversational copilot for slope mechanics, pore water pressure thresholds, and mitigation SOPs.
  * Real-time location-aware safety briefings for field units based on proximity to active rupture zones.

* **Live Location & Geofencing Sentinel**
  * Real-time GPS tracking with dynamic bearing, distance, and altitude delta calculations relative to rupture crowns.
  * Visual 500m proximity safety envelopes with automated radar alerts.
  * Live presence area footprint mapping with tactical hazard hatching and escape trajectory projections.

* **Tactical 3D GIS Command Center**
  * Geospatial map canvas rendering kinematic vectors, H3 spatial vulnerability indices, and active hazard zones.
  * Flexible UI toggle between **Full Map Canvas View** and **Telemetry Split View**.

* **Automated Risk Reporting & CAP Dispatch**
  * One-click vector **PDF Export Engine** for Sector Risk Assessment SitReps.
  * **OASIS CAP v1.2** XML dispatch generator (ITU-T X.1303 compliant) for multi-channel cellular broadcasts.

* **Sensor Mesh Integration**
  * Live monitoring arrays for piezometers, tiltmeters, and inclinometers.

---

## Tech Stack

* **Frontend Framework:** React, TypeScript, Vite
* **Runtime / Backend:** Remix, Express / Node (`server.ts`), Bun
* **AI Engine:** `@google/genai` SDK (Gemini 3.8 Flash)
* **Styling:** Tailwind CSS

---

## Getting Started

### Prerequisites

* [Node.js](https://nodejs.org/) (v18+) or [Bun](https://bun.sh/) installed.
* Gemini API Key from Google AI Studio.

### Installation

1. **Clone the repository:**
   ```bash
   git clone [https://github.com/rusheelkolap-cell/LEWS-Sentinel--smart-land-monitoring-system.git](https://github.com/rusheelkolap-cell/LEWS-Sentinel--smart-land-monitoring-system.git)
   cd LEWS-Sentinel--smart-land-monitoring-system
