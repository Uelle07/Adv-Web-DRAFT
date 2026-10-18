import React, { useState, useEffect, useCallback } from 'react';
import {
  ShieldCheck,
  Inbox,
  Map,
  FileText,
  Wrench,
  LogOut,
  RotateCcw,
  Clock,
  CheckCircle2,
  HelpCircle,
} from 'lucide-react';
import {
  INITIAL_MOCK_REPORTS,
  createRoadInspectionPhoto,
} from './data/mockReports.js';
import LoginView from './components/LoginView.jsx';
import TriageQueueView from './components/TriageQueueView.jsx';
import InteractiveMapView from './components/InteractiveMapView.jsx';
import WorkOrderView from './components/WorkOrderView.jsx';
import RepairTrackingView from './components/RepairTrackingView.jsx';
import ToastContainer from './components/ToastContainer.jsx';

const SESSION_STORAGE_KEY = 'space_admin_session_v1';
const REPORTS_STORAGE_KEY = 'space_road_reports_v1';

const DEFAULT_ADMIN_SESSION = {
  email: 'admin@space.coop',
  name: 'Engr. Admin Moderator',
  role: 'Senior Road Operations Administrator',
  jurisdiction: 'City of Malolos, Bulacan (Lat 14.851°N, Lng 120.816°E)',
  authenticatedAt: '2026-10-18T18:00:00.000Z',
};

export default function App() {
  // 1. Persistent Admin Authentication Session Gatekeeper (with fallback default so portal is always accessible)
  const [adminSession, setAdminSession] = useState(() => {
    try {
      const saved = localStorage.getItem(SESSION_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.email) return parsed;
      }
    } catch {
      // Fallback
    }
    return DEFAULT_ADMIN_SESSION;
  });

  // 2. Persistent Local Data Schema (Malolos / Bulacan Road Concerns)
  const [reports, setReports] = useState(() => {
    try {
      const saved = localStorage.getItem(REPORTS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // Fallback to seed data
    }
    return INITIAL_MOCK_REPORTS;
  });

  useEffect(() => {
    try {
      localStorage.setItem(REPORTS_STORAGE_KEY, JSON.stringify(reports));
    } catch {
      // Ignore storage quota warnings
    }
  }, [reports]);

  // Active Navigation Tab ('triage' | 'map' | 'work_order' | 'repair_tracking')
  const [activeTab, setActiveTab] = useState('triage');
  const [focusedReportId, setFocusedReportId] = useState(null);

  // Toast Notification Queue
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback(({ title, message, detail, type = 'info' }) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    setToasts((prev) => [...prev, { id, title, message, detail, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 7000);
  }, []);

  const dismissToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Authentication Handlers
  const handleLoginSuccess = (sessionData) => {
    setAdminSession(sessionData);
    try {
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(sessionData));
    } catch {
      // Ignore storage error
    }
    addToast({
      title: 'Admin Session Authenticated',
      message: `Welcome, ${sessionData.name} (${sessionData.email}).`,
      detail: 'Moderation queue and Malolos GIS controls unlocked.',
    });
  };

  const handleLogout = () => {
    setAdminSession(null);
    try {
      localStorage.removeItem(SESSION_STORAGE_KEY);
    } catch {
      // Ignore
    }
  };

  const handleResetDemoData = () => {
    setReports(INITIAL_MOCK_REPORTS);
    try {
      localStorage.setItem(
        REPORTS_STORAGE_KEY,
        JSON.stringify(INITIAL_MOCK_REPORTS)
      );
    } catch {
      // Ignore
    }
    setFocusedReportId(null);
    addToast({
      title: 'Demo Dataset Restored',
      message: 'All 6 Malolos/Bulacan road concern records reset to initial state.',
      detail: '2 Pending, 1 Approved, 2 In Progress, 1 Resolved.',
    });
  };

  // Workflow 2 Handlers: Triage Approve / Reject / Assign Maintenance / Simulate New
  const handleApproveReport = (reportId, { lat, lng, locationName }) => {
    const target = reports.find((r) => r.id === reportId);
    setReports((prev) =>
      prev.map((r) =>
        r.id === reportId
          ? {
              ...r,
              status: 'approved',
              lat,
              lng,
              locationName,
            }
          : r
      )
    );
    addToast({
      title: 'Concern Approved & Pinned to Map',
      message: `${reportId} approved at (${lat.toFixed(5)}°N, ${lng.toFixed(5)}°E).`,
      detail: `Reported by ${target?.citizenName || 'Citizen'} — Now visible on Interactive Map View.`,
    });
  };

  const handleRejectReport = (reportId, reason) => {
    setReports((prev) =>
      prev.map((r) =>
        r.id === reportId
          ? {
              ...r,
              status: 'rejected',
              rejectionReason: reason,
            }
          : r
      )
    );
    addToast({
      title: 'Submission Rejected & Withheld',
      message: `${reportId} marked as rejected and excluded from map.`,
      detail: `Reason logged: "${reason}"`,
      type: 'warning',
    });
  };

  const handleAssignMaintenance = (
    reportId,
    { lat, lng, locationName, assignedTeam, instructions }
  ) => {
    setReports((prev) =>
      prev.map((r) =>
        r.id === reportId
          ? {
              ...r,
              status: 'in_progress',
              lat,
              lng,
              locationName,
              assignedTeam,
              instructions,
            }
          : r
      )
    );
    addToast({
      title: 'Assigned to Maintenance Crew',
      message: `${reportId} approved and dispatched to ${assignedTeam}.`,
      detail: 'Status transitioned to In Progress (Under Repair) and pinned to map.',
    });
  };

  const handleSimulateNewReport = () => {
    const nextNum = 101 + reports.length;
    const newId = `RPT-2026-0${nextNum}`;
    const sampleLocations = [
      {
        citizenName: 'Gabriel Adriano',
        contact: '+63 917 304 8812',
        locationName:
          'McArthur Highway Fronting Bulacan State University Gate 1, Brgy. Guinhawa, Malolos',
        lat: 14.8579,
        lng: 120.8141,
        severity: 'Critical',
        description:
          'Deep asphalt spalling and exposed gravel beside pedestrian lane in front of BulSU Main Gate.',
      },
      {
        citizenName: 'Lourdes Tantoco',
        contact: '+63 919 441 5920',
        locationName:
          'Gov. Padilla Road, Brgy. Tikay Crossing, City of Malolos, Bulacan',
        lat: 14.8418,
        lng: 120.8312,
        severity: 'High',
        description:
          'Sharp pothole cavity on eastbound approach causing heavy congestion near Tikay intersection.',
      },
    ];
    const sample = sampleLocations[reports.length % sampleLocations.length];
    const nowStamp = '2026-10-18 06:30 PM';

    const newReport = {
      id: newId,
      citizenName: sample.citizenName,
      contact: sample.contact,
      locationName: sample.locationName,
      lat: sample.lat,
      lng: sample.lng,
      severity: sample.severity,
      status: 'pending',
      description: sample.description,
      assignedTeam: 'Unassigned',
      instructions:
        'Verify lane coordinates, perform square saw-cut excavation, and apply hot-mix asphalt patch.',
      submittedAt: nowStamp,
      citizenPhoto: createRoadInspectionPhoto({
        stage: 'before',
        reportId: newId,
        locationShort: 'Malolos Sector • Citizen Upload',
        lat: sample.lat,
        lng: sample.lng,
        severity: sample.severity,
        timestamp: nowStamp,
      }),
      repairPhoto: createRoadInspectionPhoto({
        stage: 'during',
        reportId: newId,
        locationShort: 'Malolos Sector • Field Crew',
        lat: sample.lat,
        lng: sample.lng,
        severity: sample.severity,
        timestamp: 'During Repair Log',
      }),
      completedPhoto: createRoadInspectionPhoto({
        stage: 'completed',
        reportId: newId,
        locationShort: 'Malolos Sector • QA Completed',
        lat: sample.lat,
        lng: sample.lng,
        severity: sample.severity,
        timestamp: 'Completed Preview',
      }),
    };

    setReports((prev) => [newReport, ...prev]);
    setActiveTab('triage');
    addToast({
      title: 'New Citizen Report Queued (Pending)',
      message: `${newId} submitted by ${sample.citizenName} arrived in Triage Queue.`,
      detail: 'Withheld from map until Admin verifies GPS pin and approves.',
    });
  };

  // Workflow 4 Handler: Dispatch Work Order
  const handleDispatchWorkOrder = (reportId, { assignedTeam, instructions }) => {
    setReports((prev) =>
      prev.map((r) =>
        r.id === reportId
          ? {
              ...r,
              status: r.status === 'resolved' ? 'resolved' : 'in_progress',
              assignedTeam,
              instructions,
            }
          : r
      )
    );
    addToast({
      title: 'Work Order Dispatched',
      message: `Work Order WO-${reportId.replace('RPT-', '')} assigned to ${assignedTeam}.`,
      detail: 'Concern is now active in Repair Tracking & Verification.',
    });
  };

  // Workflow 5 & 6 Handlers: Start Repair & Resolve with Dual Notification
  const handleStartRepair = (reportId) => {
    setReports((prev) =>
      prev.map((r) =>
        r.id === reportId ? { ...r, status: 'in_progress' } : r
      )
    );
    addToast({
      title: 'Repair Status Updated',
      message: `${reportId} is now marked In Progress (Under Repair).`,
    });
  };

  const handleResolveReport = (reportId, verificationNote) => {
    const target = reports.find((r) => r.id === reportId);
    if (!target) return;

    const resolvedTimestamp = '2026-10-18 06:45 PM';
    setReports((prev) =>
      prev.map((r) =>
        r.id === reportId
          ? {
              ...r,
              status: 'resolved',
              resolvedAt: resolvedTimestamp,
              verificationNote,
            }
          : r
      )
    );

    // Exact required toast notification from specification:
    // "Road repair resolved. Citizen [User] and Admin have been notified."
    addToast({
      type: 'resolution',
      title: 'Resolution & Dual Notification Sent',
      message: `Road repair resolved. Citizen ${target.citizenName} and Admin have been notified.`,
      detail: `Report ${reportId} (${target.locationName}) verified complete with after-photo evidence.`,
    });
  };

  // Deep-link helpers between tabs
  const openWorkOrderForReport = (reportId) => {
    setFocusedReportId(reportId);
    setActiveTab('work_order');
  };

  const openRepairTrackingForReport = (reportId) => {
    setFocusedReportId(reportId);
    setActiveTab('repair_tracking');
  };

  // Gatekeeper: Redirect unauthenticated visits to LoginView
  if (!adminSession) {
    return (
      <>
        <LoginView onLoginSuccess={handleLoginSuccess} />
        <ToastContainer toasts={toasts} onDismiss={dismissToast} />
      </>
    );
  }

  // Summary counts for top navigation badges
  const counts = {
    pending: reports.filter((r) => r.status === 'pending').length,
    approved: reports.filter((r) => r.status === 'approved').length,
    in_progress: reports.filter((r) => r.status === 'in_progress').length,
    resolved: reports.filter((r) => r.status === 'resolved').length,
    mappedTotal: reports.filter(
      (r) =>
        r.status === 'approved' ||
        r.status === 'in_progress' ||
        r.status === 'resolved'
    ).length,
  };

  const navTabs = [
    {
      id: 'triage',
      label: '1. Citizen Triage Queue',
      badge: `${counts.pending} Pending`,
      Icon: Inbox,
    },
    {
      id: 'map',
      label: '2. Interactive Map View',
      badge: `${counts.mappedTotal} Mapped`,
      Icon: Map,
    },
    {
      id: 'work_order',
      label: '3. Work Order & Dispatch',
      badge: 'Printable PDF/Sheet',
      Icon: FileText,
    },
    {
      id: 'repair_tracking',
      label: '4. Repair Tracking & Resolution',
      badge: `${counts.in_progress} Active`,
      Icon: Wrench,
    },
  ];

  return (
    <div className="min-h-screen bg-[#050B16] text-[#FFFFFF] flex flex-col">
      {/* Skip to Main Content Link for Keyboard / Screen Reader WCAG AAA Compliance */}
      <a
        href="#main-workspace"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[9999] focus:px-4 focus:py-3 focus:rounded-lg focus:bg-[#00F2FE] focus:text-[#050B16] focus:font-bold"
      >
        Skip to main admin workspace
      </a>

      {/* Top Corporate Header (Hidden when printing Work Order) */}
      <header className="bg-[#0E1726] border-b-[1.5px] border-[#94A3B8] no-print">
        <div className="max-w-[1720px] mx-auto px-4 sm:px-8 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-12 h-12 rounded-xl bg-[#162032] wcag-border flex items-center justify-center text-[#00F2FE] shrink-0">
              <ShieldCheck className="w-7 h-7" aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-caption font-bold uppercase tracking-widest text-[#00F2FE] whitespace-nowrap">
                  SPACE Corporate Systems
                </span>
                <span className="text-caption px-2 py-0.5 rounded bg-[#162032] text-[#E2E8F0] wcag-border font-mono whitespace-nowrap">
                  Malolos GIS Sector
                </span>
              </div>
              <h1 className="text-h2 sm:text-h1 font-semibold text-[#FFFFFF] leading-tight whitespace-normal">
                Road Concern &amp; Pothole Tracking Admin Portal
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="px-3.5 py-2 rounded-lg bg-[#162032] wcag-border text-caption whitespace-nowrap">
              <span className="text-[#CBD5E1] block">Authenticated Admin</span>
              <span className="font-bold text-[#FFFFFF]">{adminSession.email}</span>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="wcag-target inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#162032] hover:bg-[#FEE2E2] text-[#FFFFFF] hover:text-[#7F1D1D] font-semibold text-caption wcag-border transition-colors whitespace-nowrap"
            >
              <LogOut className="w-4 h-4" aria-hidden="true" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        {/* Audited Dual-Contrast Status Telemetry Strip */}
        <div className="bg-[#050B16] border-t border-[#94A3B8]/50">
          <div className="max-w-[1720px] mx-auto px-4 sm:px-8 py-4">
            <div className="flex items-center justify-between mb-2.5">
              <div className="flex items-center gap-2">
                <span className="text-caption font-bold uppercase tracking-wider text-[#94A3B8] flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#00F2FE] inline-block animate-pulse" aria-hidden="true"></span>
                  Road Concern Lifecycle &amp; Telemetry Overview
                </span>

                {/* Hoverable Help Circle */}
                <div className="relative group/help inline-flex items-center">
                  <button
                    type="button"
                    aria-label="Information about Road Concern Lifecycle & Telemetry"
                    className="p-1 rounded-full text-[#94A3B8] hover:text-[#00F2FE] hover:bg-[#162032] focus:outline-none focus:ring-2 focus:ring-[#00F2FE] transition-colors"
                  >
                    <HelpCircle className="w-4 h-4" aria-hidden="true" />
                  </button>

                  <div
                    role="tooltip"
                    className="absolute left-0 top-full mt-1.5 z-50 w-72 sm:w-80 p-3.5 rounded-xl bg-[#0E1726] border border-[#00F2FE]/40 shadow-2xl text-caption text-[#E2E8F0] opacity-0 pointer-events-none group-hover/help:opacity-100 group-hover/help:pointer-events-auto transition-all duration-200 backdrop-blur-md"
                  >
                    <div className="font-bold text-[#FFFFFF] text-caption mb-1 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-[#00F2FE]"></span>
                      Telemetry Strip Overview
                    </div>
                    <p className="text-[#CBD5E1] leading-relaxed">
                      Displays real-time aggregation across the 4 stages of road reports: <strong className="text-[#FFFFFF]">Pending Moderation</strong> (citizen submissions withheld until review), <strong className="text-[#FBBF24]">Approved</strong> (pinned to GIS), <strong className="text-[#38BDF8]">In Progress</strong> (crew dispatched), and <strong className="text-[#34D399]">Resolved</strong>. Click any card to switch views immediately.
                    </p>
                  </div>
                </div>
              </div>

              <span className="text-caption text-[#CBD5E1] hidden sm:inline">
                Click any metric card to jump to its corresponding workflow
              </span>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {/* Submitted / Pending */}
              <button
                type="button"
                onClick={() => setActiveTab('triage')}
                className="wcag-target p-4 sm:p-5 rounded-xl bg-[#0E1726] hover:bg-[#162032] wcag-border flex items-center justify-between text-left transition-all min-h-[96px] group"
              >
                <div className="space-y-1">
                  <span className="text-caption font-medium text-[#CBD5E1] block group-hover:text-[#FFFFFF]">
                    Moderation Queue (Withheld)
                  </span>
                  <span className="text-h1 font-bold text-[#FFFFFF]">
                    {counts.pending}
                  </span>
                </div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-caption font-bold bg-[#1E293B] text-[#E2E8F0] border-[1.5px] border-[#94A3B8]/60 shadow-sm">
                  <Clock className="w-4 h-4 text-[#94A3B8]" aria-hidden="true" />
                  <span>Pending</span>
                </span>
              </button>

              {/* Under Review / Approved */}
              <button
                type="button"
                onClick={() => setActiveTab('map')}
                className="wcag-target p-4 sm:p-5 rounded-xl bg-[#0E1726] hover:bg-[#162032] wcag-border flex items-center justify-between text-left transition-all min-h-[96px] group"
              >
                <div className="space-y-1">
                  <span className="text-caption font-medium text-[#CBD5E1] block group-hover:text-[#FFFFFF]">
                    Approved / Pending Dispatch
                  </span>
                  <span className="text-h1 font-bold text-[#FFFFFF]">
                    {counts.approved}
                  </span>
                </div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-caption font-bold bg-[#F59E0B]/15 text-[#FBBF24] border-[1.5px] border-[#FBBF24]/50 shadow-sm">
                  <ShieldCheck className="w-4 h-4 text-[#FBBF24]" aria-hidden="true" />
                  <span>Under Review</span>
                </span>
              </button>

              {/* In Progress */}
              <button
                type="button"
                onClick={() => setActiveTab('repair_tracking')}
                className="wcag-target p-4 sm:p-5 rounded-xl bg-[#0E1726] hover:bg-[#162032] wcag-border flex items-center justify-between text-left transition-all min-h-[96px] group"
              >
                <div className="space-y-1">
                  <span className="text-caption font-medium text-[#CBD5E1] block group-hover:text-[#FFFFFF]">
                    Active Field Repairs
                  </span>
                  <span className="text-h1 font-bold text-[#FFFFFF]">
                    {counts.in_progress}
                  </span>
                </div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-caption font-bold bg-[#00F2FE]/15 text-[#00F2FE] border-[1.5px] border-[#00F2FE]/50 shadow-sm">
                  <Wrench className="w-4 h-4 text-[#00F2FE]" aria-hidden="true" />
                  <span>In Progress</span>
                </span>
              </button>

              {/* Resolved */}
              <button
                type="button"
                onClick={() => setActiveTab('repair_tracking')}
                className="wcag-target p-4 sm:p-5 rounded-xl bg-[#0E1726] hover:bg-[#162032] wcag-border flex items-center justify-between text-left transition-all min-h-[96px] group"
              >
                <div className="space-y-1">
                  <span className="text-caption font-medium text-[#CBD5E1] block group-hover:text-[#FFFFFF]">
                    Completed &amp; Verified
                  </span>
                  <span className="text-h1 font-bold text-[#FFFFFF]">
                    {counts.resolved}
                  </span>
                </div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-caption font-bold bg-[#10B981]/15 text-[#34D399] border-[1.5px] border-[#34D399]/50 shadow-sm">
                  <CheckCircle2 className="w-4 h-4 text-[#34D399]" aria-hidden="true" />
                  <span>Resolved</span>
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Primary Workflow Navigation Tabs */}
        <nav
          aria-label="Primary Admin Workflows"
          className="max-w-[1720px] mx-auto px-4 sm:px-8 pt-3.5 pb-4 border-t border-[#94A3B8]/30"
        >
          <div className="mb-2 flex items-center gap-2">
            <span className="text-caption font-bold uppercase tracking-wider text-[#94A3B8] block">
              Admin Workflow &amp; Dispatch Modules
            </span>

            {/* Hoverable Help Circle */}
            <div className="relative group/navhelp inline-flex items-center">
              <button
                type="button"
                aria-label="Information about Admin Workflow & Dispatch Modules"
                className="p-1 rounded-full text-[#94A3B8] hover:text-[#00F2FE] hover:bg-[#162032] focus:outline-none focus:ring-2 focus:ring-[#00F2FE] transition-colors"
              >
                <HelpCircle className="w-4 h-4" aria-hidden="true" />
              </button>

              <div
                role="tooltip"
                className="absolute left-0 top-full mt-1.5 z-50 w-72 sm:w-84 p-3.5 rounded-xl bg-[#0E1726] border border-[#00F2FE]/40 shadow-2xl text-caption text-[#E2E8F0] opacity-0 pointer-events-none group-hover/navhelp:opacity-100 group-hover/navhelp:pointer-events-auto transition-all duration-200 backdrop-blur-md"
              >
                <div className="font-bold text-[#FFFFFF] text-caption mb-1 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#A78BFA]"></span>
                  Primary Workspace Portals
                </div>
                <p className="text-[#CBD5E1] leading-relaxed">
                  Navigate between the 4 core administrative portals:
                </p>
                <ul className="mt-1.5 space-y-1 text-[#E2E8F0] text-caption list-disc list-inside">
                  <li><strong className="text-[#A78BFA]">1. Citizen Triage Queue:</strong> Review incoming citizen reports, approve to map, or reject spam/duplicates.</li>
                  <li><strong className="text-[#A78BFA]">2. Interactive Map View:</strong> Visual Malolos GIS map pinning all approved road concerns with street filtering.</li>
                  <li><strong className="text-[#A78BFA]">3. Work Order &amp; Dispatch:</strong> Generate and print DPWH-compliant physical dispatch sheets for field crews.</li>
                  <li><strong className="text-[#A78BFA]">4. Repair Tracking &amp; Resolution:</strong> Track ongoing road repairs and complete dual-notified verifications with photos.</li>
                </ul>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5">
            {navTabs.map((tab) => {
              const IconComponent = tab.Icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  aria-current={isActive ? 'page' : undefined}
                  onClick={() => setActiveTab(tab.id)}
                  className={`wcag-target w-full px-4 py-3 rounded-xl font-bold text-caption lg:text-body wcag-border inline-flex items-center justify-between gap-2 transition-all ${
                    isActive
                      ? 'bg-[#A78BFA] text-[#050B16] shadow-md ring-2 ring-[#00F2FE]'
                      : 'bg-[#162032] text-[#FFFFFF] hover:border-[#00F2FE] hover:text-[#00F2FE]'
                  }`}
                >
                  <div className="inline-flex items-center gap-2 min-w-0">
                    <IconComponent className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" aria-hidden="true" />
                    <span className="whitespace-nowrap">{tab.label}</span>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded text-caption font-mono font-bold shrink-0 whitespace-nowrap ${
                      isActive
                        ? 'bg-[#050B16] text-[#00F2FE]'
                        : 'bg-[#0E1726] text-[#CBD5E1]'
                    }`}
                  >
                    {tab.badge}
                  </span>
                </button>
              );
            })}
          </div>
        </nav>
      </header>

      {/* Main Content Area */}
      <main
        id="main-workspace"
        className="flex-1 max-w-[1720px] w-full mx-auto px-4 sm:px-8 py-6"
      >
        {activeTab === 'triage' && (
          <TriageQueueView
            reports={reports}
            onApproveReport={handleApproveReport}
            onRejectReport={handleRejectReport}
            onAssignMaintenance={handleAssignMaintenance}
            onSimulateNewReport={handleSimulateNewReport}
            onOpenWorkOrder={openWorkOrderForReport}
          />
        )}

        {activeTab === 'map' && (
          <InteractiveMapView
            reports={reports}
            onOpenWorkOrder={openWorkOrderForReport}
            onOpenRepairTracking={openRepairTrackingForReport}
          />
        )}

        {activeTab === 'work_order' && (
          <WorkOrderView
            reports={reports}
            initialSelectedId={focusedReportId}
            onDispatchWorkOrder={handleDispatchWorkOrder}
          />
        )}

        {activeTab === 'repair_tracking' && (
          <RepairTrackingView
            reports={reports}
            initialSelectedId={focusedReportId}
            onResolveReport={handleResolveReport}
            onStartRepair={handleStartRepair}
            onOpenWorkOrder={openWorkOrderForReport}
          />
        )}
      </main>

      {/* Footer (Hidden when printing) */}
      <footer className="bg-[#0E1726] border-t-[1.5px] border-[#94A3B8] py-4 px-4 sm:px-8 mt-12 no-print">
        <div className="max-w-[1720px] mx-auto flex flex-wrap items-center justify-between gap-3 text-caption text-[#CBD5E1]">
          <span>
            SPACE Corporate Systems — Road Concern &amp; Pothole Tracking System • Admin Web Portal
          </span>
          <span>
            WCAG 2.1 AA/AAA Compliant • Malolos / Bulacan GIS Coordinates (14.851°N, 120.816°E)
          </span>
        </div>
      </footer>

      {/* High-Contrast Accessible Toast Notification Overlay */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
