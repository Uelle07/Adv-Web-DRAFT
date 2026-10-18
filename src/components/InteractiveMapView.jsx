import React, { useState, useMemo, useEffect } from 'react';
import {
  MapPin,
  ShieldCheck,
  Wrench,
  CheckCircle2,
  FileText,
  Camera,
  User,
  Calendar,
  ExternalLink,
  Layers,
  EyeOff,
} from 'lucide-react';
import LeafletMap from './LeafletMap.jsx';
import { StatusBadge, SeverityBadge } from './StatusBadge.jsx';

/**
 * Workflow 3: Interactive Map View
 * - Visualizes ONLY approved road concerns (status: 'approved' | 'in_progress' | 'resolved').
 * - Pending and rejected submissions are strictly excluded from the map.
 * - Map pins indicate repair status (Approved/Pending Dispatch vs. Under Repair vs. Resolved).
 * - Clicking a pin opens a Summary Card with the damage photo and repair state.
 */
export default function InteractiveMapView({
  reports,
  onOpenWorkOrder,
  onOpenRepairTracking,
}) {
  const [statusFilter, setStatusFilter] = useState('all_approved');

  // Strict Gatekeeper Rule: ONLY approved, in_progress, and resolved concerns appear on the map
  const mapEligibleReports = useMemo(
    () =>
      reports.filter(
        (r) =>
          r.status === 'approved' ||
          r.status === 'in_progress' ||
          r.status === 'resolved'
      ),
    [reports]
  );

  const withheldPendingCount = useMemo(
    () => reports.filter((r) => r.status === 'pending').length,
    [reports]
  );

  const visiblePins = useMemo(() => {
    if (statusFilter === 'all_approved') return mapEligibleReports;
    return mapEligibleReports.filter((r) => r.status === statusFilter);
  }, [mapEligibleReports, statusFilter]);

  const [selectedReportId, setSelectedReportId] = useState(
    () => mapEligibleReports[0]?.id || null
  );

  useEffect(() => {
    if (
      visiblePins.length > 0 &&
      !visiblePins.some((r) => r.id === selectedReportId)
    ) {
      setSelectedReportId(visiblePins[0].id);
    }
  }, [visiblePins, selectedReportId]);

  const selectedReport =
    visiblePins.find((r) => r.id === selectedReportId) ||
    mapEligibleReports[0] ||
    null;

  const counts = {
    approved: mapEligibleReports.filter((r) => r.status === 'approved').length,
    in_progress: mapEligibleReports.filter((r) => r.status === 'in_progress').length,
    resolved: mapEligibleReports.filter((r) => r.status === 'resolved').length,
  };

  return (
    <div className="space-y-6">
      {/* Top Status Filter & Map Gatekeeper Telemetry Bar */}
      <div className="bg-[#0E1726] wcag-border rounded-xl p-4 sm:p-5 flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        <div>
          <h2 className="text-h3 font-semibold text-[#FFFFFF] flex items-center gap-2">
            <Layers className="w-5 h-5 text-[#00F2FE]" aria-hidden="true" />
            <span>Malolos Approved Road Concerns GIS Map</span>
          </h2>
          <p className="text-caption text-[#CBD5E1] mt-1">
            Displaying <strong>{visiblePins.length}</strong> verified road concerns on the map.{' '}
            <span className="text-[#00F2FE] font-semibold">
              ({withheldPendingCount} pending submission{withheldPendingCount === 1 ? '' : 's'} withheld until Admin approval)
            </span>
          </p>
        </div>

        {/* Accessible Filter Buttons (44x44px min touch target) */}
        <div
          role="group"
          aria-label="Filter map pins by repair status"
          className="flex flex-wrap items-center gap-2.5"
        >
          <button
            type="button"
            onClick={() => setStatusFilter('all_approved')}
            className={`wcag-target px-3.5 py-2 rounded-lg text-caption font-bold wcag-border transition-colors ${
              statusFilter === 'all_approved'
                ? 'bg-[#A78BFA] text-[#050B16]'
                : 'bg-[#162032] text-[#FFFFFF] hover:text-[#00F2FE]'
            }`}
          >
            All Mapped ({mapEligibleReports.length})
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter('approved')}
            style={
              statusFilter === 'approved'
                ? {
                    backgroundColor: '#FEF3C7',
                    color: '#78350F',
                    borderColor: '#FBBF24',
                  }
                : undefined
            }
            className={`wcag-target px-3.5 py-2 rounded-lg text-caption font-bold wcag-border inline-flex items-center gap-1.5 transition-colors ${
              statusFilter === 'approved'
                ? ''
                : 'bg-[#162032] text-[#E2E8F0] hover:text-[#00F2FE]'
            }`}
          >
            <ShieldCheck className="w-4 h-4" aria-hidden="true" />
            <span>Approved / Pending Dispatch ({counts.approved})</span>
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter('in_progress')}
            style={
              statusFilter === 'in_progress'
                ? {
                    backgroundColor: '#E0F2FE',
                    color: '#075985',
                    borderColor: '#38BDF8',
                  }
                : undefined
            }
            className={`wcag-target px-3.5 py-2 rounded-lg text-caption font-bold wcag-border inline-flex items-center gap-1.5 transition-colors ${
              statusFilter === 'in_progress'
                ? ''
                : 'bg-[#162032] text-[#E2E8F0] hover:text-[#00F2FE]'
            }`}
          >
            <Wrench className="w-4 h-4" aria-hidden="true" />
            <span>Under Repair ({counts.in_progress})</span>
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter('resolved')}
            style={
              statusFilter === 'resolved'
                ? {
                    backgroundColor: '#D1FAE5',
                    color: '#064E3B',
                    borderColor: '#34D399',
                  }
                : undefined
            }
            className={`wcag-target px-3.5 py-2 rounded-lg text-caption font-bold wcag-border inline-flex items-center gap-1.5 transition-colors ${
              statusFilter === 'resolved'
                ? ''
                : 'bg-[#162032] text-[#E2E8F0] hover:text-[#00F2FE]'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
            <span>Resolved ({counts.resolved})</span>
          </button>
        </div>
      </div>

      {/* Map + Selected Pin Summary Card Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Interactive OpenStreetMap / Leaflet Container (7 cols) */}
        <div className="lg:col-span-7 bg-[#0E1726] wcag-border rounded-xl p-4 space-y-4">
          <LeafletMap
            mode="overview"
            lat={14.8515}
            lng={120.8165}
            zoom={14}
            reports={visiblePins}
            selectedReportId={selectedReport?.id}
            onSelectReport={(report) => setSelectedReportId(report.id)}
            heightClass="h-[480px]"
          />

          {/* Accessible Keyboard Pin Selector Strip */}
          <div>
            <span className="text-caption font-bold uppercase tracking-wider text-[#CBD5E1] block mb-2">
              Mapped Pins Quick Selector (Click a pin on map or select below):
            </span>
            <div className="flex flex-wrap gap-2">
              {visiblePins.map((pin) => {
                const isSelected = pin.id === selectedReport?.id;
                return (
                  <button
                    key={pin.id}
                    type="button"
                    onClick={() => setSelectedReportId(pin.id)}
                    className={`wcag-target px-3 py-2 rounded-lg text-caption font-mono font-bold wcag-border inline-flex items-center gap-2 transition-all ${
                      isSelected
                        ? 'bg-[#162032] text-[#00F2FE] ring-2 ring-[#00F2FE]'
                        : 'bg-[#050B16] text-[#E2E8F0] hover:bg-[#162032]'
                    }`}
                  >
                    <MapPin className="w-3.5 h-3.5 text-[#00F2FE]" aria-hidden="true" />
                    <span>{pin.id}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right: Pin Summary Card with Damage Photo & Repair State (5 cols) */}
        <div className="lg:col-span-5">
          {!selectedReport ? (
            <div className="bg-[#0E1726] wcag-border rounded-xl p-8 text-center h-full flex flex-col items-center justify-center">
              <EyeOff className="w-10 h-10 text-[#CBD5E1] mb-3" aria-hidden="true" />
              <h3 className="text-h3 font-semibold text-[#FFFFFF]">
                No Approved Pins Match Filter
              </h3>
              <p className="text-body text-[#E2E8F0] mt-1">
                Approve pending citizen reports in the Moderation Queue or switch the status filter above.
              </p>
            </div>
          ) : (
            <aside
              aria-label="Selected Map Pin Summary Card"
              className="bg-[#0E1726] wcag-border rounded-xl p-5 sm:p-6 space-y-5 h-full flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b-[1.5px] border-[#94A3B8]">
                  <span className="px-2.5 py-1 rounded bg-[#162032] text-[#00F2FE] font-mono text-caption font-bold wcag-border">
                    PIN SUMMARY • {selectedReport.id}
                  </span>
                  <SeverityBadge severity={selectedReport.severity} />
                </div>

                <div>
                  <h3 className="text-h2 font-semibold text-[#FFFFFF]">
                    {selectedReport.locationName}
                  </h3>
                  <div className="mt-2">
                    <StatusBadge status={selectedReport.status} />
                  </div>
                </div>

                {/* Damage Photo Preview inside Summary Card */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-caption text-[#CBD5E1]">
                    <span className="font-semibold text-[#00F2FE] flex items-center gap-1.5">
                      <Camera className="w-4 h-4" aria-hidden="true" />
                      <span>Citizen Damage Photo Evidence</span>
                    </span>
                    <span className="font-mono">
                      {Number(selectedReport.lat).toFixed(5)}°N,{' '}
                      {Number(selectedReport.lng).toFixed(5)}°E
                    </span>
                  </div>
                  <div className="rounded-lg overflow-hidden wcag-border bg-[#050B16]">
                    <img
                      src={selectedReport.citizenPhoto}
                      alt={`Road damage at ${selectedReport.locationName}`}
                      className="w-full h-52 object-cover block"
                    />
                  </div>
                </div>

                {/* Repair State & Field Metadata */}
                <div className="bg-[#162032] wcag-border rounded-lg p-4 space-y-2.5 text-caption">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[#CBD5E1] flex items-center gap-1.5">
                      <User className="w-4 h-4 text-[#00F2FE]" aria-hidden="true" />
                      Reported By:
                    </span>
                    <span className="font-semibold text-[#FFFFFF]">
                      {selectedReport.citizenName} ({selectedReport.contact})
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[#CBD5E1] flex items-center gap-1.5">
                      <Wrench className="w-4 h-4 text-[#00F2FE]" aria-hidden="true" />
                      Maintenance Crew:
                    </span>
                    <span className="font-semibold text-[#FFFFFF]">
                      {selectedReport.assignedTeam || 'Pending Crew Assignment'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[#CBD5E1] flex items-center gap-1.5">
                      <Calendar className="w-4 h-4 text-[#00F2FE]" aria-hidden="true" />
                      Submitted At:
                    </span>
                    <span className="text-[#E2E8F0]">{selectedReport.submittedAt}</span>
                  </div>

                  <p className="text-body text-[#E2E8F0] pt-2 border-t border-[#94A3B8]/40">
                    {selectedReport.description}
                  </p>
                </div>
              </div>

              {/* Pin Summary Card Action Buttons */}
              <div className="pt-4 border-t-[1.5px] border-[#94A3B8] grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => onOpenWorkOrder(selectedReport.id)}
                  className="wcag-target inline-flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-[#162032] hover:bg-[#00F2FE] text-[#00F2FE] hover:text-[#050B16] font-bold text-caption wcag-border transition-colors"
                >
                  <FileText className="w-4 h-4" aria-hidden="true" />
                  <span>Generate Work Order</span>
                </button>

                <button
                  type="button"
                  onClick={() => onOpenRepairTracking(selectedReport.id)}
                  className="wcag-target inline-flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-[#A78BFA] hover:bg-[#C4B5FD] text-[#050B16] font-bold text-caption wcag-border transition-colors"
                >
                  <ExternalLink className="w-4 h-4" aria-hidden="true" />
                  <span>Track / Verify Repair</span>
                </button>
              </div>
            </aside>
          )}
        </div>
      </div>
    </div>
  );
}
