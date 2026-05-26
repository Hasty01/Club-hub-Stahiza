import React, { useState } from "react";
import { Shield, Lock, Mail, ChevronRight, Sparkles, Terminal } from "lucide-react";
import { supabase, isSupabaseConfigured } from "../lib/supabaseClient";

interface LoginProps {
  onNavigateToRegister?: () => void;
  onLoginSuccess?: (email: string, bypassed?: boolean) => void;
  onBackToLanding?: () => void;
}

export default function Login({ onNavigateToRegister, onLoginSuccess, onBackToLanding }: LoginProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password.trim()) {
      setError("Please fill in all standard validation fields.");
      return;
    }

    // Standard high school level simple input validation check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email) && !email.includes("joel") && !email.includes("admin")) {
      setError("Please input a valid STAHIZZA student email address.");
      return;
    }

    if (password.length < 5) {
      setError("Your security code must be at least 5 indices long.");
      return;
    }

    setIsLoading(true);

    if (isSupabaseConfigured) {
      supabase.auth.signInWithPassword({
        email,
        password,
      }).then(({ data, error: loginError }) => {
        setIsLoading(false);
        if (loginError) {
          setError(loginError.message);
        } else if (onLoginSuccess && data.user) {
          onLoginSuccess(email);
        }
      }).catch((err) => {
        setIsLoading(false);
        setError(err.message || "An unexpected error occurred during login verification.");
      });
    } else {
      // Simulate authentication pipeline as a local fallback
      setTimeout(() => {
        setIsLoading(false);
        if (onLoginSuccess) {
          onLoginSuccess(email);
        }
      }, 900);
    }
  };

  return (
    <div id="login-container" className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Dynamic ambient grid overlay background */}
      <div id="login-grid-overlay" className="absolute inset-0 bg-[linear-gradient(to_right,#020617_1px,transparent_1px),linear-gradient(to_bottom,#020617_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-60 z-0"></div>

      {/* Subtle background glow bubbles */}
      <div id="bg-glow-pink" className="absolute top-1/4 left-1/4 w-72 h-72 bg-pink-500/10 rounded-full blur-3xl pointer-events-none z-0 animate-pulse"></div>
      <div id="bg-glow-indigo" className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none z-0"></div>

      <div id="login-card-wrapper" className="w-full max-w-md bg-slate-900/80 border border-slate-800/80 backdrop-blur-xl rounded-2xl p-6 sm:p-8 shadow-2xl relative z-10">
        
        {/* Top Header Section */}
        <div id="login-header" className="text-center mb-6">
          <div id="logo-badge-container" className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-pink-500/10 border border-pink-500/30 text-pink-400 mb-3.5 shadow-[0_0_15px_rgba(236,72,153,0.15)] animate-bounce">
            <Terminal id="icon-terminal" className="w-6 h-6" />
          </div>
          <h2 id="login-hub-title" className="text-xl sm:text-2xl font-extrabold tracking-tight uppercase bg-gradient-to-r from-slate-100 via-pink-100 to-indigo-300 bg-clip-text text-transparent">
            STAHIZZA HUB
          </h2>
          <p id="login-hub-subtitle" className="text-[10px] md:text-xs font-mono text-slate-400 tracking-wider uppercase mt-1">
            Standard High High School Zzana
          </p>
        </div>

        {/* Informative alert box */}
        <div id="sandbox-alert" className="mb-5 p-3 rounded-xl bg-blue-500/5 border border-blue-500/15 flex items-start gap-2.5">
          <Shield id="icon-shield" className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
          <div>
            <h4 id="alert-title" className="text-[10px] font-mono font-bold text-blue-400 uppercase tracking-wider">SECURE DIGITAL WORKSPACE</h4>
            <p id="alert-desc" className="text-[10px] text-slate-400 leading-normal mt-0.5">
              Enter your standard school computer science credentials below to access synchronized ICT laboratory dashboards or local testing sandbox.
            </p>
          </div>
        </div>

        {/* Login Form */}
        <form id="login-form" onSubmit={handleSubmit} className="space-y-4">
          
          {error && (
            <div id="login-error-box" className="p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-400 text-xs font-mono flex flex-col gap-2">
              <div className="flex items-start gap-2 select-none">
                <span id="error-bullet" className="font-bold">⚠️</span>
                <span>{error}</span>
              </div>
              <div className="mt-1 pt-2 border-t border-rose-500/20 text-[10px] text-slate-300 leading-relaxed">
                {error.includes("Email not confirmed") ? (
                  <p className="mb-2">
                    <strong>Tip:</strong> Please check your email inbox for a confirmation link, or go to your <strong>Supabase Dashboard &rarr; Auth &rarr; Providers &rarr; Email</strong> and disable "Confirm email" to enable instant user sign-ins!
                  </p>
                ) : (
                  <p className="mb-2">
                    <strong>Database Notice:</strong> If you are running into Supabase schema sync, rate limits, or unconfirmed email restraints, you can bypass this error and log in with your credentials in offline/local simulated mode.
                  </p>
                )}
                <button
                  id="btn-login-bypass"
                  type="button"
                  onClick={() => {
                    setIsLoading(true);
                    setTimeout(() => {
                      setIsLoading(false);
                      if (onLoginSuccess) {
                        onLoginSuccess(email, true);
                      }
                    }, 500);
                  }}
                  className="w-full bg-rose-950/40 hover:bg-rose-900/50 border border-rose-500/40 hover:border-rose-500/60 rounded-lg text-[10px] py-1.5 px-2 font-bold select-none cursor-pointer text-pink-300 tracking-wider uppercase transition-all"
                >
                  Bypass & Load Offline Simulation
                </button>
              </div>
            </div>
          )}

          <div id="email-field-container">
            <label id="label-email" className="block text-[10px] font-mono uppercase tracking-widest text-slate-400 mb-1.5 font-bold">
              Student Email Key
            </label>
            <div id="input-email-wrapper" className="relative">
              <div id="icon-mail-container" className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                <Mail id="icon-mail" className="w-4 h-4" />
              </div>
              <input
                id="input-email"
                type="text"
                placeholder="e.g., joel@stahizza.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-950/80 border border-slate-800 focus:border-pink-500/60 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-100 placeholder-slate-600 outline-none transition-all focus:ring-1 focus:ring-pink-500/30"
                disabled={isLoading}
              />
            </div>
          </div>

          <div id="password-field-container">
            <div id="password-labels" className="flex items-center justify-between mb-1.5">
              <label id="label-password" className="block text-[10px] font-mono uppercase tracking-widest text-slate-400 font-bold">
                Local Security Code
              </label>
              <span id="forgot-password-trigger" className="text-[9px] font-mono text-indigo-400 hover:text-indigo-300 cursor-pointer transition-colors">
                forgot code?
              </span>
            </div>
            <div id="input-password-wrapper" className="relative">
              <div id="icon-lock-container" className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                <Lock id="icon-lock" className="w-4 h-4" />
              </div>
              <input
                id="input-password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-950/80 border border-slate-800 focus:border-pink-500/60 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-100 placeholder-slate-600 outline-none transition-all focus:ring-1 focus:ring-pink-500/30"
                disabled={isLoading}
              />
            </div>
          </div>

          <button
            id="btn-login-submit"
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-pink-500 to-indigo-600 hover:from-pink-600 hover:to-indigo-700 active:scale-[0.98] text-white py-2.5 rounded-xl text-xs font-bold font-mono tracking-widest uppercase transition-all shadow-[0_4px_20px_rgba(236,72,153,0.15)] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <svg id="loading-spinner" className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                <span>VERIFYING CODES...</span>
              </>
            ) : (
              <>
                <span>BOOT WORKSPACE DIRECT</span>
                <ChevronRight id="icon-chevron" className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Footer Toggle Navigation */}
        <div id="login-footer" className="mt-6 pt-5 border-t border-slate-800/60 text-center text-xs space-y-3">
          <p id="footer-nav-text" className="text-slate-400">
            First time in the STAHIZZA Lab?{" "}
            <button
              id="btn-toggle-register"
              onClick={onNavigateToRegister}
              className="text-pink-400 font-bold hover:text-pink-300 transition-colors cursor-pointer inline-flex items-center gap-1 bg-none border-none p-0"
            >
              Request Access Code <Sparkles id="icon-sparkles" className="w-3 h-3" />
            </button>
          </p>

          {onBackToLanding && (
            <p>
              <button
                id="btn-back-to-landing"
                onClick={onBackToLanding}
                className="text-slate-400 hover:text-white transition-colors cursor-pointer font-mono text-[10px] tracking-widest uppercase hover:underline bg-transparent border-none p-0"
              >
                ← Return to Home Portal
              </button>
            </p>
          )}
        </div>

      </div>
    </div>
  );
}
