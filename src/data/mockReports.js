/**
 * SPACE Corporate Systems – Road Concern & Pothole Tracking System
 * Mock Database Schema & Seed Records (Centered on City of Malolos, Bulacan)
 * Coordinates Reference: Lat ~14.851, Lng ~120.816
 */

/**
 * Generates a zero-dependency, offline-safe SVG Data URI representing realistic
 * field road inspection imagery ("before", "during", "completed") with telemetry HUD.
 */
export function createRoadInspectionPhoto({
  stage, // 'before' | 'during' | 'completed'
  reportId,
  locationShort,
  lat,
  lng,
  severity,
  timestamp,
}) {
  const stageConfig = {
    before: {
      badge: 'CITIZEN SUBMISSION • BEFORE REPAIR',
      badgeBg: '#7F1D1D',
      badgeStroke: '#F87171',
      skyGradStart: '#1E293B',
      skyGradEnd: '#334155',
      asphaltColor: '#1E242B',
      detailMarkup: `
        <!-- Damaged Asphalt Outer Fracture -->
        <polygon points="210,235 315,215 470,225 565,265 535,335 410,360 255,345 185,290" fill="#090D14" stroke="#64748B" stroke-width="3"/>
        <!-- Inner Deep Pothole Sub-base & Standing Water Reflection -->
        <polygon points="245,255 335,235 445,245 520,275 490,320 395,340 280,325 225,288" fill="#1E1B18" stroke="#475569" stroke-width="2"/>
        <ellipse cx="375" cy="292" rx="95" ry="26" fill="#0F172A" opacity="0.85"/>
        <ellipse cx="360" cy="288" rx="60" ry="14" fill="#38BDF8" opacity="0.22"/>
        <!-- Radial Stress Cracks -->
        <path d="M210,235 L145,210 M315,215 L295,180 M470,225 L530,195 M565,265 L635,270 M255,345 L190,385 M410,360 L445,395" stroke="#0F172A" stroke-width="3.5" stroke-linecap="round"/>
        <!-- Inspection Scale Marker -->
        <rect x="250" y="352" width="240" height="14" rx="2" fill="#FACC15" stroke="#050B16" stroke-width="1.5"/>
        <rect x="280" y="352" width="30" height="14" fill="#050B16"/>
        <rect x="340" y="352" width="30" height="14" fill="#050B16"/>
        <rect x="400" y="352" width="30" height="14" fill="#050B16"/>
        <rect x="460" y="352" width="30" height="14" fill="#050B16"/>
        <!-- Target Crosshair Reticle -->
        <circle cx="375" cy="285" r="58" fill="none" stroke="#00F2FE" stroke-width="2" stroke-dasharray="8 6"/>
        <line x1="375" y1="215" x2="375" y2="240" stroke="#00F2FE" stroke-width="2"/>
        <line x1="375" y1="330" x2="375" y2="355" stroke="#00F2FE" stroke-width="2"/>
        <line x1="305" y1="285" x2="330" y2="285" stroke="#00F2FE" stroke-width="2"/>
        <line x1="420" y1="285" x2="445" y2="285" stroke="#00F2FE" stroke-width="2"/>
      `,
    },
    during: {
      badge: 'MAINTENANCE CREW • DURING REPAIR',
      badgeBg: '#075985',
      badgeStroke: '#38BDF8',
      skyGradStart: '#0F172A',
      skyGradEnd: '#1E3A5F',
      asphaltColor: '#1E242B',
      detailMarkup: `
        <!-- Saw-Cut Rectangular Excavation Trench -->
        <polygon points="210,230 550,230 595,355 165,355" fill="#111827" stroke="#38BDF8" stroke-width="2.5" stroke-dasharray="10 5"/>
        <!-- Tack Coat & Hot-Mix Asphalt Base Layer -->
        <polygon points="225,242 535,242 575,345 185,345" fill="#1F2937" stroke="#4B5563" stroke-width="2"/>
        <!-- Fresh Bitumen Aggregate Texture -->
        <circle cx="290" cy="285" r="4" fill="#9CA3AF"/><circle cx="340" cy="270" r="3" fill="#6B7280"/>
        <circle cx="420" cy="295" r="4" fill="#9CA3AF"/><circle cx="465" cy="275" r="3.5" fill="#D1D5DB"/>
        <circle cx="360" cy="315" r="4" fill="#9CA3AF"/><circle cx="265" cy="320" r="3" fill="#6B7280"/>
        <!-- Safety Traffic Cone Left -->
        <polygon points="155,265 185,265 176,195 164,195" fill="#F97316" stroke="#FFFFFF" stroke-width="1.5"/>
        <polygon points="161,225 179,225 177,210 163,210" fill="#FFFFFF"/>
        <rect x="145" y="263" width="50" height="8" rx="2" fill="#EA580C"/>
        <!-- Safety Traffic Cone Right -->
        <polygon points="575,265 605,265 596,195 584,195" fill="#F97316" stroke="#FFFFFF" stroke-width="1.5"/>
        <polygon points="581,225 599,225 597,210 583,210" fill="#FFFFFF"/>
        <rect x="565" y="263" width="50" height="8" rx="2" fill="#EA580C"/>
        <!-- Compaction Progress Banner -->
        <rect x="265" y="278" width="230" height="32" rx="6" fill="#050B16" opacity="0.88" stroke="#38BDF8" stroke-width="1.5"/>
        <text x="380" y="299" text-anchor="middle" fill="#E0F2FE" font-family="Montserrat, sans-serif" font-size="12" font-weight="700">SUB-BASE COMPACTION 75%</text>
      `,
    },
    completed: {
      badge: 'VERIFIED COMPLETION • RESOLVED',
      badgeBg: '#064E3B',
      badgeStroke: '#34D399',
      skyGradStart: '#0F172A',
      skyGradEnd: '#1E293B',
      asphaltColor: '#1E242B',
      detailMarkup: `
        <!-- Freshly Sealed & Compacted Hot-Mix Asphalt Patch -->
        <polygon points="215,235 545,235 585,350 175,350" fill="#111827" stroke="#34D399" stroke-width="2.5"/>
        <!-- Smooth Sealed Joint Perimeter -->
        <polygon points="227,244 533,244 568,340 192,340" fill="#18202C" stroke="#059669" stroke-width="1.5" stroke-dasharray="6 4"/>
        <!-- Restored Thermoplastic Center Line -->
        <polygon points="372,175 388,175 396,395 364,395" fill="#FACC15" opacity="0.92"/>
        <!-- QA Passed Overlay Stamp -->
        <rect x="255" y="268" width="250" height="40" rx="8" fill="#064E3B" stroke="#34D399" stroke-width="2"/>
        <text x="380" y="293" text-anchor="middle" fill="#D1FAE5" font-family="Montserrat, sans-serif" font-size="13" font-weight="700">✓ QA PASSED • LEVEL SURFACE</text>
      `,
    },
  };

  const cfg = stageConfig[stage] || stageConfig.before;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 760 440" width="760" height="440">
    <defs>
      <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="${cfg.skyGradStart}"/>
        <stop offset="100%" stop-color="${cfg.skyGradEnd}"/>
      </linearGradient>
      <linearGradient id="road" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#262F3D"/>
        <stop offset="100%" stop-color="${cfg.asphaltColor}"/>
      </linearGradient>
    </defs>

    <!-- Sky & Horizon -->
    <rect width="760" height="165" fill="url(#sky)"/>
    <!-- Malolos Urban Silhouette -->
    <rect x="40" y="110" width="55" height="55" fill="#0F172A"/>
    <rect x="105" y="95" width="70" height="70" fill="#162032"/>
    <polygon points="210,165 250,105 290,165" fill="#0F172A"/>
    <rect x="520" y="105" width="85" height="60" fill="#162032"/>
    <rect x="620" y="120" width="90" height="45" fill="#0F172A"/>

    <!-- Roadway Perspective Surface -->
    <rect y="165" width="760" height="275" fill="#161F2C"/>
    <polygon points="150,165 610,165 750,440 10,440" fill="url(#road)" stroke="#64748B" stroke-width="2"/>

    <!-- Road Shoulder Lines -->
    <line x1="175" y1="165" x2="45" y2="440" stroke="#CBD5E1" stroke-width="4" stroke-dasharray="18 10"/>
    <line x1="585" y1="165" x2="715" y2="440" stroke="#CBD5E1" stroke-width="4" stroke-dasharray="18 10"/>

    <!-- Stage Specific Road Inspection Visual -->
    ${cfg.detailMarkup}

    <!-- Top Telemetry Bar -->
    <rect x="16" y="14" width="728" height="42" rx="8" fill="#050B16" opacity="0.9" stroke="#94A3B8" stroke-width="1.5"/>
    <rect x="26" y="22" width="248" height="26" rx="5" fill="${cfg.badgeBg}" stroke="${cfg.badgeStroke}" stroke-width="1.5"/>
    <text x="150" y="39" text-anchor="middle" fill="#FFFFFF" font-family="Montserrat, sans-serif" font-size="11" font-weight="700">${cfg.badge}</text>
    <text x="292" y="39" fill="#E2E8F0" font-family="Montserrat, sans-serif" font-size="12" font-weight="600">${reportId} • ${locationShort}</text>
    <text x="730" y="39" text-anchor="end" fill="#00F2FE" font-family="monospace" font-size="12" font-weight="700">SEV: ${severity.toUpperCase()}</text>

    <!-- Bottom GPS & Timestamp HUD -->
    <rect x="16" y="388" width="728" height="38" rx="8" fill="#050B16" opacity="0.92" stroke="#94A3B8" stroke-width="1.5"/>
    <text x="32" y="412" fill="#00F2FE" font-family="monospace" font-size="13" font-weight="700">GPS: ${Number(lat).toFixed(5)}° N, ${Number(lng).toFixed(5)}° E</text>
    <text x="728" y="412" text-anchor="end" fill="#CBD5E1" font-family="Montserrat, sans-serif" font-size="12" font-weight="500">LOGGED: ${timestamp}</text>
  </svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export const INITIAL_MOCK_REPORTS = [
  {
    id: 'RPT-2026-0101',
    citizenName: 'Juan Dela Cruz',
    contact: '+63 917 482 9104',
    locationName: 'MacArthur Highway, Crossing Guinhawa, City of Malolos, Bulacan',
    lat: 14.8527,
    lng: 120.8160,
    severity: 'Critical',
    status: 'pending',
    description:
      'Deep cratered pothole (approx. 1.2m wide, 14cm deep) on northbound inner lane approaching Malolos Crossing flyover. High hazard for motorcycles during evening rain.',
    assignedTeam: 'Unassigned',
    instructions:
      'Verify exact lane offset near Crossing Guinhawa traffic island, saw-cut perimeter, dewater cavity, and apply hot-mix asphalt patch.',
    submittedAt: '2026-10-18 07:42 AM',
    citizenPhoto: createRoadInspectionPhoto({
      stage: 'before',
      reportId: 'RPT-2026-0101',
      locationShort: 'MacArthur Hwy • Guinhawa',
      lat: 14.8527,
      lng: 120.8160,
      severity: 'Critical',
      timestamp: '2026-10-18 07:42 AM',
    }),
    repairPhoto: createRoadInspectionPhoto({
      stage: 'during',
      reportId: 'RPT-2026-0101',
      locationShort: 'MacArthur Hwy • Guinhawa',
      lat: 14.8527,
      lng: 120.8160,
      severity: 'Critical',
      timestamp: 'Pending Field Dispatch',
    }),
    completedPhoto: createRoadInspectionPhoto({
      stage: 'completed',
      reportId: 'RPT-2026-0101',
      locationShort: 'MacArthur Hwy • Guinhawa',
      lat: 14.8527,
      lng: 120.8160,
      severity: 'Critical',
      timestamp: 'Verification Preview',
    }),
  },
  {
    id: 'RPT-2026-0102',
    citizenName: 'Maria Clara Santos',
    contact: '+63 918 639 2041',
    locationName: 'Paseo del Congreso, Brgy. Catmon, City of Malolos, Bulacan',
    lat: 14.8475,
    lng: 120.8132,
    severity: 'High',
    status: 'pending',
    description:
      'Collapsed asphalt edge and alligator cracking 80 meters east of Barasoain Church historical marker. Mobile GPS drifted slightly toward the sidewalk; pin requires Admin verification.',
    assignedTeam: 'Unassigned',
    instructions:
      'Deploy Heritage Corridor Traffic Control cones during off-peak hours (9:00 PM – 4:00 AM) and restore level wearing course.',
    submittedAt: '2026-10-18 09:15 AM',
    citizenPhoto: createRoadInspectionPhoto({
      stage: 'before',
      reportId: 'RPT-2026-0102',
      locationShort: 'Paseo del Congreso • Catmon',
      lat: 14.8475,
      lng: 120.8132,
      severity: 'High',
      timestamp: '2026-10-18 09:15 AM',
    }),
    repairPhoto: createRoadInspectionPhoto({
      stage: 'during',
      reportId: 'RPT-2026-0102',
      locationShort: 'Paseo del Congreso • Catmon',
      lat: 14.8475,
      lng: 120.8132,
      severity: 'High',
      timestamp: 'Pending Field Dispatch',
    }),
    completedPhoto: createRoadInspectionPhoto({
      stage: 'completed',
      reportId: 'RPT-2026-0102',
      locationShort: 'Paseo del Congreso • Catmon',
      lat: 14.8475,
      lng: 120.8132,
      severity: 'High',
      timestamp: 'Verification Preview',
    }),
  },
  {
    id: 'RPT-2026-0103',
    citizenName: 'Engr. Roberto Valenzuela',
    contact: '+63 920 511 8832',
    locationName: 'Capitol View Park Access Road, Brgy. Bulihan, City of Malolos, Bulacan',
    lat: 14.8568,
    lng: 120.8148,
    severity: 'High',
    status: 'approved',
    description:
      'Twin potholes along Provincial Capitol approach road causing abrupt braking for public utility vehicles. Coordinates verified and approved by Admin; awaiting crew dispatch.',
    assignedTeam: 'Malolos Engineering Crew A (Pending Dispatch)',
    instructions:
      'Execute full-depth square cut across both adjacent cavities, apply SS-1 emulsified asphalt tack coat, and compact 50mm dense-graded binder.',
    submittedAt: '2026-10-17 03:20 PM',
    citizenPhoto: createRoadInspectionPhoto({
      stage: 'before',
      reportId: 'RPT-2026-0103',
      locationShort: 'Capitol Access Rd • Bulihan',
      lat: 14.8568,
      lng: 120.8148,
      severity: 'High',
      timestamp: '2026-10-17 03:20 PM',
    }),
    repairPhoto: createRoadInspectionPhoto({
      stage: 'during',
      reportId: 'RPT-2026-0103',
      locationShort: 'Capitol Access Rd • Bulihan',
      lat: 14.8568,
      lng: 120.8148,
      severity: 'High',
      timestamp: 'Crew Staged for Dispatch',
    }),
    completedPhoto: createRoadInspectionPhoto({
      stage: 'completed',
      reportId: 'RPT-2026-0103',
      locationShort: 'Capitol Access Rd • Bulihan',
      lat: 14.8568,
      lng: 120.8148,
      severity: 'High',
      timestamp: 'Verification Preview',
    }),
  },
  {
    id: 'RPT-2026-0104',
    citizenName: 'Angela Mendoza',
    contact: '+63 917 890 3319',
    locationName: 'Blas Ople Diversion Road, Brgy. Mojon Junction, City of Malolos, Bulacan',
    lat: 14.8594,
    lng: 120.8215,
    severity: 'Critical',
    status: 'in_progress',
    description:
      'Severe rutting and pothole cluster at heavy truck turning radius on Blas Ople Diversion Road. Maintenance unit is on site performing excavation and hot-mix patching.',
    assignedTeam: 'DPWH-Malolos Rapid Patch Unit Alpha',
    instructions:
      'Reinforce crushed aggregate base course to 150mm thickness before laying hot-mix asphalt surface to withstand freight axle loads.',
    submittedAt: '2026-10-16 11:05 AM',
    citizenPhoto: createRoadInspectionPhoto({
      stage: 'before',
      reportId: 'RPT-2026-0104',
      locationShort: 'Blas Ople Rd • Mojon',
      lat: 14.8594,
      lng: 120.8215,
      severity: 'Critical',
      timestamp: '2026-10-16 11:05 AM',
    }),
    repairPhoto: createRoadInspectionPhoto({
      stage: 'during',
      reportId: 'RPT-2026-0104',
      locationShort: 'Blas Ople Rd • Mojon',
      lat: 14.8594,
      lng: 120.8215,
      severity: 'Critical',
      timestamp: '2026-10-17 02:10 PM',
    }),
    completedPhoto: createRoadInspectionPhoto({
      stage: 'completed',
      reportId: 'RPT-2026-0104',
      locationShort: 'Blas Ople Rd • Mojon',
      lat: 14.8594,
      lng: 120.8215,
      severity: 'Critical',
      timestamp: '2026-10-18 11:30 AM',
    }),
  },
  {
    id: 'RPT-2026-0105',
    citizenName: 'Carlos Gatmaitan',
    contact: '+63 998 214 7760',
    locationName: 'Fausta Road, Brgy. Mabolo, City of Malolos, Bulacan',
    lat: 14.8492,
    lng: 120.8241,
    severity: 'Moderate',
    status: 'in_progress',
    description:
      'Water-damaged surface depression adjacent to storm drain grating along Fausta Road. Field crew has completed milling and is compacting the asphalt layer.',
    assignedTeam: 'City Engineering Asphalt Crew B',
    instructions:
      'Ensure 2% cross-slope drainage toward storm inlet grating and seal perimeter joints with rubberized bitumen.',
    submittedAt: '2026-10-16 04:50 PM',
    citizenPhoto: createRoadInspectionPhoto({
      stage: 'before',
      reportId: 'RPT-2026-0105',
      locationShort: 'Fausta Road • Mabolo',
      lat: 14.8492,
      lng: 120.8241,
      severity: 'Moderate',
      timestamp: '2026-10-16 04:50 PM',
    }),
    repairPhoto: createRoadInspectionPhoto({
      stage: 'during',
      reportId: 'RPT-2026-0105',
      locationShort: 'Fausta Road • Mabolo',
      lat: 14.8492,
      lng: 120.8241,
      severity: 'Moderate',
      timestamp: '2026-10-17 04:45 PM',
    }),
    completedPhoto: createRoadInspectionPhoto({
      stage: 'completed',
      reportId: 'RPT-2026-0105',
      locationShort: 'Fausta Road • Mabolo',
      lat: 14.8492,
      lng: 120.8241,
      severity: 'Moderate',
      timestamp: '2026-10-18 01:15 PM',
    }),
  },
  {
    id: 'RPT-2026-0106',
    citizenName: 'Patricia Evangelista',
    contact: '+63 915 702 6498',
    locationName: 'Estrella Street, Brgy. Santo Rosario (Poblacion), City of Malolos, Bulacan',
    lat: 14.8443,
    lng: 120.8114,
    severity: 'Moderate',
    status: 'resolved',
    description:
      'Delaminated asphalt patch near Malolos Cathedral pedestrian crossing. Fully excavated, repaved, and verified by Admin with dual citizen/admin notification sent.',
    assignedTeam: 'City Engineering Asphalt Crew A',
    instructions:
      'Restore smooth pedestrian crossing transition and apply thermoplastic lane striping.',
    submittedAt: '2026-10-15 08:30 AM',
    resolvedAt: '2026-10-17 05:12 PM',
    citizenPhoto: createRoadInspectionPhoto({
      stage: 'before',
      reportId: 'RPT-2026-0106',
      locationShort: 'Estrella St • Sto. Rosario',
      lat: 14.8443,
      lng: 120.8114,
      severity: 'Moderate',
      timestamp: '2026-10-15 08:30 AM',
    }),
    repairPhoto: createRoadInspectionPhoto({
      stage: 'during',
      reportId: 'RPT-2026-0106',
      locationShort: 'Estrella St • Sto. Rosario',
      lat: 14.8443,
      lng: 120.8114,
      severity: 'Moderate',
      timestamp: '2026-10-16 01:25 PM',
    }),
    completedPhoto: createRoadInspectionPhoto({
      stage: 'completed',
      reportId: 'RPT-2026-0106',
      locationShort: 'Estrella St • Sto. Rosario',
      lat: 14.8443,
      lng: 120.8114,
      severity: 'Moderate',
      timestamp: '2026-10-17 05:12 PM',
    }),
  },
];

export const MAINTENANCE_TEAMS = [
  'DPWH-Malolos Rapid Patch Unit Alpha',
  'City Engineering Asphalt Crew A',
  'City Engineering Asphalt Crew B',
  'Bulacan 1st DEO Heavy Maintenance Squad',
];
