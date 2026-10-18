# SPACE Corporate Systems – Road Concern & Pothole Tracking System (Admin Web Portal)

Production-ready, WCAG 2.1 AA/AAA compliant Single-Role **Admin Web Portal** built for **IT 305 – Advanced Web Development**.

## Quick Start (`localhost`)

```bash
npm install
npm run dev
```

Open `http://localhost:5173` in your browser.

## Demo Administrator Credentials
- **Email:** `admin@space.coop`
- **Password:** `admin123`
- *(A one-click **Autofill Demo Login** button is provided on the Sign-In view)*

## Core Workflows Implemented
1. **Admin Authentication (`src/components/LoginView.jsx`):** Persistent session gatekeeper with demo credential autofill.
2. **Citizen Road Concern Triage (`src/components/TriageQueueView.jsx`):** Moderation queue for `pending` reports (withheld from the map until approved), interactive Leaflet GPS pin calibration, and **Approve**, **Assign to Maintenance**, or **Reject (with reason)** actions.
3. **Interactive Map View (`src/components/InteractiveMapView.jsx`):** Displays only verified/approved road concerns (`approved`, `in_progress`, `resolved`) around Malolos, Bulacan (`14.851°N, 120.816°E`) with custom inline SVG markers and a Pin Summary Card.
4. **Maintenance Work Order & Dispatch Report (`src/components/WorkOrderView.jsx`):** Printable engineering work order sheet containing Report ID, verified GPS pin, location, citizen photo, assigned team, and technical instructions.
5. **Repair Tracking & Verification (`src/components/RepairTrackingView.jsx`):** Side-by-side comparison of Citizen Submission ("Before"), Maintenance Progress ("During Repair"), and Final Verification ("Completed") photos.
6. **Resolution & Dual Notification (`src/components/ToastContainer.jsx`):** Marking a repair as **Resolved** triggers the accessible high-contrast toast notification:
   > *"Road repair resolved. Citizen [User] and Admin have been notified."*
