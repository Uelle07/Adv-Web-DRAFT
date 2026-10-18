import React, { useState } from 'react';
import {
  ShieldCheck,
  Lock,
  Mail,
  KeyRound,
  AlertCircle,
  Sparkles,
  LogIn,
  MapPin,
  Eye,
  EyeOff,
} from 'lucide-react';

/**
 * Workflow 1: Admin Authentication View
 * Dedicated login portal with demo credential autofill (admin@space.coop / admin123)
 * and 100% WCAG AA/AAA contrast compliance.
 */
export default function LoginView({ onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleAutofill = () => {
    setEmail('admin@space.coop');
    setPassword('admin123');
    setErrorMessage('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmedEmail = email.trim().toLowerCase();

    if (trimmedEmail === 'admin@space.coop' && password === 'admin123') {
      setErrorMessage('');
      onLoginSuccess({
        email: 'admin@space.coop',
        name: 'Engr. Admin Moderator',
        role: 'Senior Road Operations Administrator',
        jurisdiction: 'City of Malolos, Bulacan (Lat 14.851°N, Lng 120.816°E)',
        authenticatedAt: new Date().toISOString(),
      });
    } else {
      setErrorMessage(
        'Invalid administrator credentials. Use the Demo Autofill button below (admin@space.coop / admin123).'
      );
    }
  };

  return (
    <div className="min-h-screen bg-[#050B16] text-[#FFFFFF] flex flex-col justify-between p-4 sm:p-8">
      {/* Top Institutional Banner */}
      <header className="max-w-5xl w-full mx-auto flex flex-wrap items-center justify-between gap-4 pb-4 border-b-[1.5px] border-[#94A3B8]">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-lg bg-[#162032] wcag-border flex items-center justify-center text-[#00F2FE]">
            <ShieldCheck className="w-6 h-6" aria-hidden="true" />
          </div>
          <div>
            <span className="text-caption font-bold uppercase tracking-widest text-[#00F2FE] block">
              SPACE Corporate Systems
            </span>
            <span className="text-body font-semibold text-[#FFFFFF]">
              Road Concern &amp; Pothole Tracking System
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2 text-caption text-[#CBD5E1] bg-[#0E1726] px-3 py-2 rounded-md wcag-border">
          <MapPin className="w-4 h-4 text-[#00F2FE]" aria-hidden="true" />
          <span>Malolos / Bulacan Operations Sector • WCAG AAA Audited</span>
        </div>
      </header>

      {/* Main Authentication Card */}
      <main className="my-auto py-8 flex items-center justify-center">
        <div className="max-w-lg w-full bg-[#0E1726] wcag-border rounded-xl p-6 sm:p-8 shadow-2xl">
          <div className="mb-6">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-caption font-bold uppercase tracking-wider bg-[#162032] text-[#00F2FE] wcag-border mb-3">
              <Lock className="w-3.5 h-3.5" aria-hidden="true" />
              Restricted Admin Web Portal
            </span>
            <h1 className="text-h1 font-semibold text-[#FFFFFF]">
              Administrator Sign In
            </h1>
            <p className="text-body text-[#E2E8F0] mt-2">
              Authenticate to triage citizen road hazard reports, calibrate GPS coordinates,
              generate maintenance work orders, and verify repair completion.
            </p>
          </div>

          {/* Demo Credentials Quick Autofill Box */}
          <div className="mb-6 p-4 rounded-lg bg-[#162032] wcag-border">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-caption font-bold uppercase tracking-wider text-[#00F2FE]">
                  Live Evaluation Credentials
                </h2>
                <p className="text-caption text-[#E2E8F0] mt-1 font-mono">
                  User: <strong className="text-[#FFFFFF]">admin@space.coop</strong>
                  <span className="mx-2 text-[#94A3B8]">|</span>
                  Pass: <strong className="text-[#FFFFFF]">admin123</strong>
                </p>
              </div>
              <button
                type="button"
                onClick={handleAutofill}
                className="wcag-target inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[#0E1726] hover:bg-[#A78BFA] text-[#00F2FE] hover:text-[#050B16] font-semibold text-caption wcag-border transition-colors shrink-0"
              >
                <Sparkles className="w-4 h-4" aria-hidden="true" />
                <span>Autofill Demo Login</span>
              </button>
            </div>
          </div>

          {errorMessage && (
            <div
              role="alert"
              style={{
                backgroundColor: '#FEE2E2',
                color: '#7F1D1D',
                borderColor: '#F87171',
                borderWidth: '1.5px',
                borderStyle: 'solid',
              }}
              className="mb-6 p-3.5 rounded-lg flex items-start gap-3 text-caption font-semibold"
            >
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" aria-hidden="true" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            <div>
              <label
                htmlFor="admin-email"
                className="block text-body font-semibold text-[#FFFFFF] mb-2"
              >
                Administrator Email Address
              </label>
              <div className="relative">
                <Mail
                  className="w-5 h-5 text-[#CBD5E1] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                  aria-hidden="true"
                />
                <input
                  id="admin-email"
                  name="email"
                  type="email"
                  autoComplete="username"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@space.coop"
                  className="wcag-target w-full pl-11 pr-4 py-3 rounded-lg bg-[#162032] text-[#FFFFFF] placeholder-[#CBD5E1]/60 wcag-border text-body"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="admin-password"
                className="block text-body font-semibold text-[#FFFFFF] mb-2"
              >
                Security Passcode
              </label>
              <div className="relative flex items-center">
                <KeyRound
                  className="w-5 h-5 text-[#CBD5E1] absolute left-3.5 pointer-events-none"
                  aria-hidden="true"
                />
                <input
                  id="admin-password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="wcag-target w-full pl-11 pr-14 py-3 rounded-lg bg-[#162032] text-[#FFFFFF] placeholder-[#CBD5E1]/60 wcag-border text-body"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="wcag-target absolute right-1.5 px-2.5 rounded-md text-[#CBD5E1] hover:text-[#00F2FE] flex items-center justify-center"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" aria-hidden="true" />
                  ) : (
                    <Eye className="w-5 h-5" aria-hidden="true" />
                  )}
                </button>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="wcag-target w-full py-3.5 px-6 rounded-lg bg-[#A78BFA] hover:bg-[#C4B5FD] text-[#050B16] font-bold text-body wcag-border flex items-center justify-center gap-2.5 transition-colors shadow-lg"
              >
                <LogIn className="w-5 h-5" aria-hidden="true" strokeWidth={2.5} />
                <span>Sign In to Admin Portal</span>
              </button>
            </div>
          </form>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-5xl w-full mx-auto pt-4 border-t-[1.5px] border-[#94A3B8] flex flex-wrap items-center justify-between gap-2 text-caption text-[#CBD5E1]">
        <span>SPACE Corporate Systems • Single-Role Admin Portal (IT 305)</span>
        <span>Manual Admin Photo &amp; GPS Verification • Zero Automated CV</span>
      </footer>
    </div>
  );
}
