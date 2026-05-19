# SAIR Demo

Smart Accident Information Reporting System.

SAIR Demo is a portfolio-safe accident reporting dashboard demo for an admin/police workflow. It focuses on reviewing fictional accident reports, monitoring report status, and viewing report locations on a live map-style interface.

## Scope

- Admin/police dashboard for reviewing accident reports
- Live map view for report coordinates around fictional Amman/Jordan-style locations
- Reports table with search and filters
- Demo authentication that works without the backend API
- Existing backend API support remains available when configured and online

## Demo Data

All bundled demo reports are fictional. The app uses `src/data/mockReports.js` when demo mode is active, no auth token exists, or the backend API is unavailable.

## Demo Login

On the login page, click **Enter Demo Dashboard**.

Demo user:

- Email: `demo@sair.local`
- Role: `admin`
- Mode: `demo`

The demo session is stored in localStorage as `sair-demo-user` and persists across refreshes. Logging out clears the demo session and any auth token.

## Tech Stack

- React
- Vite
- React Router
- Tailwind CSS
- Axios
- Leaflet / React Leaflet
- Lucide React icons

## Run Locally

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Notes

Mock data is used automatically when the backend API is unavailable, so the dashboard, reports page, and live map remain usable as a portfolio demo.
