import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  ShieldAlert,
  CheckCircle2,
  XCircle,
  Wrench,
  MapPin,
  Calendar,
  User,
  Phone,
  Crosshair,
  RotateCcw,
  PlusCircle,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  FileText,
  Play,
  Pause,
  Filter,
  ChevronDown,
  Search,
  X,
  SlidersHorizontal,
} from 'lucide-react';
import LeafletMap from './LeafletMap.jsx';
import { StatusBadge, SeverityBadge } from './StatusBadge.jsx';
import { MAINTENANCE_TEAMS } from '../data/mockReports.js';

/**
 * Moderation Queue Item Card Component
 */
function QueueReportCard({ report, isSelected, onSelect, isClone = false }) {
  return (
    <button
      key={isClone ? `clone-${report.id}` : report.id}
      type="button"
      tabIndex={isClone ? -1 : 0}
      onClick={() => onSelect(report.id)}
      className={`w-full text-left p-3.5 rounded-lg transition-all wcag-border block ${
        isSelected
          ? 'bg-[#162032] ring-2 ring-[#00F2FE]'
          : 'bg-[#050B16] hover:bg-[#162032]/70'
      }`}
    >
      <div className="flex items-center justify-between gap-2 mb-2">
        <span className="font-mono text-caption font-bold text-[#00F2FE]">
          {report.id}
        </span>
        <SeverityBadge severity={report.severity} />
      </div>

      <p className="text-body font-semibold text-[#FFFFFF] line-clamp-2">
        {report.locationName}
      </p>

      <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-caption text-[#CBD5E1]">
        <span>By: {report.citizenName}</span>
        <span className="font-mono">
          {Number(report.lat).toFixed(4)}°N, {Number(report.lng).toFixed(4)}°E
        </span>
      </div>

      <div className="mt-2.5 pt-2.5 border-t border-[#94A3B8]/40 flex items-center justify-between gap-2">
        <StatusBadge status={report.status} size="sm" />
        <span className="text-caption text-[#CBD5E1]">
          {report.submittedAt}
        </span>
      </div>
    </button>
  );
}

/**
 * Workflow 2: Citizen Road Concern Triage (Moderation Queue)
 * - Displays pending citizen submissions (photo, GPS Lat/Lng, location text, timestamp).
 * - Enforces Approval Rule: Pending reports DO NOT appear on the Interactive Map until approved.
 * - Provides interactive GPS pin calibration (map drag/click + numeric input + keyboard nudge).
 * - Supports Approve (pins to map), Reject (with reason), and Assign to Maintenance.
 */
export default function TriageQueueView({
  reports,
  onApproveReport,
  onRejectReport,
  onAssignMaintenance,
  onSimulateNewReport,
  onOpenWorkOrder,
}) {
  // Comprehensive Queue Filter States
  const [filterStatus, setFilterStatus] = useState('pending'); // 'all' | 'pending' | 'approved' | 'in_progress' | 'resolved' | 'rejected'
  const [filterSeverity, setFilterSeverity] = useState('all'); // 'all' | 'Critical' | 'High' | 'Medium' | 'Low'
  const [filterAssignment, setFilterAssignment] = useState('all'); // 'all' | 'unassigned' | 'assigned'
  const [searchQuery, setSearchQuery] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const filterDropdownRef = useRef(null);

  // Close filter dropdown on click outside or Escape
  useEffect(() => {
    if (!isFilterOpen) return;
    const handleClickOutside = (e) => {
      if (filterDropdownRef.current && !filterDropdownRef.current.contains(e.target)) {
        setIsFilterOpen(false);
      }
    };
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setIsFilterOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isFilterOpen]);

  // Filtered reports computation
  const filteredReports = useMemo(() => {
    return reports.filter((r) => {
      if (filterStatus !== 'all' && r.status !== filterStatus) return false;
      if (filterSeverity !== 'all' && r.severity !== filterSeverity) return false;
      if (filterAssignment === 'unassigned') {
        if (r.assignedTeam && r.assignedTeam !== 'Unassigned') return false;
      } else if (filterAssignment === 'assigned') {
        if (!r.assignedTeam || r.assignedTeam === 'Unassigned') return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchId = r.id.toLowerCase().includes(q);
        const matchLoc = r.locationName.toLowerCase().includes(q);
        const matchCit = r.citizenName.toLowerCase().includes(q);
        if (!matchId && !matchLoc && !matchCit) return false;
      }
      return true;
    });
  }, [reports, filterStatus, filterSeverity, filterAssignment, searchQuery]);

  // Filter Option Counts
  const statusCounts = useMemo(() => ({
    all: reports.length,
    pending: reports.filter((r) => r.status === 'pending').length,
    approved: reports.filter((r) => r.status === 'approved').length,
    in_progress: reports.filter((r) => r.status === 'in_progress').length,
    resolved: reports.filter((r) => r.status === 'resolved').length,
    rejected: reports.filter((r) => r.status === 'rejected').length,
  }), [reports]);

  const severityCounts = useMemo(() => ({
    all: reports.length,
    Critical: reports.filter((r) => r.severity === 'Critical').length,
    High: reports.filter((r) => r.severity === 'High').length,
    Medium: reports.filter((r) => r.severity === 'Medium').length,
    Low: reports.filter((r) => r.severity === 'Low').length,
  }), [reports]);

  const assignmentCounts = useMemo(() => ({
    all: reports.length,
    unassigned: reports.filter((r) => !r.assignedTeam || r.assignedTeam === 'Unassigned').length,
    assigned: reports.filter((r) => r.assignedTeam && r.assignedTeam !== 'Unassigned').length,
  }), [reports]);

  const isCustomFiltered =
    filterStatus !== 'all' ||
    filterSeverity !== 'all' ||
    filterAssignment !== 'all' ||
    Boolean(searchQuery.trim());

  const resetFilters = () => {
    setFilterStatus('all');
    setFilterSeverity('all');
    setFilterAssignment('all');
    setSearchQuery('');
  };

  const [selectedId, setSelectedId] = useState(() => {
    const firstPending = reports.find((r) => r.status === 'pending');
    return firstPending ? firstPending.id : reports[0]?.id || null;
  });

  const selectedReport =
    filteredReports.find((r) => r.id === selectedId) || filteredReports[0] || null;

  // Vertical Marquee Auto-Scroll State & Refs
  const queueContainerRef = useRef(null);
  const firstSetRef = useRef(null);
  const scrollAccRef = useRef(0);
  const isHoveredRef = useRef(false);
  const [isMarqueeActive, setIsMarqueeActive] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Sync scroll position when user manually scrolls
  const handleContainerScroll = () => {
    if (isHoveredRef.current || !isMarqueeActive) {
      if (queueContainerRef.current) {
        scrollAccRef.current = queueContainerRef.current.scrollTop;
      }
    }
  };

  // High-precision, subpixel-safe marquee animation loop with seamless looping
  useEffect(() => {
    if (!isMarqueeActive) return;
    const container = queueContainerRef.current;
    if (!container) return;

    scrollAccRef.current = container.scrollTop;

    let animationFrameId;
    let lastTimestamp = performance.now();
    const scrollSpeed = 35; // Pixels per second

    const step = (now) => {
      const elapsed = Math.min((now - lastTimestamp) / 1000, 0.1);
      lastTimestamp = now;

      if (!isHoveredRef.current && container) {
        scrollAccRef.current += scrollSpeed * elapsed;

        const singleHeight = firstSetRef.current ? firstSetRef.current.offsetHeight + 12 : 0;
        if (singleHeight > 0 && scrollAccRef.current >= singleHeight) {
          scrollAccRef.current = scrollAccRef.current % singleHeight;
        }

        container.scrollTop = scrollAccRef.current;
      }

      animationFrameId = requestAnimationFrame(step);
    };

    animationFrameId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animationFrameId);
  }, [isMarqueeActive, filteredReports]);

  // Local editable GPS coordinates for fine-tuning before approval
  const [draftLat, setDraftLat] = useState(selectedReport ? selectedReport.lat : 14.851);
  const [draftLng, setDraftLng] = useState(selectedReport ? selectedReport.lng : 120.816);
  const [draftLocation, setDraftLocation] = useState(
    selectedReport ? selectedReport.locationName : ''
  );

  // Action drawers state
  const [activeDrawer, setActiveDrawer] = useState(null); // null | 'reject' | 'assign'
  const [rejectReason, setRejectReason] = useState('');
  const [selectedTeam, setSelectedTeam] = useState(MAINTENANCE_TEAMS[0]);
  const [dispatchInstructions, setDispatchInstructions] = useState('');

  // Synchronize draft state when selected report changes
  useEffect(() => {
    if (selectedReport) {
      setDraftLat(selectedReport.lat);
      setDraftLng(selectedReport.lng);
      setDraftLocation(selectedReport.locationName);
      setDispatchInstructions(
        selectedReport.instructions ||
          'Saw-cut damaged asphalt perimeter, compact aggregate sub-base, and apply hot-mix asphalt patch.'
      );
      setSelectedTeam(
        selectedReport.assignedTeam && selectedReport.assignedTeam !== 'Unassigned'
          ? selectedReport.assignedTeam
          : MAINTENANCE_TEAMS[0]
      );
      setActiveDrawer(null);
      setRejectReason('');
    }
  }, [selectedReport?.id]);

  const handleCoordinateChange = (newLat, newLng) => {
    setDraftLat(newLat);
    setDraftLng(newLng);
  };

  const nudgeCoordinates = (dLat, dLng) => {
    setDraftLat((prev) => Number((Number(prev) + dLat).toFixed(6)));
    setDraftLng((prev) => Number((Number(prev) + dLng).toFixed(6)));
  };

  const resetToCitizenGps = () => {
    if (!selectedReport) return;
    setDraftLat(selectedReport.lat);
    setDraftLng(selectedReport.lng);
    setDraftLocation(selectedReport.locationName);
  };

  const hasGpsChanged =
    selectedReport &&
    (Number(draftLat) !== Number(selectedReport.lat) ||
      Number(draftLng) !== Number(selectedReport.lng));

  const handleApproveClick = () => {
    if (!selectedReport) return;
    onApproveReport(selectedReport.id, {
      lat: Number(draftLat),
      lng: Number(draftLng),
      locationName: draftLocation.trim() || selectedReport.locationName,
    });
    // Automatically advance selection to next pending report if available
    const nextPending = reports.find(
      (r) => r.status === 'pending' && r.id !== selectedReport.id
    );
    if (nextPending) setSelectedId(nextPending.id);
  };

  const handleConfirmReject = (e) => {
    e.preventDefault();
    if (!selectedReport || !rejectReason.trim()) return;
    onRejectReport(selectedReport.id, rejectReason.trim());
    setActiveDrawer(null);
    setRejectReason('');
    const nextPending = reports.find(
      (r) => r.status === 'pending' && r.id !== selectedReport.id
    );
    if (nextPending) setSelectedId(nextPending.id);
  };

  const handleConfirmAssign = (e, openPrintAfter = false) => {
    e.preventDefault();
    if (!selectedReport) return;
    onAssignMaintenance(selectedReport.id, {
      lat: Number(draftLat),
      lng: Number(draftLng),
      locationName: draftLocation.trim() || selectedReport.locationName,
      assignedTeam: selectedTeam,
      instructions: dispatchInstructions.trim(),
    });
    setActiveDrawer(null);
    if (openPrintAfter && onOpenWorkOrder) {
      onOpenWorkOrder(selectedReport.id);
    }
  };

  const pendingCount = reports.filter((r) => r.status === 'pending').length;

  return (
    <div className="space-y-6">
      {/* Top Gatekeeper Policy Banner */}
      <div className="bg-[#0E1726] wcag-border rounded-xl p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="w-11 h-11 rounded-lg bg-[#162032] wcag-border flex items-center justify-center text-[#00F2FE] shrink-0">
            <ShieldAlert className="w-6 h-6" aria-hidden="true" />
          </div>
          <div>
            <h2 className="text-h3 font-semibold text-[#FFFFFF]">
              Citizen Road Concern Triage &amp; GPS Moderation Queue
            </h2>
            <p className="text-body text-[#E2E8F0] mt-0.5">
              <strong className="text-[#00F2FE]">Strict Gatekeeper Policy:</strong> Incoming
              citizen reports arrive as <code className="font-mono text-[#FFFFFF] bg-[#162032] px-1.5 py-0.5 rounded">pending</code> and{' '}
              <strong>never appear on the map</strong> until you inspect the photo, calibrate the GPS pin, and explicitly approve or assign them.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={onSimulateNewReport}
            className="wcag-target inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#162032] hover:bg-[#A78BFA] text-[#00F2FE] hover:text-[#050B16] font-semibold text-caption wcag-border transition-colors"
          >
            <PlusCircle className="w-4 h-4" aria-hidden="true" />
            <span>+ Simulate Incoming Citizen Report</span>
          </button>
        </div>
      </div>

      {/* Main Two-Column Triage Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left Column: Moderation Queue List (4 cols) */}
        <section
          aria-label="Citizen Submissions List"
          className="lg:col-span-4 bg-[#0E1726] wcag-border rounded-xl p-4 flex flex-col lg:self-start lg:sticky lg:top-4 lg:max-h-[calc(100vh-2rem)] min-h-[580px]"
        >
          <div className="flex flex-wrap items-center justify-between gap-2 pb-3 mb-3 border-b-[1.5px] border-[#94A3B8]">
            <div className="flex items-center gap-2">
              <h3 className="text-h3 font-semibold text-[#FFFFFF]">
                Queue ({filteredReports.length})
              </h3>

              {/* Accessible Marquee Auto-Scroll Toggle Button */}
              {filteredReports.length > 0 && (
                <button
                  type="button"
                  role="switch"
                  aria-checked={isMarqueeActive}
                  onClick={() => {
                    setIsMarqueeActive((prev) => {
                      const next = !prev;
                      if (next && queueContainerRef.current) {
                        scrollAccRef.current = queueContainerRef.current.scrollTop;
                      }
                      return next;
                    });
                  }}
                  title={
                    isMarqueeActive
                      ? 'Auto-Scroll Marquee is ACTIVE (hovering pauses). Click to toggle OFF.'
                      : 'Auto-Scroll Marquee is INACTIVE. Click to toggle ON.'
                  }
                  className="wcag-target inline-flex items-center gap-1.5 p-0.5 text-caption font-semibold transition-all select-none focus:outline-none"
                >
                  <span className="text-xs font-bold tracking-wide text-[#CBD5E1] hover:text-[#FFFFFF]">Auto-Scroll</span>
                  {/* Switch Track */}
                  <span
                    aria-hidden="true"
                    className={`relative inline-flex h-4.5 w-8 shrink-0 cursor-pointer rounded-full p-0.5 transition-colors duration-200 ease-in-out ${
                      isMarqueeActive ? 'bg-[#00F2FE]' : 'bg-[#334155]'
                    }`}
                  >
                    {/* Switch Thumb */}
                    <span
                      className={`pointer-events-none inline-block h-3.5 w-3.5 transform rounded-full shadow transition-transform duration-200 ease-in-out ${
                        isMarqueeActive ? 'translate-x-3.5 bg-[#050B16]' : 'translate-x-0 bg-[#FFFFFF]'
                      }`}
                    />
                  </span>
                </button>
              )}

              {/* Visual Marquee Status Indicator */}
              {isMarqueeActive && (
                <span
                  className={`text-[10px] font-semibold px-1.5 py-0.5 rounded border transition-colors ${
                    isHovered
                      ? 'text-[#FBBF24] bg-[#FBBF24]/10 border-[#FBBF24]/30'
                      : 'text-[#00F2FE] bg-[#00F2FE]/10 border-[#00F2FE]/30 animate-pulse'
                  }`}
                >
                  {isHovered ? 'Paused' : 'Active'}
                </span>
              )}
            </div>

            {/* Filter Button replacing the two pills */}
            <div className="relative" ref={filterDropdownRef}>
              <button
                type="button"
                onClick={() => setIsFilterOpen((prev) => !prev)}
                aria-expanded={isFilterOpen}
                aria-haspopup="dialog"
                className={`wcag-target inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-caption font-semibold border transition-all ${
                  isFilterOpen || isCustomFiltered
                    ? 'bg-[#A78BFA] text-[#050B16] border-[#A78BFA] shadow-[0_0_12px_rgba(167,139,250,0.3)]'
                    : 'bg-[#162032] text-[#E2E8F0] border-[#94A3B8]/60 hover:text-[#00F2FE] hover:border-[#00F2FE]'
                }`}
              >
                <Filter className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Filter</span>
                <span
                  className={`px-1.5 py-0.2 rounded text-[11px] font-mono font-bold ${
                    isFilterOpen || isCustomFiltered
                      ? 'bg-[#050B16] text-[#A78BFA]'
                      : 'bg-[#0E1726] text-[#00F2FE]'
                  }`}
                >
                  {filterStatus === 'pending' && filterSeverity === 'all' && filterAssignment === 'all' && !searchQuery.trim()
                    ? `Pending (${filteredReports.length})`
                    : filterStatus === 'all' && filterSeverity === 'all' && filterAssignment === 'all' && !searchQuery.trim()
                    ? `All (${filteredReports.length})`
                    : `${filteredReports.length}`}
                </span>
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform duration-200 ${
                    isFilterOpen ? 'rotate-180' : ''
                  }`}
                  aria-hidden="true"
                />
              </button>

              {/* Filter Popover Dropdown containing ALL applicable filtering options */}
              {isFilterOpen && (
                <div
                  role="dialog"
                  aria-label="Queue Filter Options"
                  className="absolute right-0 top-full mt-2 w-80 sm:w-96 p-4 rounded-xl bg-[#0E1726] border border-[#00F2FE]/40 shadow-2xl z-50 text-caption space-y-4 backdrop-blur-md max-h-[520px] overflow-y-auto custom-scrollbar-themed"
                >
                  {/* Popover Header */}
                  <div className="flex items-center justify-between border-b border-[#94A3B8]/30 pb-2.5">
                    <div className="flex items-center gap-2">
                      <Filter className="w-4 h-4 text-[#00F2FE]" aria-hidden="true" />
                      <span className="font-bold text-[#FFFFFF] text-caption uppercase tracking-wider">
                        Queue Filter Options
                      </span>
                    </div>
                    {isCustomFiltered && (
                      <button
                        type="button"
                        onClick={resetFilters}
                        className="text-xs text-[#A78BFA] hover:text-[#FFFFFF] underline transition-colors"
                      >
                        Reset All
                      </button>
                    )}
                  </div>

                  {/* Search Keyword */}
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-[#94A3B8] mb-1.5">
                      Search / Keyword
                    </label>
                    <div className="relative flex items-center">
                      <Search className="w-4 h-4 absolute left-3 text-[#94A3B8] pointer-events-none" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search street, citizen, report ID..."
                        className="w-full pl-9 pr-8 py-2 bg-[#162032] border border-[#94A3B8]/40 rounded-lg text-body text-[#FFFFFF] placeholder-[#94A3B8] focus:border-[#00F2FE] focus:outline-none text-xs leading-normal"
                      />
                      {searchQuery && (
                        <button
                          type="button"
                          onClick={() => setSearchQuery('')}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#FFFFFF]"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Status Categorization */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-[#00F2FE]">
                        Status Categorization
                      </span>
                      <span className="text-[11px] text-[#CBD5E1]">
                        {statusCounts[filterStatus] || 0} matching
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-1.5">
                      {[
                        { key: 'all', label: 'All Reports', count: statusCounts.all },
                        { key: 'pending', label: 'Pending Review', count: statusCounts.pending },
                        { key: 'approved', label: 'Approved (Map)', count: statusCounts.approved },
                        { key: 'in_progress', label: 'In Progress', count: statusCounts.in_progress },
                        { key: 'resolved', label: 'Resolved', count: statusCounts.resolved },
                        { key: 'rejected', label: 'Rejected', count: statusCounts.rejected },
                      ].map((item) => {
                        const isActive = filterStatus === item.key;
                        return (
                          <button
                            key={item.key}
                            type="button"
                            onClick={() => setFilterStatus(item.key)}
                            className={`flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs font-semibold border transition-all text-left ${
                              isActive
                                ? 'bg-[#A78BFA] text-[#050B16] border-[#A78BFA] font-bold shadow-sm'
                                : 'bg-[#162032] text-[#CBD5E1] border-[#94A3B8]/30 hover:text-[#FFFFFF] hover:border-[#94A3B8]'
                            }`}
                          >
                            <span className="truncate mr-1">{item.label}</span>
                            <span
                              className={`px-1.5 py-0.2 rounded font-mono text-[10px] shrink-0 ${
                                isActive ? 'bg-[#050B16] text-[#A78BFA]' : 'bg-[#0E1726] text-[#94A3B8]'
                              }`}
                            >
                              {item.count}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Hazard Severity */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-[#00F2FE]">
                        Hazard Severity
                      </span>
                      <span className="text-[11px] text-[#CBD5E1]">
                        {severityCounts[filterSeverity] || 0} matching
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-1.5">
                      {[
                        { key: 'all', label: 'All Severities', count: severityCounts.all, dot: '', span: 'col-span-2' },
                        { key: 'Critical', label: 'Critical', count: severityCounts.Critical, dot: '#EF4444', span: '' },
                        { key: 'High', label: 'High', count: severityCounts.High, dot: '#F97316', span: '' },
                        { key: 'Medium', label: 'Medium', count: severityCounts.Medium, dot: '#FACC15', span: '' },
                        { key: 'Low', label: 'Low', count: severityCounts.Low, dot: '#38BDF8', span: '' },
                      ].map((item) => {
                        const isActive = filterSeverity === item.key;
                        return (
                          <button
                            key={item.key}
                            type="button"
                            onClick={() => setFilterSeverity(item.key)}
                            className={`flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs font-semibold border transition-all ${item.span} ${
                              isActive
                                ? 'bg-[#00F2FE] text-[#050B16] border-[#00F2FE] font-bold shadow-sm'
                                : 'bg-[#162032] text-[#CBD5E1] border-[#94A3B8]/30 hover:text-[#FFFFFF] hover:border-[#94A3B8]'
                            }`}
                          >
                            <div className="flex items-center gap-1.5">
                              {item.dot && (
                                <span
                                  className="w-2 h-2 rounded-full shrink-0"
                                  style={{ backgroundColor: item.dot }}
                                />
                              )}
                              <span>{item.label}</span>
                            </div>
                            <span
                              className={`px-1.5 py-0.2 rounded font-mono text-[10px] shrink-0 ml-1.5 ${
                                isActive ? 'bg-[#050B16] text-[#00F2FE]' : 'bg-[#0E1726] text-[#94A3B8]'
                              }`}
                            >
                              {item.count}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Maintenance Assignment */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-[#00F2FE]">
                        Maintenance Assignment
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-1.5">
                      {[
                        { key: 'all', label: 'All', count: assignmentCounts.all },
                        { key: 'unassigned', label: 'Unassigned', count: assignmentCounts.unassigned },
                        { key: 'assigned', label: 'Assigned', count: assignmentCounts.assigned },
                      ].map((item) => {
                        const isActive = filterAssignment === item.key;
                        return (
                          <button
                            key={item.key}
                            type="button"
                            onClick={() => setFilterAssignment(item.key)}
                            className={`flex items-center justify-between px-2 py-1.5 rounded-md text-xs font-semibold border transition-all ${
                              isActive
                                ? 'bg-[#A78BFA] text-[#050B16] border-[#A78BFA] font-bold shadow-sm'
                                : 'bg-[#162032] text-[#CBD5E1] border-[#94A3B8]/30 hover:text-[#FFFFFF]'
                            }`}
                          >
                            <span>{item.label}</span>
                            <span
                              className={`px-1 py-0.2 rounded font-mono text-[10px] ${
                                isActive ? 'bg-[#050B16] text-[#A78BFA]' : 'bg-[#0E1726] text-[#94A3B8]'
                              }`}
                            >
                              {item.count}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Popover Footer */}
                  <div className="pt-2 border-t border-[#94A3B8]/30 flex items-center justify-between gap-2">
                    <span className="text-[11px] text-[#94A3B8]">
                      Showing <strong className="text-[#00F2FE]">{filteredReports.length}</strong> of {reports.length}
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsFilterOpen(false)}
                      className="px-3 py-1 rounded-md bg-[#00F2FE] text-[#050B16] font-bold text-xs hover:bg-[#38BDF8] transition-colors"
                    >
                      Done
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Active Filter Tags Row */}
          {isCustomFiltered && (
            <div className="flex flex-wrap items-center gap-1.5 mb-2.5 pb-2.5 border-b border-[#94A3B8]/30">
              <span className="text-[11px] text-[#94A3B8] font-semibold">Active:</span>
              {filterStatus !== 'all' && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#A78BFA]/20 text-[#A78BFA] border border-[#A78BFA]/40 text-xs font-semibold">
                  Status: {filterStatus}
                  <button
                    type="button"
                    onClick={() => setFilterStatus('all')}
                    className="hover:text-white"
                    title="Remove status filter"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {filterSeverity !== 'all' && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#00F2FE]/20 text-[#00F2FE] border border-[#00F2FE]/40 text-xs font-semibold">
                  Severity: {filterSeverity}
                  <button
                    type="button"
                    onClick={() => setFilterSeverity('all')}
                    className="hover:text-white"
                    title="Remove severity filter"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {filterAssignment !== 'all' && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#38BDF8]/20 text-[#38BDF8] border border-[#38BDF8]/40 text-xs font-semibold">
                  {filterAssignment === 'unassigned' ? 'Unassigned' : 'Assigned'}
                  <button
                    type="button"
                    onClick={() => setFilterAssignment('all')}
                    className="hover:text-white"
                    title="Remove assignment filter"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {searchQuery.trim() && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#FBBF24]/20 text-[#FBBF24] border border-[#FBBF24]/40 text-xs font-semibold">
                  "{searchQuery}"
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="hover:text-white"
                    title="Remove search filter"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              <button
                type="button"
                onClick={resetFilters}
                className="text-[11px] text-[#CBD5E1] hover:text-[#00F2FE] underline ml-auto"
              >
                Clear all
              </button>
            </div>
          )}

          {filteredReports.length === 0 ? (
            <div className="my-auto py-12 px-4 text-center bg-[#162032] rounded-lg wcag-border">
              {filterStatus === 'pending' && filterSeverity === 'all' && filterAssignment === 'all' && !searchQuery.trim() ? (
                <>
                  <CheckCircle2
                    className="w-10 h-10 text-[#00F2FE] mx-auto mb-3"
                    aria-hidden="true"
                  />
                  <p className="text-h3 font-semibold text-[#FFFFFF]">
                    All Pending Concerns Triaged!
                  </p>
                  <p className="text-caption text-[#CBD5E1] mt-1 mb-4">
                    No unverified citizen submissions remain in the pending queue.
                  </p>
                  <div className="flex flex-col gap-2">
                    <button
                      type="button"
                      onClick={resetFilters}
                      className="wcag-target w-full px-4 py-2.5 rounded-lg bg-[#0E1726] text-[#00F2FE] font-semibold text-caption wcag-border hover:bg-[#0E1726]/80 transition-colors"
                    >
                      View All Reports ({reports.length})
                    </button>
                    <button
                      type="button"
                      onClick={onSimulateNewReport}
                      className="wcag-target w-full px-4 py-2.5 rounded-lg bg-[#A78BFA] text-[#050B16] font-bold text-caption wcag-border hover:bg-[#A78BFA]/90 transition-colors"
                    >
                      + Simulate New Pending Submission
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <SlidersHorizontal
                    className="w-10 h-10 text-[#A78BFA] mx-auto mb-3"
                    aria-hidden="true"
                  />
                  <p className="text-h3 font-semibold text-[#FFFFFF]">
                    No Matching Concerns
                  </p>
                  <p className="text-caption text-[#CBD5E1] mt-1 mb-4">
                    No reports match the current filter options.
                  </p>
                  <button
                    type="button"
                    onClick={resetFilters}
                    className="wcag-target w-full px-4 py-2.5 rounded-lg bg-[#0E1726] text-[#00F2FE] font-semibold text-caption wcag-border hover:bg-[#162032] transition-colors"
                  >
                    Reset All Filters ({reports.length} Total Reports)
                  </button>
                </>
              )}
            </div>
          ) : (
            <div
              ref={queueContainerRef}
              onMouseEnter={() => {
                isHoveredRef.current = true;
                setIsHovered(true);
              }}
              onMouseLeave={() => {
                isHoveredRef.current = false;
                setIsHovered(false);
                if (queueContainerRef.current) {
                  scrollAccRef.current = queueContainerRef.current.scrollTop;
                }
              }}
              onScroll={handleContainerScroll}
              tabIndex={0}
              aria-label="Queue list scroll area"
              className="space-y-3 overflow-y-auto flex-1 min-h-[460px] max-h-[660px] lg:max-h-[calc(100vh-240px)] pr-1.5 custom-scrollbar-themed focus:outline-none focus:ring-1 focus:ring-[#00F2FE]/50 rounded-lg"
            >
              {/* Primary Report Card List */}
              <div ref={firstSetRef} className="space-y-3">
                {filteredReports.map((report) => (
                  <QueueReportCard
                    key={report.id}
                    report={report}
                    isSelected={selectedReport?.id === report.id}
                    onSelect={setSelectedId}
                    isClone={false}
                  />
                ))}
              </div>

              {/* Cloned seamless loop sets rendered only when marquee is active */}
              {isMarqueeActive && (
                <div aria-hidden="true" className="space-y-3 mt-3 pointer-events-auto">
                  {Array.from({
                    length: Math.max(1, Math.ceil(5 / Math.max(filteredReports.length, 1))),
                  }).map((_, loopIdx) =>
                    filteredReports.map((report) => (
                      <QueueReportCard
                        key={`clone-${loopIdx}-${report.id}`}
                        report={report}
                        isSelected={selectedReport?.id === report.id}
                        onSelect={setSelectedId}
                        isClone={true}
                      />
                    ))
                  )}
                </div>
              )}
            </div>
          )}
        </section>

        {/* Right Column: Detailed Inspection, GPS Pin Calibrator & Moderation Actions (8 cols) */}
        <section
          aria-label="Selected Concern Triage Inspector"
          className="lg:col-span-8 space-y-6"
        >
          {!selectedReport ? (
            <div className="bg-[#0E1726] wcag-border rounded-xl p-12 text-center">
              <p className="text-h3 text-[#E2E8F0]">
                Select a citizen report from the queue to inspect photo evidence and calibrate GPS coordinates.
              </p>
            </div>
          ) : (
            <div className="bg-[#0E1726] wcag-border rounded-xl p-5 sm:p-6 space-y-6">
              {/* Report Header */}
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
                </div>

                {selectedReport.status === 'pending' ? (
                  <span className="px-3 py-1.5 rounded-md bg-[#162032] text-[#00F2FE] text-caption font-bold wcag-border">
                    Withheld from Map Until Approved
                  </span>
                ) : (
                  <span className="px-3 py-1.5 rounded-md bg-[#162032] text-[#E2E8F0] text-caption font-semibold wcag-border">
                    Map Visibility: {selectedReport.status === 'rejected' ? 'Hidden (Rejected)' : 'Active on Map'}
                  </span>
                )}
              </div>

              {/* Metadata & Citizen Submission Photo Grid */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
                {/* Attached Citizen Damage Photo */}
                <div className="md:col-span-7 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-caption font-bold uppercase tracking-wider text-[#00F2FE]">
                      Attached Citizen Photo (Manual Admin Inspection)
                    </span>
                    <span className="text-caption text-[#CBD5E1]">No AI/OpenCV</span>
                  </div>
                  <div className="rounded-lg overflow-hidden wcag-border bg-[#050B16]">
                    <img
                      src={selectedReport.citizenPhoto}
                      alt={`Citizen submitted road hazard at ${selectedReport.locationName}`}
                      className="w-full h-60 object-cover block"
                    />
                  </div>
                  <p className="text-body text-[#E2E8F0] bg-[#162032] p-3.5 rounded-lg wcag-border">
                    <strong className="text-[#FFFFFF]">Citizen Field Note: </strong>
                    {selectedReport.description}
                  </p>
                </div>

                {/* Reporter Telemetry Metadata */}
                <div className="md:col-span-5 bg-[#162032] wcag-border rounded-lg p-4 flex flex-col justify-between space-y-4">
                  <div className="space-y-3">
                    <h4 className="text-caption font-bold uppercase tracking-wider text-[#00F2FE] border-b border-[#94A3B8]/50 pb-2">
                      Submission Telemetry
                    </h4>

                    <div className="flex items-start gap-2.5">
                      <User className="w-4 h-4 text-[#00F2FE] shrink-0 mt-1" aria-hidden="true" />
                      <div>
                        <span className="text-caption text-[#CBD5E1] block">Reported By Citizen</span>
                        <span className="text-body font-semibold text-[#FFFFFF]">
                          {selectedReport.citizenName}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-start gap-2.5">
                      <Phone className="w-4 h-4 text-[#00F2FE] shrink-0 mt-1" aria-hidden="true" />
                      <div>
                        <span className="text-caption text-[#CBD5E1] block">SMS / Contact Number</span>
                        <span className="text-body font-mono text-[#E2E8F0]">
                          {selectedReport.contact}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-start gap-2.5">
                      <Calendar className="w-4 h-4 text-[#00F2FE] shrink-0 mt-1" aria-hidden="true" />
                      <div>
                        <span className="text-caption text-[#CBD5E1] block">Timestamp Logged</span>
                        <span className="text-body text-[#E2E8F0]">
                          {selectedReport.submittedAt}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-start gap-2.5">
                      <MapPin className="w-4 h-4 text-[#00F2FE] shrink-0 mt-1" aria-hidden="true" />
                      <div>
                        <span className="text-caption text-[#CBD5E1] block">
                          Original Mobile GPS Coordinates
                        </span>
                        <span className="text-body font-mono font-semibold text-[#FFFFFF]">
                          {Number(selectedReport.lat).toFixed(5)}° N,{' '}
                          {Number(selectedReport.lng).toFixed(5)}° E
                        </span>
                      </div>
                    </div>
                  </div>

                  {selectedReport.rejectionReason && (
                    <div
                      style={{
                        backgroundColor: '#FEE2E2',
                        color: '#7F1D1D',
                        borderColor: '#F87171',
                        borderWidth: '1.5px',
                        borderStyle: 'solid',
                      }}
                      className="p-3 rounded-md text-caption font-semibold"
                    >
                      <strong>Rejection Reason:</strong> {selectedReport.rejectionReason}
                    </div>
                  )}
                </div>
              </div>

              {/* Interactive GPS Pin Selector & Fine-Tuning Panel */}
              <div className="bg-[#162032] wcag-border rounded-xl p-4 sm:p-5 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <Crosshair className="w-5 h-5 text-[#00F2FE]" aria-hidden="true" />
                    <div>
                      <h4 className="text-h3 font-semibold text-[#FFFFFF]">
                        Interactive GPS Pin Selector (Fine-Tune Coordinates)
                      </h4>
                      <p className="text-caption text-[#CBD5E1]">
                        Drag the cyan pin, click anywhere on the Malolos map, or use the coordinate inputs below to correct citizen mobile GPS drift before approving.
                      </p>
                    </div>
                  </div>

                  {hasGpsChanged && (
                    <button
                      type="button"
                      onClick={resetToCitizenGps}
                      className="wcag-target inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#0E1726] text-[#00F2FE] hover:bg-[#A78BFA] hover:text-[#050B16] text-caption font-semibold wcag-border transition-colors"
                    >
                      <RotateCcw className="w-4 h-4" aria-hidden="true" />
                      <span>Reset to Original GPS</span>
                    </button>
                  )}
                </div>

                {/* Interactive Leaflet Map in Triage Calibration Mode */}
                <LeafletMap
                  mode="triage"
                  lat={Number(draftLat) || 14.851}
                  lng={Number(draftLng) || 120.816}
                  zoom={16}
                  onCoordinateChange={handleCoordinateChange}
                  heightClass="h-[300px]"
                />

                {/* Coordinate Fine-Tune Inputs & Keyboard-Accessible Nudge Controls */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                  <div className="md:col-span-3">
                    <label
                      htmlFor="triage-lat-input"
                      className="block text-caption font-semibold text-[#E2E8F0] mb-1.5"
                    >
                      Calibrated Latitude (°N)
                    </label>
                    <input
                      id="triage-lat-input"
                      type="number"
                      step="0.0001"
                      value={draftLat}
                      onChange={(e) => setDraftLat(e.target.value)}
                      className="wcag-target w-full px-3 py-2 rounded-lg bg-[#0E1726] text-[#FFFFFF] font-mono text-body wcag-border"
                    />
                  </div>

                  <div className="md:col-span-3">
                    <label
                      htmlFor="triage-lng-input"
                      className="block text-caption font-semibold text-[#E2E8F0] mb-1.5"
                    >
                      Calibrated Longitude (°E)
                    </label>
                    <input
                      id="triage-lng-input"
                      type="number"
                      step="0.0001"
                      value={draftLng}
                      onChange={(e) => setDraftLng(e.target.value)}
                      className="wcag-target w-full px-3 py-2 rounded-lg bg-[#0E1726] text-[#FFFFFF] font-mono text-body wcag-border"
                    />
                  </div>

                  <div className="md:col-span-6">
                    <span className="block text-caption font-semibold text-[#E2E8F0] mb-1.5">
                      Keyboard Precision Nudge (±0.0002°)
                    </span>
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => nudgeCoordinates(0.0002, 0)}
                        aria-label="Nudge pin North"
                        className="wcag-target px-3 py-2 rounded-lg bg-[#0E1726] hover:bg-[#A78BFA] text-[#FFFFFF] hover:text-[#050B16] text-caption font-semibold wcag-border inline-flex items-center gap-1"
                      >
                        <ArrowUp className="w-4 h-4" aria-hidden="true" />
                        <span>North</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => nudgeCoordinates(-0.0002, 0)}
                        aria-label="Nudge pin South"
                        className="wcag-target px-3 py-2 rounded-lg bg-[#0E1726] hover:bg-[#A78BFA] text-[#FFFFFF] hover:text-[#050B16] text-caption font-semibold wcag-border inline-flex items-center gap-1"
                      >
                        <ArrowDown className="w-4 h-4" aria-hidden="true" />
                        <span>South</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => nudgeCoordinates(0, -0.0002)}
                        aria-label="Nudge pin West"
                        className="wcag-target px-3 py-2 rounded-lg bg-[#0E1726] hover:bg-[#A78BFA] text-[#FFFFFF] hover:text-[#050B16] text-caption font-semibold wcag-border inline-flex items-center gap-1"
                      >
                        <ArrowLeft className="w-4 h-4" aria-hidden="true" />
                        <span>West</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => nudgeCoordinates(0, 0.0002)}
                        aria-label="Nudge pin East"
                        className="wcag-target px-3 py-2 rounded-lg bg-[#0E1726] hover:bg-[#A78BFA] text-[#FFFFFF] hover:text-[#050B16] text-caption font-semibold wcag-border inline-flex items-center gap-1"
                      >
                        <ArrowRight className="w-4 h-4" aria-hidden="true" />
                        <span>East</span>
                      </button>
                    </div>
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="triage-location-input"
                    className="block text-caption font-semibold text-[#E2E8F0] mb-1.5"
                  >
                    Verified Road Location Description
                  </label>
                  <input
                    id="triage-location-input"
                    type="text"
                    value={draftLocation}
                    onChange={(e) => setDraftLocation(e.target.value)}
                    className="wcag-target w-full px-3.5 py-2.5 rounded-lg bg-[#0E1726] text-[#FFFFFF] text-body wcag-border"
                  />
                </div>
              </div>

              {/* Admin Moderation Decision Bar: Approve, Assign to Maintenance, Reject */}
              <div className="pt-2 border-t-[1.5px] border-[#94A3B8] space-y-4">
                <div className="space-y-3">
                  <div>
                    <h4 className="text-h3 font-semibold text-[#FFFFFF]">
                      Admin Moderation Decision
                    </h4>
                    <p className="text-caption text-[#CBD5E1]">
                      Choose an action after inspecting the citizen photo and verifying the GPS coordinates.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {/* 1. Approve (Pins to Map) */}
                    <button
                      type="button"
                      onClick={handleApproveClick}
                      className="wcag-target flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[#A78BFA] hover:bg-[#C4B5FD] text-[#050B16] font-bold text-body wcag-border transition-colors shadow-md text-center"
                    >
                      <CheckCircle2 className="w-5 h-5 shrink-0" aria-hidden="true" strokeWidth={2.5} />
                      <span className="truncate">
                        {selectedReport.status === 'pending'
                          ? 'Approve & Pin to Map'
                          : 'Save Calibrated GPS & Approve'}
                      </span>
                    </button>

                    {/* 2. Assign to Maintenance */}
                    <button
                      type="button"
                      onClick={() =>
                        setActiveDrawer(activeDrawer === 'assign' ? null : 'assign')
                      }
                      className="wcag-target flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[#162032] hover:bg-[#00F2FE] text-[#00F2FE] hover:text-[#050B16] font-bold text-body wcag-border transition-colors text-center"
                    >
                      <Wrench className="w-5 h-5 shrink-0" aria-hidden="true" />
                      <span className="truncate">Assign to Maintenance</span>
                    </button>

                    {/* 3. Reject (With Reason) */}
                    <button
                      type="button"
                      onClick={() =>
                        setActiveDrawer(activeDrawer === 'reject' ? null : 'reject')
                      }
                      className="wcag-target flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[#162032] hover:bg-[#EF4444] text-[#F87171] hover:text-[#FFFFFF] border-[1.5px] border-[#F87171]/60 hover:border-[#EF4444] font-bold text-body transition-all text-center"
                    >
                      <XCircle className="w-5 h-5 shrink-0" aria-hidden="true" />
                      <span className="truncate">Reject Concern</span>
                    </button>
                  </div>
                </div>

                {/* Assign to Maintenance Drawer */}
                {activeDrawer === 'assign' && (
                  <form
                    onSubmit={(e) => handleConfirmAssign(e, false)}
                    className="bg-[#162032] wcag-border rounded-xl p-5 space-y-4"
                  >
                    <h5 className="text-h3 font-semibold text-[#00F2FE] flex items-center gap-2">
                      <Wrench className="w-5 h-5" aria-hidden="true" />
                      <span>Assign Maintenance Unit &amp; Dispatch Instructions</span>
                    </h5>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label
                          htmlFor="assign-team-select"
                          className="block text-caption font-semibold text-[#FFFFFF] mb-1.5"
                        >
                          Select Field Maintenance Unit
                        </label>
                        <select
                          id="assign-team-select"
                          value={selectedTeam}
                          onChange={(e) => setSelectedTeam(e.target.value)}
                          className="wcag-target w-full px-3.5 py-2.5 rounded-lg bg-[#0E1726] text-[#FFFFFF] text-body wcag-border"
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
                          htmlFor="assign-instructions"
                          className="block text-caption font-semibold text-[#FFFFFF] mb-1.5"
                        >
                          Engineering Repair Instructions
                        </label>
                        <input
                          id="assign-instructions"
                          type="text"
                          value={dispatchInstructions}
                          onChange={(e) => setDispatchInstructions(e.target.value)}
                          required
                          className="wcag-target w-full px-3.5 py-2.5 rounded-lg bg-[#0E1726] text-[#FFFFFF] text-body wcag-border"
                        />
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => setActiveDrawer(null)}
                        className="wcag-target px-4 py-2.5 rounded-lg bg-[#0E1726] text-[#E2E8F0] font-semibold text-caption wcag-border"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={(e) => handleConfirmAssign(e, true)}
                        className="wcag-target inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#0E1726] hover:bg-[#00F2FE] text-[#00F2FE] hover:text-[#050B16] font-bold text-caption wcag-border transition-colors"
                      >
                        <FileText className="w-4 h-4" aria-hidden="true" />
                        <span>Assign &amp; Open Printable Work Order</span>
                      </button>
                      <button
                        type="submit"
                        className="wcag-target inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#A78BFA] hover:bg-[#C4B5FD] text-[#050B16] font-bold text-caption wcag-border transition-colors"
                      >
                        <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
                        <span>Confirm Maintenance Dispatch</span>
                      </button>
                    </div>
                  </form>
                )}

                {/* Reject with Reason Drawer */}
                {activeDrawer === 'reject' && (
                  <form
                    onSubmit={handleConfirmReject}
                    className="bg-[#162032] wcag-border rounded-xl p-5 space-y-4"
                  >
                    <h5 className="text-h3 font-semibold text-[#FFFFFF] flex items-center gap-2">
                      <XCircle className="w-5 h-5 text-[#F87171]" aria-hidden="true" />
                      <span>Reject Citizen Submission (Specify Mandatory Reason)</span>
                    </h5>

                    <div className="flex flex-wrap gap-2">
                      {[
                        'Duplicate report already queued on MacArthur Hwy',
                        'Insufficient photo clarity / No road surface damage visible',
                        'Private subdivision road outside City of Malolos jurisdiction',
                      ].map((preset) => (
                        <button
                          key={preset}
                          type="button"
                          onClick={() => setRejectReason(preset)}
                          className="wcag-target px-3 py-1.5 rounded-md bg-[#0E1726] hover:bg-[#A78BFA] text-[#E2E8F0] hover:text-[#050B16] text-caption font-medium wcag-border transition-colors"
                        >
                          + {preset}
                        </button>
                      ))}
                    </div>

                    <div>
                      <label
                        htmlFor="reject-reason-input"
                        className="block text-caption font-semibold text-[#FFFFFF] mb-1.5"
                      >
                        Rejection Audit Log Reason
                      </label>
                      <input
                        id="reject-reason-input"
                        type="text"
                        required
                        placeholder="Enter reason for rejecting this citizen report..."
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                        className="wcag-target w-full px-3.5 py-2.5 rounded-lg bg-[#0E1726] text-[#FFFFFF] text-body wcag-border"
                      />
                    </div>

                    <div className="flex items-center justify-end gap-3">
                      <button
                        type="button"
                        onClick={() => setActiveDrawer(null)}
                        className="wcag-target px-4 py-2.5 rounded-lg bg-[#0E1726] text-[#E2E8F0] font-semibold text-caption wcag-border"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        style={{
                          backgroundColor: '#FEE2E2',
                          color: '#7F1D1D',
                          borderColor: '#F87171',
                          borderWidth: '1.5px',
                          borderStyle: 'solid',
                        }}
                        className="wcag-target px-5 py-2.5 rounded-lg font-bold text-caption"
                      >
                        Confirm Rejection &amp; Withhold from Map
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
