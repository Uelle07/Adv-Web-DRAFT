import React, { useEffect, useRef } from 'react';
import L from 'leaflet';

/**
 * Fix the known Leaflet marker icon asset bug inline using standard SVG data-URIs
 * so bundlers (Vite/Webpack) never fail looking for marker-icon.png or marker-shadow.png.
 */
const DEFAULT_PIN_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="44" viewBox="0 0 32 44">
  <path d="M16 1C7.716 1 1 7.716 1 16c0 10.5 15 26.5 15 26.5S31 26.5 31 16C31 7.716 24.284 1 16 1z" fill="#A78BFA" stroke="#050B16" stroke-width="2"/>
  <circle cx="16" cy="16" r="6" fill="#050B16"/>
</svg>`;

const DEFAULT_SHADOW_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="41" height="41" viewBox="0 0 41 41">
  <ellipse cx="20" cy="34" rx="14" ry="5" fill="rgba(0,0,0,0.45)"/>
</svg>`;

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: `data:image/svg+xml;utf8,${encodeURIComponent(DEFAULT_PIN_SVG)}`,
  iconUrl: `data:image/svg+xml;utf8,${encodeURIComponent(DEFAULT_PIN_SVG)}`,
  shadowUrl: `data:image/svg+xml;utf8,${encodeURIComponent(DEFAULT_SHADOW_SVG)}`,
  iconSize: [32, 44],
  iconAnchor: [16, 44],
  popupAnchor: [0, -40],
});

/**
 * Generates an inline SVG L.divIcon for each repair status or triage calibration pin.
 * Enforces WCAG dual-contrast (distinct icon glyph + text tag + high-contrast border).
 */
function createStatusDivIcon(status, isSelected = false, labelCode = '') {
  const configs = {
    triage: {
      bg: '#00F2FE',
      text: '#050B16',
      border: '#FFFFFF',
      tag: 'CALIBRATE PIN',
      glyph: `<circle cx="18" cy="18" r="6" fill="none" stroke="#050B16" stroke-width="2.5"/><line x1="18" y1="8" x2="18" y2="28" stroke="#050B16" stroke-width="2"/><line x1="8" y1="18" x2="28" y2="18" stroke="#050B16" stroke-width="2"/>`,
    },
    approved: {
      bg: '#FEF3C7',
      text: '#78350F',
      border: '#FBBF24',
      tag: labelCode || 'APPROVED',
      glyph: `<path d="M18 10l6 3v5c0 4.2-2.6 8-6 9.5-3.4-1.5-6-5.3-6-9.5v-5l6-3z" fill="none" stroke="#78350F" stroke-width="2.2"/>`,
    },
    in_progress: {
      bg: '#E0F2FE',
      text: '#075985',
      border: '#38BDF8',
      tag: labelCode || 'REPAIRING',
      glyph: `<path d="M21.5 12.5a4 4 0 0 0-5 5l-5.5 5.5 2 2 5.5-5.5a4 4 0 0 0 5-5l-2.5 2.5-2-2 2.5-2.5z" fill="#075985"/>`,
    },
    resolved: {
      bg: '#D1FAE5',
      text: '#064E3B',
      border: '#34D399',
      tag: labelCode || 'RESOLVED',
      glyph: `<polyline points="12 18.5 16 22.5 24 14.5" fill="none" stroke="#064E3B" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"/>`,
    },
  };

  const cfg = configs[status] || configs.approved;
  const ringStroke = isSelected ? '#00F2FE' : '#050B16';
  const ringWidth = isSelected ? '3.5' : '2';

  const html = `
    <div style="display:flex;flex-direction:column;align-items:center;transform:translateY(-6px);">
      <div style="
        background:${cfg.bg};
        color:${cfg.text};
        border:2px solid ${cfg.border};
        outline:2px solid ${ringStroke};
        padding:1px 6px;
        border-radius:4px;
        font-family:'Montserrat',sans-serif;
        font-size:10px;
        font-weight:700;
        white-space:nowrap;
        margin-bottom:2px;
        box-shadow:0 2px 6px rgba(0,0,0,0.65);
      ">${cfg.tag}</div>
      <svg xmlns="http://www.w3.org/2000/svg" width="38" height="46" viewBox="0 0 36 44">
        <path d="M18 2C9.7 2 3 8.7 3 17c0 10.2 15 25 15 25s15-14.8 15-25C33 8.7 26.3 2 18 2z"
          fill="${cfg.bg}" stroke="${ringStroke}" stroke-width="${ringWidth}"/>
        <circle cx="18" cy="17" r="11" fill="${cfg.bg}" stroke="${cfg.border}" stroke-width="1.5"/>
        ${cfg.glyph}
      </svg>
    </div>
  `;

  return L.divIcon({
    className: 'space-map-pin',
    html,
    iconSize: [84, 64],
    iconAnchor: [42, 58],
    popupAnchor: [0, -54],
  });
}

/**
 * Reusable Leaflet / OpenStreetMap Component
 * - mode="triage": Interactive single-pin GPS calibrator (drag pin or click map to adjust coordinates)
 * - mode="overview": Multi-pin interactive map for approved road concerns
 */
export default function LeafletMap({
  mode = 'overview',
  lat = 14.851,
  lng = 120.816,
  zoom = 14,
  onCoordinateChange,
  reports = [],
  selectedReportId = null,
  onSelectReport,
  heightClass = 'h-[420px]',
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersLayerRef = useRef(null);
  const triageMarkerRef = useRef(null);

  // Initialize Leaflet Map once
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [lat, lng],
      zoom,
      zoomControl: true,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors • Malolos GIS Grid',
      maxZoom: 19,
    }).addTo(map);

    const markersLayer = L.layerGroup().addTo(map);
    mapInstanceRef.current = map;
    markersLayerRef.current = markersLayer;

    // Ensure proper tile sizing on layout transitions
    const resizeTimer = setTimeout(() => {
      map.invalidateSize();
    }, 150);

    return () => {
      clearTimeout(resizeTimer);
      map.remove();
      mapInstanceRef.current = null;
      markersLayerRef.current = null;
      triageMarkerRef.current = null;
    };
  }, []);

  // Handle Triage Single-Pin Interactive Calibration Mode
  useEffect(() => {
    const map = mapInstanceRef.current;
    const layer = markersLayerRef.current;
    if (!map || !layer || mode !== 'triage') return;

    layer.clearLayers();

    const marker = L.marker([lat, lng], {
      draggable: true,
      icon: createStatusDivIcon('triage', true, 'DRAG / CLICK PIN'),
      title: 'Drag pin or click map to fine-tune GPS coordinates',
    }).addTo(layer);

    marker.on('dragend', (event) => {
      const pos = event.target.getLatLng();
      if (onCoordinateChange) {
        onCoordinateChange(Number(pos.lat.toFixed(6)), Number(pos.lng.toFixed(6)));
      }
    });

    const handleMapClick = (event) => {
      const { lat: clickedLat, lng: clickedLng } = event.latlng;
      marker.setLatLng([clickedLat, clickedLng]);
      if (onCoordinateChange) {
        onCoordinateChange(
          Number(clickedLat.toFixed(6)),
          Number(clickedLng.toFixed(6))
        );
      }
    };

    map.on('click', handleMapClick);
    map.setView([lat, lng], map.getZoom(), { animate: true });
    triageMarkerRef.current = marker;

    return () => {
      map.off('click', handleMapClick);
    };
  }, [mode, lat, lng, onCoordinateChange]);

  // Handle Overview Multi-Pin Approved Concerns Mode
  useEffect(() => {
    const map = mapInstanceRef.current;
    const layer = markersLayerRef.current;
    if (!map || !layer || mode !== 'overview') return;

    layer.clearLayers();

    reports.forEach((report) => {
      const isSelected = report.id === selectedReportId;
      const shortNum = report.id.replace('RPT-2026-', '#');
      const marker = L.marker([report.lat, report.lng], {
        icon: createStatusDivIcon(report.status, isSelected, shortNum),
        title: `${report.id} — ${report.locationName}`,
      }).addTo(layer);

      marker.on('click', () => {
        if (onSelectReport) {
          onSelectReport(report);
        }
      });
    });

    const selected = reports.find((r) => r.id === selectedReportId);
    if (selected) {
      map.panTo([selected.lat, selected.lng], { animate: true });
    }
  }, [mode, reports, selectedReportId, onSelectReport]);

  return (
    <div className="relative w-full rounded-lg overflow-hidden wcag-border bg-[#0E1726]">
      <div
        ref={mapContainerRef}
        className={`w-full ${heightClass} z-10`}
        role="region"
        aria-label={
          mode === 'triage'
            ? 'Interactive GPS Pin Selector Map for City of Malolos'
            : 'Interactive Approved Road Concerns Map for City of Malolos'
        }
      />
    </div>
  );
}
