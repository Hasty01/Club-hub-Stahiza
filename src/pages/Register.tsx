import React, { useState } from "react";
import { User, Lock, Mail, ChevronRight, BookOpen, Sparkles, Terminal, ShieldAlert, BadgeInfo, Crown, Users } from "lucide-react";
import { supabase } from "../lib/supabaseClient";

interface RegisterProps {
  onNavigateToLogin?: () => void;
  onRegisterSuccess?: (name: string, email: string, classLevel: string, avatarSeed: string, role: "president" | "cabinet" | "member", bypassed?: boolean) => void;
  onBackToLanding?: () => void;
}

const CLASS_OPTIONS = [
  "Senior 1",
  "Senior 2",
  "Senior 3",
  "Senior 4",
  "Senior 5",
  "Senior 6",
  "Patron/Teacher"
];

const AVATAR_PRESETS = [
  { id: "Mwenya", emoji: "✊🏽", label: "Tech Champion" },
  { id: "Maria", emoji: "👩🏾‍💻", label: "Dev Scholar" },
  { id: "Felix", emoji: "👨🏾‍💻", label: "Problem Solver" },
  { id: "CodeNinja", emoji: "🧠", label: "Systems Guru" },
  { id: "Sandra", emoji: "✨", label: "Visual Creator" },
  { id: "Kato", emoji: "🦁", label: "Bit Blazer" }
];

export default function Register({ onNavigateToLogin, onRegisterSuccess, onBackToLanding }: RegisterProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [classLevel, setClassLevel] = useState("Senior 5");
  const [selectedAvatar, setSelectedAvatar] = useState("Maria");
  const [role, setRole] = useState<"president" | "cabinet" | "member">("member");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const isEmailAdminRegister = email.toLowerCase().trim() === "hastyjoel1@gmail.com";

  React.useEffect(() => {
    if (role === "president" && !isEmailAdminRegister) {
      setRole("member");
    }
  }, [email, role, isEmailAdminRegister]);

  const isDev = (import.meta as any).env?.DEV || 
                window.location.hostname === "localhost" || 
                window.location.hostname === "127.0.0.1" || 
                window.location.hostname.includes("run.app");

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    // Initial validations
    if (!name.trim() || !email.trim() || !password.trim()) {
      setError("Please fill in all standard validation fields.");
      return;
    }

    if (name.length < 3) {
      setError("Your student name must be at least 3 characters.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid academic/student email address.");
      return;
    }

    if (password.length < 5) {
      setError("Your local passcode must be at least 5 indices long.");
      return;
    }

    setIsLoading(true);

    try {
      // Execute the user requested Supabase signup flow!
      const { data, error: signupError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (signupError) {
        console.log(signupError.message);
        setError(signupError.message);
        setIsLoading(false);
        return;
      }

      console.log("User created:", data);

      if (data.user) {
        const generatedUsername = email.split("@")[0].replace(/[^a-zA-Z0-9]/g, "").toLowerCase() + Math.floor(Math.random() * 900 + 100);

        const { error: profileError } = await supabase
          .from("profiles")
          .upsert({
            id: data.user.id,
            full_name: name,
            username: generatedUsername,
            class_level: classLevel,
            avatar_seed: selectedAvatar,
            avatar_url: selectedAvatar,
            role: role,
            xp: 120,
            level: 1,
            email: email,
            streak: 0,
            bio: "",
            badges: [],
          });

        if (profileError) {
          console.log(profileError.message);
          setError(profileError.message);
          return;
        }
      }

      // Successfully authenticated/created account
      if (onRegisterSuccess) {
        onRegisterSuccess(name, email, classLevel, selectedAvatar, role);
      }
    } catch (err: any) {
      console.log(err.message || err);
      setError(err.message || "An unexpected registration error occurred.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div id="register-container" className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Background patterns */}
      <div id="register-grid-overlay" className="absolute inset-0 bg-[linear-gradient(to_right,#020617_1px,transparent_1px),linear-gradient(to_bottom,#020617_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-60 z-0"></div>

      <div id="bg-glow-pink" className="absolute top-1/3 right-1/4 w-80 h-80 bg-pink-500/10 rounded-full blur-3xl pointer-events-none z-0"></div>
      <div id="bg-glow-indigo" className="absolute bottom-1/3 left-1/4 w-72 h-72 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none z-0"></div>

      <div id="register-card-wrapper" className="w-full max-w-lg bg-slate-900/80 border border-slate-800/80 backdrop-blur-xl rounded-2xl p-6 sm:p-8 shadow-2xl relative z-10 my-8">
        
        {/* Header Section */}
        <div id="register-header" className="text-center mb-6">
          <div id="logo-badge-container" className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-pink-500/10 border border-pink-500/30 text-pink-400 mb-3" style={{ transform: "rotate(-5deg)" }}>
            <Terminal id="icon-terminal" className="w-6 h-6" />
          </div>
          <h2 id="register-hub-title" className="text-xl sm:text-2xl font-extrabold tracking-tight uppercase bg-gradient-to-r from-slate-100 via-pink-100 to-indigo-300 bg-clip-text text-transparent">
            CREATE STUDENT PORTAL
          </h2>
          <p id="register-hub-subtitle" className="text-[10px] md:text-xs font-mono text-slate-400 tracking-wider uppercase mt-1">
            STAHIZZA ICT CLUB ECOSYSTEM
          </p>
        </div>

        {/* Registration Form with Supabase integration */}
        <form id="register-form" onSubmit={handleSignUp} className="space-y-4">
          
          {error && (
            <div id="register-error-box" className="p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-400 text-xs font-mono flex flex-col gap-2">
              <div className="flex items-start gap-2 select-none">
                <span id="error-bullet" className="font-bold">⚠️</span>
                <span>{error}</span>
              </div>
              <div className="mt-1 pt-2 border-t border-rose-500/20 text-[10px] text-slate-300 leading-relaxed">
                <p className="mb-2">
                  <strong>Database Tip:</strong> Supabase might have RLS policy restrictions, registration rate limits, or email confirmation enabled. You can either verify your email, toggle Providers configuration, or instantly register and log in to local simulated mode right now.
                </p>
                {isDev && (
                  <button
                    id="btn-register-bypass"
                    type="button"
                    onClick={() => {
                      setIsLoading(true);
                      setTimeout(() => {
                        setIsLoading(false);
                        if (onRegisterSuccess) {
                          onRegisterSuccess(
                            name || "Atamba Joel",
                            email || "hastyjoel1@gmail.com",
                            classLevel || "Senior 6",
                            selectedAvatar || "Sandra",
                            role || "president",
                            true
                          );
                        }
                      }, 500);
                    }}
                    className="w-full bg-rose-950/40 hover:bg-rose-900/50 border border-rose-500/40 hover:border-rose-500/60 rounded-lg text-[10px] py-1.5 px-2 font-bold select-none cursor-pointer text-pink-300 tracking-wider uppercase transition-all mt-1"
                  >
                    Bypass & Register Locally (Offline Mode)
                  </button>
                )}
              </div>
            </div>
          )}

          <div id="grid-name-email" className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div id="name-field-container">
              <label id="label-name" className="block text-[10px] font-mono uppercase tracking-widest text-slate-400 mb-1.5 font-bold">
                Student Full Name
              </label>
              <div id="input-name-wrapper" className="relative">
                <div id="icon-user-container" className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <User id="icon-user" className="w-4 h-4" />
                </div>
                <input
                  id="input-name"
                  type="text"
                  placeholder="e.g., Atamba Joel"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-950/80 border border-slate-800 focus:border-pink-500/60 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-100 placeholder-slate-600 outline-none transition-all"
                  disabled={isLoading}
                />
              </div>
            </div>

            <div id="email-field-container">
              <label id="label-email" className="block text-[10px] font-mono uppercase tracking-widest text-slate-400 mb-1.5 font-bold">
                Access/Contact Email
              </label>
              <div id="input-email-wrapper" className="relative">
                <div id="icon-mail-container" className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Mail id="icon-mail" className="w-4 h-4" />
                </div>
                <input
                  id="input-email"
                  type="email"
                  placeholder="e.g., mail@stahizza.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-950/80 border border-slate-800 focus:border-pink-500/60 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-100 placeholder-slate-600 outline-none transition-all"
                  disabled={isLoading}
                />
              </div>
            </div>
          </div>

          <div id="grid-class-password" className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div id="class-field-container">
              <label id="label-class" className="block text-[10px] font-mono uppercase tracking-widest text-slate-400 mb-1.5 font-bold">
                UNEB Syllabus Class
              </label>
              <div id="input-class-wrapper" className="relative">
                <div id="icon-book-container" className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <BookOpen id="icon-book" className="w-4 h-4" />
                </div>
                <select
                  id="input-class"
                  value={classLevel}
                  onChange={(e) => setClassLevel(e.target.value)}
                  className="w-full bg-slate-950/80 border border-slate-800 focus:border-pink-500/60 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-100 outline-none transition-all appearance-none cursor-pointer"
                  disabled={isLoading}
                >
                  {CLASS_OPTIONS.map((level) => (
                    <option key={level} value={level} className="bg-slate-950 text-slate-100">
                      {level}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div id="password-field-container">
              <label id="label-password" className="block text-[10px] font-mono uppercase tracking-widest text-slate-400 mb-1.5 font-bold">
                Local Passcode
              </label>
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
                  className="w-full bg-slate-950/80 border border-slate-800 focus:border-pink-500/60 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-100 placeholder-slate-600 outline-none transition-all"
                  disabled={isLoading}
                />
              </div>
            </div>
          </div>

          {/* Role selection visual panel */}
          <div id="role-field-container" className="pt-2 border-t border-slate-800/40 mt-2">
            <label id="label-role" className="block text-[10px] font-mono uppercase tracking-widest text-slate-400 mb-2 font-bold flex items-center gap-1.5">
              <span>Choose Account Access Level / Tier</span>
              <span className="text-[8px] bg-pink-500/10 text-pink-400 border border-pink-500/20 px-1 py-0.2 rounded font-extrabold uppercase">REQUIRED</span>
            </label>

            <div id="role-choices-grid" className={`grid grid-cols-1 ${isEmailAdminRegister ? 'sm:grid-cols-3' : 'sm:grid-cols-2'} gap-2`}>
              {/* Normal Member */}
              <button
                key="choice-member"
                id="role-btn-member"
                type="button"
                onClick={() => setRole("member")}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border cursor-pointer transition-all gap-1.5 text-center ${
                  role === "member"
                    ? "bg-pink-500/10 border-pink-500 text-pink-300 shadow-[0_0_15px_rgba(236,72,153,0.1)]"
                    : "bg-slate-950/50 border-slate-800/80 text-slate-400 hover:border-slate-700/80"
                }`}
              >
                <Users className="w-5 h-5" />
                <span className="text-[10px] font-bold tracking-tight">Normal User</span>
                <span className="text-[8px] font-mono text-slate-500 uppercase">Club Member</span>
              </button>

              {/* Cabinet Member */}
              <button
                key="choice-cabinet"
                id="role-btn-cabinet"
                type="button"
                onClick={() => setRole("cabinet")}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border cursor-pointer transition-all gap-1.5 text-center ${
                  role === "cabinet"
                    ? "bg-purple-500/15 border-purple-500 text-purple-300 shadow-[0_0_15px_rgba(168,85,247,0.1)]"
                    : "bg-slate-950/50 border-slate-800/80 text-slate-400 hover:border-slate-700/80"
                }`}
              >
                <ShieldAlert className="w-5 h-5" />
                <span className="text-[10px] font-bold tracking-tight font-sans">Cabinet Member</span>
                <span className="text-[8px] font-mono text-slate-500 uppercase">Admin / Elite</span>
              </button>

              {/* Club President */}
              {isEmailAdminRegister && (
                <button
                  key="choice-president"
                  id="role-btn-president"
                  type="button"
                  onClick={() => setRole("president")}
                  className={`flex flex-col items-center justify-center p-3 rounded-xl border cursor-pointer transition-all gap-1.5 text-center ${
                    role === "president"
                      ? "bg-indigo-500/15 border-indigo-500 text-indigo-300 shadow-[0_0_15px_rgba(99,102,241,0.1)]"
                      : "bg-slate-950/50 border-slate-800/80 text-slate-400 hover:border-slate-700/80"
                  }`}
                >
                  <Crown className="w-5 h-5 text-amber-400" />
                  <span className="text-[10px] font-bold tracking-tight font-sans">Club President</span>
                  <span className="text-[8px] font-mono text-slate-500 uppercase">Overall Access</span>
                </button>
              )}
            </div>

            {/* Quick descriptive summary box of selected role authorization */}
            <div id="role-auth-description-box" className="mt-2.5 p-2 px-3 rounded-xl bg-slate-950/60 border border-slate-900 text-[10px] text-slate-400 leading-normal flex items-start gap-2">
              <span className="text-pink-400 font-extrabold select-none">🔑</span>
              <div>
                {role === "member" && (
                  <p><strong>Core Member Standard Limits:</strong> Submit sandbox code, solve challenge trivia, chat with mentors, unlock XP benchmarks, and view scheduled club notices.</p>
                )}
                {role === "cabinet" && (
                  <p className="text-purple-300"><strong>Cabinet Administrator Privileges:</strong> Write & pin official announcements, record student laboratory attendance, view metrics, and review project boards.</p>
                )}
                {role === "president" && (
                  <p className="text-amber-300"><strong>President Overlord Credentials:</strong> Absolute overall terminal access! Instantly edit any database record, pin or delete any announcements, grant sandbox XP points directly, and configure systems settings.</p>
                )}
              </div>
            </div>
          </div>



          <button
            id="btn-register-submit"
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-pink-500 to-indigo-600 hover:from-pink-600 hover:to-indigo-700 active:scale-[0.98] text-white py-2.5 rounded-xl text-xs font-bold font-mono tracking-widest uppercase transition-all shadow-[0_4px_20px_rgba(236,72,153,0.15)] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-4"
          >
            {isLoading ? (
              <>
                <svg id="loading-spinner" className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                <span>CREATING PORTAL...</span>
              </>
            ) : (
              <>
                <span>Sign Up & Sync Security Key</span>
                <ChevronRight id="icon-chevron" className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Login redirect toggle */}
        <div id="register-footer" className="mt-6 pt-5 border-t border-slate-800/60 text-center text-xs space-y-3">
          <p id="footer-nav-text" className="text-slate-400">
            Already have an active member portal?{" "}
            <button
              id="btn-toggle-login"
              onClick={onNavigateToLogin}
              className="text-pink-400 font-bold hover:text-pink-300 transition-colors cursor-pointer inline-flex items-center gap-1 bg-none border-none p-0"
            >
              Log In With Code <Sparkles id="icon-sparkles" className="w-3 h-3" />
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
