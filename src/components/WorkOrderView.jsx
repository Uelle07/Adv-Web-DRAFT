import React, { useState, useEffect } from 'react';
import {
  FileText,
  Printer,
  Wrench,
  MapPin,
  CheckCircle2,
  User,
  Calendar,
  ShieldCheck,
  Send,
  ClipboardList,
} from 'lucide-react';
import { StatusBadge, SeverityBadge } from './StatusBadge.jsx';
import { MAINTENANCE_TEAMS } from '../data/mockReports.js';

/**
 * Workflow 4: Maintenance Work Order & Dispatch Report
 * - Generates a clean, printable Work Order Report for maintenance personnel
 * - Includes Report ID, GPS Pin coordinates & visual pin grid, location, citizen photo, and instructions
 * - Supports updating instructions/team, dispatching crew, and printing via window.print()
 */
export default function WorkOrderView({
  reports,
  initialSelectedId,
  onDispatchWorkOrder,
}) {
  // Prioritize approved and in_progress concerns, but allow generating a work order for any non-rejected report
  const eligibleReports = reports.filter((r) => r.status !== 'rejected');

  const [selectedId, setSelectedId] = useState(() => {
    if (initialSelectedId && eligibleReports.some((r) => r.id === initialSelectedId)) {
      return initialSelectedId;
    }
    const firstApproved = eligibleReports.find(
      (r) => r.status === 'approved' || r.status === 'in_progress'
    );
    return firstApproved ? firstApproved.id : eligibleReports[0]?.id || null;
  });

  useEffect(() => {
    if (initialSelectedId && eligibleReports.some((r) => r.id === initialSelectedId)) {
      setSelectedId(initialSelectedId);
    }
  }, [initialSelectedId]);

  const selectedReport =
    eligibleReports.find((r) => r.id === selectedId) || eligibleReports[0] || null;

  const [assignedTeam, setAssignedTeam] = useState(MAINTENANCE_TEAMS[0]);
  const [instructions, setInstructions] = useState('');

  useEffect(() => {
    if (selectedReport) {
      setAssignedTeam(
        selectedReport.assignedTeam && selectedReport.assignedTeam !== 'Unassigned'
          ? selectedReport.assignedTeam
          : MAINTENANCE_TEAMS[0]
      );
      setInstructions(
        selectedReport.instructions ||
          '1. Set up DPWH high-visibility safety cones 30m upstream.\n2. Saw-cut damaged asphalt perimeter to sound pavement.\n3. Dewater & compact aggregate base course.\n4. Apply SS-1 tack coat and compact hot-mix asphalt overlay flush with existing lane.'
      );
    }
  }, [selectedReport?.id]);

  const handleDispatchSave = (e) => {
    e.preventDefault();
    if (!selectedReport) return;
    onDispatchWorkOrder(selectedReport.id, {
      assignedTeam,
      instructions: instructions.trim(),
    });
  };

  const handlePrint = () => {
    window.print();
  };

  const workOrderNumber = selectedReport
    ? `WO-${selectedReport.id.replace('RPT-', '')}`
    : 'WO-2026-0000';

  return (
    <div className="space-y-6">
      {/* Top Action & Selector Header (Hidden during print) */}
      <div className="bg-[#0E1726] wcag-border rounded-xl p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 no-print">
        <div className="flex items-start gap-3.5">
          <div className="w-11 h-11 rounded-lg bg-[#162032] wcag-border flex items-center justify-center text-[#00F2FE] shrink-0">
            <ClipboardList className="w-6 h-6" aria-hidden="true" />
          </div>
          <div>
            <h2 className="text-h3 font-semibold text-[#FFFFFF]">
              Maintenance Work Order &amp; Field Dispatch Generator
            </h2>
            <p className="text-caption text-[#CBD5E1] mt-0.5">
              Configure engineering repair instructions, assign a Malolos maintenance unit, and print the official field work order sheet.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <label htmlFor="wo-report-select" className="text-caption font-semibold text-[#E2E8F0]">
            Select Report:
          </label>
          <select
            id="wo-report-select"
            value={selectedReport?.id || ''}
            onChange={(e) => setSelectedId(e.target.value)}
            className="wcag-target px-3.5 py-2 rounded-lg bg-[#162032] text-[#FFFFFF] text-caption font-semibold wcag-border"
          >
            {eligibleReports.map((r) => (
              <option key={r.id} value={r.id}>
                {r.id} — {r.locationName.slice(0, 42)}... ({r.status.toUpperCase()})
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={handlePrint}
            className="wcag-target inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#A78BFA] hover:bg-[#C4B5FD] text-[#050B16] font-bold text-caption wcag-border transition-colors shadow-md"
          >
            <Printer className="w-4 h-4" aria-hidden="true" strokeWidth={2.5} />
            <span>Print Work Order Report</span>
          </button>
        </div>
      </div>

      {!selectedReport ? (
        <div className="bg-[#0E1726] wcag-border rounded-xl p-10 text-center">
          <p className="text-h3 text-[#E2E8F0]">No road concerns available for work order generation.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Dispatch Configuration Form (4 cols, hidden when printing) */}
          <section
            aria-label="Work Order Configuration Controls"
            className="lg:col-span-4 bg-[#0E1726] wcag-border rounded-xl p-5 space-y-5 h-fit no-print"
          >
            <h3 className="text-h3 font-semibold text-[#FFFFFF] pb-3 border-b-[1.5px] border-[#94A3B8]">
              Dispatch Parameters
            </h3>

            <form onSubmit={handleDispatchSave} className="space-y-4">
              <div>
                <label
                  htmlFor="wo-team-select"
                  className="block text-caption font-semibold text-[#E2E8F0] mb-1.5"
                >
                  Assigned Field Maintenance Crew
                </label>
                <select
                  id="wo-team-select"
                  value={assignedTeam}
                  onChange={(e) => setAssignedTeam(e.target.value)}
                  className="wcag-target w-full px-3.5 py-2.5 rounded-lg bg-[#162032] text-[#FFFFFF] text-body wcag-border"
                >
                  {MAINTENANCE_TEAMS.map((team) => (
                    <option key={team} value={team}>
                      {team}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="wo-instructions-textarea"
                  className="block text-caption font-semibold text-[#E2E8F0] mb-1.5"
                >
                  Technical Repair &amp; Safety Instructions
                </label>
                <textarea
                  id="wo-instructions-textarea"
                  rows={5}
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  className="w-full p-3.5 rounded-lg bg-[#162032] text-[#FFFFFF] text-body wcag-border"
                />
              </div>

              <div className="pt-2 space-y-3">
                <button
                  type="submit"
                  className="wcag-target w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-[#162032] hover:bg-[#00F2FE] text-[#00F2FE] hover:text-[#050B16] font-bold text-caption wcag-border transition-colors"
                >
                  <Send className="w-4 h-4" aria-hidden="true" />
                  <span>
                    {selectedReport.status === 'in_progress'
                      ? 'Update Active Dispatch Order'
                      : 'Dispatch Crew & Set Status: In Progress'}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={handlePrint}
                  className="wcag-target w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-[#A78BFA] hover:bg-[#C4B5FD] text-[#050B16] font-bold text-caption wcag-border transition-colors"
                >
                  <Printer className="w-4 h-4" aria-hidden="true" />
                  <span>Print Official Dispatch Sheet</span>
                </button>
              </div>
            </form>
          </section>

          {/* Right Column: Printable Official Work Order Sheet (8 cols) */}
          <section
            aria-label="Printable Maintenance Work Order Report"
            className="lg:col-span-8 bg-[#0E1726] wcag-border rounded-xl p-6 sm:p-8 space-y-6 print-work-order"
          >
            {/* Document Control Header */}
            <div className="flex flex-wrap items-start justify-between gap-4 pb-5 border-b-2 border-[#94A3B8]">
              <div>
                <span className="text-caption font-bold uppercase tracking-widest text-[#00F2FE] block">
                  SPACE CORPORATE SYSTEMS • PUBLIC WORKS DISPATCH DIVISION
                </span>
                <h3 className="text-h2 font-semibold text-[#FFFFFF] mt-1">
                  MAINTENANCE WORK ORDER &amp; DISPATCH REPORT
                </h3>
                <p className="text-caption text-[#CBD5E1] mt-1">
                  City of Malolos Road Infrastructure &amp; Pothole Remediation Directive
                </p>
              </div>

              <div className="bg-[#162032] wcag-border rounded-lg p-3 text-right font-mono">
                <div className="text-caption text-[#CBD5E1]">WORK ORDER NO.</div>
                <div className="text-h3 font-bold text-[#00F2FE]">{workOrderNumber}</div>
                <div className="text-caption text-[#E2E8F0] mt-0.5">
                  REF: {selectedReport.id}
                </div>
              </div>
            </div>

            {/* Key Dispatch Metadata Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
              <div className="bg-[#162032] wcag-border rounded-lg p-3.5">
                <span className="text-caption text-[#CBD5E1] block">Report ID</span>
                <span className="text-body font-mono font-bold text-[#FFFFFF] mt-0.5 block">
                  {selectedReport.id}
                </span>
              </div>

              <div className="bg-[#162032] wcag-border rounded-lg p-3.5">
                <span className="text-caption text-[#CBD5E1] block">Verified GPS Pin</span>
                <span className="text-body font-mono font-bold text-[#00F2FE] mt-0.5 block">
                  {Number(selectedReport.lat).toFixed(5)}°N, {Number(selectedReport.lng).toFixed(5)}°E
                </span>
              </div>

              <div className="bg-[#162032] wcag-border rounded-lg p-3.5">
                <span className="text-caption text-[#CBD5E1] block mb-1">Hazard Severity</span>
                <SeverityBadge severity={selectedReport.severity} />
              </div>

              <div className="bg-[#162032] wcag-border rounded-lg p-3.5">
                <span className="text-caption text-[#CBD5E1] block mb-1">Current Status</span>
                <StatusBadge status={selectedReport.status} size="sm" />
              </div>
            </div>

            {/* Location & Assigned Maintenance Unit Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-[#162032] wcag-border rounded-lg p-4">
              <div>
                <span className="text-caption font-bold uppercase tracking-wider text-[#00F2FE] flex items-center gap-1.5">
                  <MapPin className="w-4 h-4" aria-hidden="true" />
                  <span>Target Roadway Location</span>
                </span>
                <p className="text-body font-semibold text-[#FFFFFF] mt-1">
                  {selectedReport.locationName}
                </p>
                <p className="text-caption text-[#CBD5E1] mt-1 font-mono">
                  Sector: Malolos Urban Corridor • Grid ({Number(selectedReport.lat).toFixed(4)},{' '}
                  {Number(selectedReport.lng).toFixed(4)})
                </p>
              </div>

              <div>
                <span className="text-caption font-bold uppercase tracking-wider text-[#00F2FE] flex items-center gap-1.5">
                  <Wrench className="w-4 h-4" aria-hidden="true" />
                  <span>Dispatched Maintenance Unit</span>
                </span>
                <p className="text-body font-semibold text-[#FFFFFF] mt-1">
                  {assignedTeam}
                </p>
                <p className="text-caption text-[#CBD5E1] mt-1">
                  Citizen Reporter: {selectedReport.citizenName} ({selectedReport.contact}) • Logged{' '}
                  {selectedReport.submittedAt}
                </p>
              </div>
            </div>

            {/* Citizen Photo Evidence & Printable GPS Pin Target Map Diagram */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
              <div className="md:col-span-7 space-y-2">
                <span className="text-caption font-bold uppercase tracking-wider text-[#00F2FE] block">
                  Attached Citizen Damage Photo (Field Reference)
                </span>
                <div className="rounded-lg overflow-hidden wcag-border bg-[#050B16]">
                  <img
                    src={selectedReport.citizenPhoto}
                    alt={`Work order reference photo for ${selectedReport.id}`}
                    className="w-full h-56 object-cover block"
                  />
                </div>
              </div>

              {/* Printable Vector GPS Pin Target Card */}
              <div className="md:col-span-5 space-y-2 flex flex-col">
                <span className="text-caption font-bold uppercase tracking-wider text-[#00F2FE] block">
                  Verified GPS Pin Radar &amp; Coordinates
                </span>
                <div className="flex-1 rounded-lg wcag-border bg-[#050B16] p-4 flex flex-col items-center justify-center text-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 220 140"
                    className="w-full max-w-[220px] h-32"
                    aria-label="Printable GPS Coordinate Target Schematic"
                  >
                    <rect width="220" height="140" rx="8" fill="#0E1726" stroke="#94A3B8" strokeWidth="1.5" />
                    <line x1="0" y1="35" x2="220" y2="35" stroke="#1E293B" strokeWidth="1" />
                    <line x1="0" y1="70" x2="220" y2="70" stroke="#334155" strokeWidth="1.5" strokeDasharray="4 4" />
                    <line x1="0" y1="105" x2="220" y2="105" stroke="#1E293B" strokeWidth="1" />
                    <line x1="55" y1="0" x2="55" y2="140" stroke="#1E293B" strokeWidth="1" />
                    <line x1="110" y1="0" x2="110" y2="140" stroke="#334155" strokeWidth="1.5" strokeDasharray="4 4" />
                    <line x1="165" y1="0" x2="165" y2="140" stroke="#1E293B" strokeWidth="1" />
                    <circle cx="110" cy="70" r="34" fill="none" stroke="#00F2FE" strokeWidth="1.5" strokeDasharray="5 4" />
                    <path
                      d="M110 38c-9 0-16 7-16 16 0 11 16 26 16 26s16-15 16-26c0-9-7-16-16-16z"
                      fill="#A78BFA"
                      stroke="#FFFFFF"
                      strokeWidth="2"
                    />
                    <circle cx="110" cy="54" r="5" fill="#050B16" />
                  </svg>
                  <div className="mt-2 font-mono text-caption font-bold text-[#00F2FE]">
                    LAT: {Number(selectedReport.lat).toFixed(5)}° N
                  </div>
                  <div className="font-mono text-caption font-bold text-[#00F2FE]">
                    LNG: {Number(selectedReport.lng).toFixed(5)}° E
                  </div>
                </div>
              </div>
            </div>

            {/* Engineering Instructions & Field Scope */}
            <div className="bg-[#162032] wcag-border rounded-lg p-4 space-y-2">
              <span className="text-caption font-bold uppercase tracking-wider text-[#00F2FE] block">
                Admin Engineering Instructions &amp; Remediation Scope
              </span>
              <p className="text-body text-[#FFFFFF] whitespace-pre-line leading-relaxed">
                {instructions}
              </p>
              <p className="text-caption text-[#CBD5E1] pt-2 border-t border-[#94A3B8]/40">
                <strong>Citizen Reported Condition:</strong> {selectedReport.description}
              </p>
            </div>

            {/* Official Sign-Off Verification Footer */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t-[1.5px] border-[#94A3B8] text-caption">
              <div className="p-3.5 rounded-lg bg-[#162032] wcag-border">
                <span className="text-[#CBD5E1] block">Authorized &amp; Dispatched By (Admin):</span>
                <span className="text-body font-bold text-[#FFFFFF] mt-2 block">
                  Engr. Admin Moderator (admin@space.coop)
                </span>
                <span className="text-[#00F2FE] font-mono mt-1 block">
                  Digital Stamp: VERIFIED-GPS-ADMIN
                </span>
              </div>

              <div className="p-3.5 rounded-lg bg-[#162032] wcag-border">
                <span className="text-[#CBD5E1] block">
                  Field Crew Supervisor Sign-Off &amp; Completion Time:
                </span>
                <div className="mt-5 border-b border-[#94A3B8] pb-1 text-[#CBD5E1] font-mono">
                  Signature / Badge ID: _______________________
                </div>
              </div>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
