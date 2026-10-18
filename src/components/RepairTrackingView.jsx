import React, { useState, useEffect } from 'react';
import {
  Wrench,
  CheckCircle2,
  Camera,
  BellRing,
  MapPin,
  User,
  Calendar,
  ShieldCheck,
  ArrowRight,
  FileText,
} from 'lucide-react';
import { StatusBadge, SeverityBadge } from './StatusBadge.jsx';

/**
 * Workflows 5 & 6: Repair Tracking & Verification + Resolution & Dual Notification
 * - Displays Citizen Submission Photo ("Before") alongside Maintenance Progress Photo ("During Repair")
 * - Previews Completed Road Photo ("After / Completed")
 * - Allows Admin to mark repair as "Resolved", triggering the mandatory high-contrast toast:
 *   "Road repair resolved. Citizen [User] and Admin have been notified."
 */
export default function RepairTrackingView({
  reports,
  initialSelectedId,
  onResolveReport,
  onStartRepair,
  onOpenWorkOrder,
}) {
  // Show approved, in_progress, and resolved concerns in Repair Tracking
  const trackableReports = reports.filter(
    (r) =>
      r.status === 'in_progress' ||
      r.status === 'approved' ||
      r.status === 'resolved'
  );

  const [filterTab, setFilterTab] = useState('all_trackable'); // 'all_trackable' | 'in_progress' | 'resolved'

  const filteredList = trackableReports.filter((r) => {
    if (filterTab === 'in_progress') return r.status === 'in_progress' || r.status === 'approved';
    if (filterTab === 'resolved') return r.status === 'resolved';
    return true;
  });

  const [selectedId, setSelectedId] = useState(() => {
    if (initialSelectedId && trackableReports.some((r) => r.id === initialSelectedId)) {
      return initialSelectedId;
    }
    const firstInProgress = trackableReports.find((r) => r.status === 'in_progress');
    return firstInProgress ? firstInProgress.id : trackableReports[0]?.id || null;
  });

  useEffect(() => {
    if (initialSelectedId && trackableReports.some((r) => r.id === initialSelectedId)) {
      setSelectedId(initialSelectedId);
    }
  }, [initialSelectedId]);

  const selectedReport =
    trackableReports.find((r) => r.id === selectedId) || filteredList[0] || null;

  const [verificationNote, setVerificationNote] = useState(
    'Hot-mix asphalt overlay compacted flush with adjacent lane. Surface integrity and drainage slope verified by Admin.'
  );

  const handleResolveSubmit = (e) => {
    e.preventDefault();
    if (!selectedReport) return;
    onResolveReport(selectedReport.id, verificationNote.trim());
  };

  const inProgressCount = trackableReports.filter(
    (r) => r.status === 'in_progress'
  ).length;
  const resolvedCount = trackableReports.filter(
    (r) => r.status === 'resolved'
  ).length;

  return (
    <div className="space-y-6">
      {/* Top Repair Progress Overview Banner */}
      <div className="bg-[#0E1726] wcag-border rounded-xl p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="w-11 h-11 rounded-lg bg-[#162032] wcag-border flex items-center justify-center text-[#00F2FE] shrink-0">
            <Wrench className="w-6 h-6" aria-hidden="true" />
          </div>
          <div>
            <h2 className="text-h3 font-semibold text-[#FFFFFF]">
              Repair Progress Tracking, Photo Verification &amp; Dual Notification
            </h2>
            <p className="text-caption text-[#CBD5E1] mt-0.5">
              Compare the citizen&apos;s <strong className="text-[#FFFFFF]">&ldquo;Before&rdquo;</strong> submission photo against the maintenance crew&apos;s{' '}
              <strong className="text-[#FFFFFF]">&ldquo;During Repair&rdquo;</strong> and{' '}
              <strong className="text-[#00F2FE]">&ldquo;Completed&rdquo;</strong> photos before marking the concern as Resolved.
            </p>
          </div>
        </div>

        <div
          role="group"
          aria-label="Filter repair tracking items"
          className="flex flex-wrap items-center gap-2"
        >
          <button
            type="button"
            onClick={() => setFilterTab('all_trackable')}
            className={`wcag-target px-3.5 py-2 rounded-lg text-caption font-bold wcag-border transition-colors ${
              filterTab === 'all_trackable'
                ? 'bg-[#A78BFA] text-[#050B16]'
                : 'bg-[#162032] text-[#E2E8F0] hover:text-[#00F2FE]'
            }`}
          >
            All Active &amp; Resolved ({trackableReports.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterTab('in_progress')}
            className={`wcag-target px-3.5 py-2 rounded-lg text-caption font-bold wcag-border transition-colors ${
              filterTab === 'in_progress'
                ? 'bg-[#A78BFA] text-[#050B16]'
                : 'bg-[#162032] text-[#E2E8F0] hover:text-[#00F2FE]'
            }`}
          >
            Under Repair ({inProgressCount})
          </button>
          <button
            type="button"
            onClick={() => setFilterTab('resolved')}
            className={`wcag-target px-3.5 py-2 rounded-lg text-caption font-bold wcag-border transition-colors ${
              filterTab === 'resolved'
                ? 'bg-[#A78BFA] text-[#050B16]'
                : 'bg-[#162032] text-[#E2E8F0] hover:text-[#00F2FE]'
            }`}
          >
            Resolved ({resolvedCount})
          </button>
        </div>
      </div>

      {/* Main Split View: Left Queue + Right Visual Verification & Resolution */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left List of Tracked Repairs (4 cols) */}
        <section
          aria-label="Repair Tracking List"
          className="lg:col-span-4 bg-[#0E1726] wcag-border rounded-xl p-4 space-y-3 h-fit"
        >
          <h3 className="text-h3 font-semibold text-[#FFFFFF] pb-3 border-b-[1.5px] border-[#94A3B8]">
            Tracked Work Orders ({filteredList.length})
          </h3>

          {filteredList.length === 0 ? (
            <div className="p-6 text-center bg-[#162032] rounded-lg wcag-border">
              <p className="text-body text-[#E2E8F0]">
                No road concerns match the selected repair filter.
              </p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[680px] overflow-y-auto pr-1">
              {filteredList.map((item) => {
                const isSelected = selectedReport?.id === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setSelectedId(item.id)}
                    className={`w-full text-left p-3.5 rounded-lg wcag-border transition-all block ${
                      isSelected
                        ? 'bg-[#162032] ring-2 ring-[#00F2FE]'
                        : 'bg-[#050B16] hover:bg-[#162032]/70'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <span className="font-mono text-caption font-bold text-[#00F2FE]">
                        {item.id}
                      </span>
                      <SeverityBadge severity={item.severity} />
                    </div>

                    <p className="text-body font-semibold text-[#FFFFFF] line-clamp-2">
                      {item.locationName}
                    </p>

                    <p className="text-caption text-[#CBD5E1] mt-1">
                      Crew: <strong className="text-[#E2E8F0]">{item.assignedTeam}</strong>
                    </p>

                    <div className="mt-2.5 pt-2.5 border-t border-[#94A3B8]/40 flex items-center justify-between gap-2">
                      <StatusBadge status={item.status} size="sm" />
                      <span className="text-caption text-[#CBD5E1]">
                        Citizen: {item.citizenName}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </section>

        {/* Right Side-by-Side Photo Verification & Resolution Panel (8 cols) */}
        <section
          aria-label="Repair Photo Comparison and Resolution Controls"
          className="lg:col-span-8 space-y-6"
        >
          {!selectedReport ? (
            <div className="bg-[#0E1726] wcag-border rounded-xl p-10 text-center">
              <p className="text-h3 text-[#E2E8F0]">
                Select a road concern on the left to inspect repair progress and verify resolution.
              </p>
            </div>
          ) : (
            <div className="bg-[#0E1726] wcag-border rounded-xl p-5 sm:p-6 space-y-6">
              {/* Header */}
              <div className="flex flex-wrap items-start justify-between gap-4 pb-4 border-b-[1.5px] border-[#94A3B8]">
                <div>
                  <div className="flex flex-wrap items-center gap-2.5 mb-2">
                    <span className="px-2.5 py-1 rounded bg-[#162032] text-[#00F2FE] font-mono text-caption font-bold wcag-border">
                      {selectedReport.id}
                    </span>
                    <StatusBadge status={selectedReport.status} />
                    <SeverityBadge severity={selectedReport.severity} />
                  </div>
                  <h3 className="text-h2 font-semibold text-[#FFFFFF]">
                    {selectedReport.locationName}
                  </h3>
                  <p className="text-caption text-[#CBD5E1] mt-1 font-mono">
                    Verified Pin: {Number(selectedReport.lat).toFixed(5)}° N,{' '}
                    {Number(selectedReport.lng).toFixed(5)}° E • Citizen Reporter:{' '}
                    <strong className="text-[#FFFFFF]">{selectedReport.citizenName}</strong> (
                    {selectedReport.contact})
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => onOpenWorkOrder(selectedReport.id)}
                  className="wcag-target inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-[#162032] hover:bg-[#00F2FE] text-[#00F2FE] hover:text-[#050B16] text-caption font-bold wcag-border transition-colors"
                >
                  <FileText className="w-4 h-4" aria-hidden="true" />
                  <span>View Printable Work Order</span>
                </button>
              </div>

              {/* Workflow 5: Side-by-Side "Before" (Citizen) vs. "During Repair" (Maintenance) Photos */}
              <div>
                <h4 className="text-h3 font-semibold text-[#FFFFFF] mb-3 flex items-center gap-2">
                  <Camera className="w-5 h-5 text-[#00F2FE]" aria-hidden="true" />
                  <span>
                    Stage 1 &amp; 2 Comparison: Citizen Submission (&ldquo;Before&rdquo;) vs. Maintenance Progress (&ldquo;During Repair&rdquo;)
                  </span>
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* Card 1: Citizen Submission Photo ("Before") */}
                  <div className="bg-[#162032] wcag-border rounded-xl p-4 space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <span
                        style={{
                          backgroundColor: '#FEE2E2',
                          color: '#7F1D1D',
                          borderColor: '#F87171',
                          borderWidth: '1.5px',
                          borderStyle: 'solid',
                        }}
                        className="px-2.5 py-1 rounded text-caption font-bold uppercase"
                      >
                        1. BEFORE • Citizen Submission
                      </span>
                      <span className="text-caption text-[#CBD5E1]">
                        {selectedReport.submittedAt}
                      </span>
                    </div>

                    <div className="rounded-lg overflow-hidden wcag-border bg-[#050B16]">
                      <img
                        src={selectedReport.citizenPhoto}
                        alt={`Before repair citizen submission for ${selectedReport.id}`}
                        className="w-full h-52 object-cover block"
                      />
                    </div>

                    <p className="text-caption text-[#E2E8F0]">
                      <strong className="text-[#FFFFFF]">Reported By {selectedReport.citizenName}:</strong>{' '}
                      {selectedReport.description}
                    </p>
                  </div>

                  {/* Card 2: Maintenance Progress Photo ("During Repair") */}
                  <div className="bg-[#162032] wcag-border rounded-xl p-4 space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <span
                        style={{
                          backgroundColor: '#E0F2FE',
                          color: '#075985',
                          borderColor: '#38BDF8',
                          borderWidth: '1.5px',
                          borderStyle: 'solid',
                        }}
                        className="px-2.5 py-1 rounded text-caption font-bold uppercase"
                      >
                        2. DURING REPAIR • Field Crew Log
                      </span>
                      <span className="text-caption text-[#CBD5E1]">
                        {selectedReport.assignedTeam}
                      </span>
                    </div>

                    <div className="rounded-lg overflow-hidden wcag-border bg-[#050B16]">
                      <img
                        src={selectedReport.repairPhoto}
                        alt={`During repair maintenance progress for ${selectedReport.id}`}
                        className="w-full h-52 object-cover block"
                      />
                    </div>

                    <p className="text-caption text-[#E2E8F0]">
                      <strong className="text-[#FFFFFF]">Field Directive:</strong>{' '}
                      {selectedReport.instructions}
                    </p>
                  </div>
                </div>
              </div>

              {/* Workflow 6: Resolution & Dual Notification Panel with "Completed" Photo Preview */}
              <div className="bg-[#162032] wcag-border rounded-xl p-5 space-y-5">
                <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#94A3B8]/50">
                  <div className="flex items-center gap-2.5">
                    <BellRing className="w-5 h-5 text-[#00F2FE]" aria-hidden="true" />
                    <div>
                      <h4 className="text-h3 font-semibold text-[#FFFFFF]">
                        Stage 3: Final Completion Photo Preview &amp; Dual Notification Resolution
                      </h4>
                      <p className="text-caption text-[#CBD5E1]">
                        Inspect the completed asphalt restoration photo below. Marking as Resolved automatically notifies both{' '}
                        <strong className="text-[#FFFFFF]">Citizen {selectedReport.citizenName}</strong> and{' '}
                        <strong className="text-[#FFFFFF]">Admin</strong>.
                      </p>
                    </div>
                  </div>

                  <span
                    style={{
                      backgroundColor: '#D1FAE5',
                      color: '#064E3B',
                      borderColor: '#34D399',
                      borderWidth: '1.5px',
                      borderStyle: 'solid',
                    }}
                    className="px-3 py-1 rounded-md text-caption font-bold uppercase"
                  >
                    3. AFTER • Completed Photo Preview
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
                  {/* Completed Photo Preview */}
                  <div className="md:col-span-6">
                    <div className="rounded-lg overflow-hidden wcag-border bg-[#050B16]">
                      <img
                        src={selectedReport.completedPhoto}
                        alt={`Completed road repair verification preview for ${selectedReport.id}`}
                        className="w-full h-52 object-cover block"
                      />
                    </div>
                  </div>

                  {/* Resolution Form or Resolved Audit Confirmation */}
                  <div className="md:col-span-6 space-y-4">
                    {selectedReport.status === 'resolved' ? (
                      <div className="bg-[#0E1726] wcag-border rounded-xl p-4 space-y-3">
                        <div className="flex items-center gap-2 text-[#00F2FE] font-bold text-body">
                          <CheckCircle2 className="w-5 h-5 shrink-0" aria-hidden="true" />
                          <span>Repair Verified &amp; Marked Resolved</span>
                        </div>
                        <p className="text-body text-[#FFFFFF] font-semibold">
                          &ldquo;Road repair resolved. Citizen {selectedReport.citizenName} and Admin have been notified.&rdquo;
                        </p>
                        <p className="text-caption text-[#CBD5E1]">
                          Resolved Timestamp: {selectedReport.resolvedAt || 'Verified Today'}
                        </p>
                        {selectedReport.verificationNote && (
                          <p className="text-caption text-[#E2E8F0] pt-2 border-t border-[#94A3B8]/40">
                            <strong>Admin QA Note:</strong> {selectedReport.verificationNote}
                          </p>
                        )}
                        <button
                          type="button"
                          onClick={handleResolveSubmit}
                          className="wcag-target w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[#162032] hover:bg-[#A78BFA] text-[#00F2FE] hover:text-[#050B16] font-bold text-caption wcag-border transition-colors"
                        >
                          <BellRing className="w-4 h-4" aria-hidden="true" />
                          <span>Re-send Dual Citizen &amp; Admin Notification</span>
                        </button>
                      </div>
                    ) : (
                      <form onSubmit={handleResolveSubmit} className="space-y-4">
                        {selectedReport.status === 'approved' && (
                          <div className="p-3 rounded-lg bg-[#0E1726] wcag-border flex items-center justify-between gap-2">
                            <span className="text-caption text-[#E2E8F0]">
                              Currently staged for dispatch.
                            </span>
                            <button
                              type="button"
                              onClick={() => onStartRepair(selectedReport.id)}
                              className="wcag-target px-3 py-1.5 rounded-md bg-[#162032] text-[#00F2FE] font-bold text-caption wcag-border"
                            >
                              Set Status: In Progress
                            </button>
                          </div>
                        )}

                        <div>
                          <label
                            htmlFor="qa-verification-note"
                            className="block text-caption font-semibold text-[#FFFFFF] mb-1.5"
                          >
                            Admin Final Quality Assurance Note
                          </label>
                          <textarea
                            id="qa-verification-note"
                            rows={3}
                            value={verificationNote}
                            onChange={(e) => setVerificationNote(e.target.value)}
                            className="w-full p-3 rounded-lg bg-[#0E1726] text-[#FFFFFF] text-caption wcag-border"
                          />
                        </div>

                        <button
                          type="submit"
                          className="wcag-target w-full py-3.5 px-5 rounded-lg bg-[#A78BFA] hover:bg-[#C4B5FD] text-[#050B16] font-bold text-body wcag-border flex items-center justify-center gap-2.5 transition-colors shadow-lg"
                        >
                          <CheckCircle2 className="w-5 h-5" aria-hidden="true" strokeWidth={2.5} />
                          <span>
                            Mark as &ldquo;Resolved&rdquo; &amp; Notify {selectedReport.citizenName}
                          </span>
                        </button>
                      </form>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
