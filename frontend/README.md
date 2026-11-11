# StrataSense — Frontend Dashboard & Command Center

The frontend interface for **StrataSense**, an industrial real-time mine monitoring command center designed for geospatial tracking, risk assessment, and strata deformation visualization.

## Tech Stack
* **Core:** React 18, Vite 6
* **Geospatial & Mapping:** Leaflet, React-Leaflet, OpenStreetMap Tile API
* **Data Visualization:** Recharts (Deformation trend curves, zone risk distributions)
* **Real-Time Streaming:** Native WebSocket Client with automatic exponential reconnection
* **Icons & Styling:** Lucide React, Modular Dark Modern Industrial CSS

## Quick Start

```bash
# Install dependencies
npm install

# Setup local environment
cp .env.example .env

# Start development server
npm run dev
```

Default development port: `http://localhost:5173`

## Key Capabilities
* **Geospatial GIS View:** Visual representation of mine coordinates, zone risk bounds, and sensor node health markers.
* **Low-Latency Telemetry Streaming:** Consumes `/ws` live feed from FastAPI backend without triggering full page re-renders.
* **Automated Alert Escalation:** Highlights deformation thresholds with immediate color-coded alert banners (SAFE / WARNING / DANGER).
* **NASA EONET Seismic Correlation:** Fetches and cross-correlates natural seismic/landslide occurrences with localized mine readings.
* **Resilient Demo Mode:** Isolated simulation fallback for offline demonstrations and stage evaluations.
