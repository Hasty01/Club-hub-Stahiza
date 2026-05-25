import React from "react";
import { Terminal, Shield, Sparkles, Code, BookOpen, Trophy, ArrowRight, Activity, Users, Flame, LayoutDashboard } from "lucide-react";

interface LandingProps {
  onEnterHub: () => void;
  onNavigateToLogin: () => void;
  onNavigateToRegister: () => void;
}

export default function Landing({ onEnterHub, onNavigateToLogin, onNavigateToRegister }: LandingProps) {
  return (
    <div id="landing-page-root" className="min-h-screen bg-slate-950 text-slate-100 flex flex-col relative overflow-hidden font-sans">
      
      {/* Dynamic graphic grid background overlay */}
      <div id="landing-grid-overlay" className="absolute inset-0 bg-[linear-gradient(to_right,#020617_1px,transparent_1px),linear-gradient(to_bottom,#020617_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-75 z-0"></div>

      {/* Decorative ambient background glows */}
      <div id="glow-violet" className="absolute top-[-100px] left-[10%] w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[120px] pointer-events-none z-0"></div>
      <div id="glow-pink" className="absolute bottom-[10%] right-[10%] w-[600px] h-[600px] bg-pink-500/10 rounded-full blur-[140px] pointer-events-none z-0"></div>

      {/* Landing Header */}
      <header id="landing-header shadow-md" className="relative z-10 w-full max-w-7xl mx-auto px-6 py-5 flex items-center justify-between border-b border-slate-900/45">
        <div id="landing-brand" className="flex items-center gap-3 select-none">
          <div id="brand-logo" className="w-10 h-10 bg-pink-500/15 border border-pink-500/30 rounded-xl flex items-center justify-center shadow-[0_0_15px_rgba(236,72,153,0.15)]">
            <span className="font-extrabold text-pink-400 text-sm font-sans tracking-wide">ICH</span>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 id="brand-title" className="font-sans font-extrabold text-sm tracking-tight text-white uppercase">STAHIZZA Hub</h1>
              <span className="text-[7.5px] font-mono bg-pink-500/10 border border-pink-500/20 text-pink-400 px-1.5 py-0.2 rounded font-bold">OS v4.2</span>
            </div>
            <p id="brand-subtitle" className="text-[9px] font-mono text-slate-500 uppercase">Standard High High School Zzana</p>
          </div>
        </div>

        <nav id="landing-top-nav" className="hidden sm:flex items-center gap-6 text-xs text-slate-400 font-medium">
          <a href="#features-section" className="hover:text-pink-400 transition-colors">Features</a>
          <a href="#uneb-curriculum-section" className="hover:text-pink-400 transition-colors">Syllabus</a>
          <a href="#showcase-preview-section" className="hover:text-pink-400 transition-colors">Showcase</a>
        </nav>

        <div id="landing-auth-buttons" className="flex items-center gap-3">
          <button
            id="btn-nav-login"
            onClick={onNavigateToLogin}
            className="px-4 py-2 rounded-xl text-xs font-mono font-bold text-slate-350 hover:text-white bg-slate-900/50 border border-slate-805/80 hover:border-slate-800 transition-all cursor-pointer"
          >
            LOG IN
          </button>
          <button
            id="btn-nav-register"
            onClick={onNavigateToRegister}
            className="px-4 py-2 rounded-xl text-xs font-mono font-bold text-white bg-gradient-to-r from-pink-500 to-indigo-600 hover:from-pink-600 hover:to-indigo-700 transition-all cursor-pointer shadow-[0_4px_15px_rgba(236,72,153,0.15)] active:scale-95"
          >
            JOIN HUB
          </button>
        </div>
      </header>

      {/* Main Hero & Content Column */}
      <main id="landing-content" className="relative z-10 flex-1 flex flex-col items-center">
        
        {/* HERO HERO SECTION */}
        <section id="hero-section" className="w-full max-w-5xl mx-auto px-6 pt-16 pb-20 text-center space-y-8">
          
          <div id="hero-badge-container" className="inline-flex items-center gap-2 px-3 py-1 bg-gradient-to-r from-pink-500/10 to-indigo-500/10 border border-pink-500/30 rounded-full select-none animate-pulse">
            <span className="w-2 h-2 rounded-full bg-pink-500"></span>
            <span className="text-[9px] sm:text-[10px] font-mono tracking-widest uppercase font-extrabold text-pink-300">
              STAHIZZA OFFICIAL ICT CENTRAL GATEWAY
            </span>
          </div>

          <div id="hero-title-container" className="space-y-4">
            <h1 id="hero-title" className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight leading-tight select-text">
              Empowering Tech Leaders At <br />
              <span className="bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-505 bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent">
                Standard High School Zzana
              </span>
            </h1>
            <p id="hero-description" className="text-sm sm:text-base text-slate-400 max-w-2xl mx-auto font-light leading-relaxed">
              Accelerate your UNEB Computer Studies scoreboards, draft code elements inside a responsive HTML playground, and gain 24/7 mentoring assistance with Uganda's premier high school ICT Club OS.
            </p>
          </div>

          <div id="hero-buttons-container" className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <button
              id="btn-enter-hub-direct"
              onClick={onEnterHub}
              className="w-full sm:w-auto px-7 py-3 rounded-xl text-xs font-mono tracking-widest font-black uppercase text-white bg-gradient-to-r from-pink-500 via-purple-600 to-indigo-600 hover:opacity-90 transition-all cursor-pointer shadow-[0_5px_22px_rgba(236,72,153,0.25)] flex items-center justify-center gap-2 group hover:scale-[1.02] active:scale-[0.98]"
            >
              <span>BOOT CENTRAL PLATFORM</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              id="btn-goto-sandbox"
              onClick={onEnterHub}
              className="w-full sm:w-auto px-7 py-3 rounded-xl text-xs font-mono tracking-widest font-bold text-slate-300 hover:text-white bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <Code className="w-4 h-4 text-emerald-400" />
              <span>TEST INTERACTIVE SANDBOX</span>
            </button>
          </div>

          {/* Core Applet Screenshot Mockup Panel */}
          <div id="mockup-frame" className="pt-10 w-full max-w-4xl mx-auto rounded-2xl overflow-hidden border border-slate-800/80 bg-slate-950/60 p-2.5 shadow-2.5 shadow-[0_15px_40px_rgba(0,0,0,0.6)] group">
            <div id="mockup-header-bar" className="bg-slate-900 px-4 py-2 border-b border-slate-950 flex items-center justify-between rounded-t-xl select-none font-mono text-[9px] text-slate-500">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500/60" />
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500/60" />
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/60" />
              </div>
              <span>https://hub.stahizza.edu/workspace</span>
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse" />
                <span className="text-[8px] text-slate-500 uppercase font-mono font-bold">SYSTEM ACTIVE</span>
              </div>
            </div>
            
            <div id="mockup-inner" className="bg-[#070A13] aspect-[16/9] text-left p-6 flex flex-col justify-between relative overflow-hidden select-none">
              <div className="absolute top-0 right-1/4 w-60 h-60 bg-pink-500/5 blur-[50px] pointer-events-none" />
              
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="text-3xl p-2 bg-slate-900 border border-slate-800 rounded-xl">👩🏾‍💻</div>
                  <div>
                    <span className="text-[8px] font-mono bg-pink-500/10 border border-pink-500/20 text-pink-400 px-2 py-0.5 rounded font-extrabold uppercase">
                      ACTIVE S6 PRACTICAL
                    </span>
                    <h3 className="text-base font-extrabold text-white mt-0.5">Atamba Joel • STAHIZZA Cadet Rank</h3>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-slate-900/60 border border-slate-800 p-3.5 rounded-xl">
                    <p className="text-[8px] font-mono text-slate-500 uppercase">Interactive Sandbox XP</p>
                    <p className="text-lg font-black text-rose-400 mt-1">1,210 XP</p>
                  </div>
                  <div className="bg-slate-900/60 border border-slate-800 p-3.5 rounded-xl">
                    <p className="text-[8px] font-mono text-slate-500 uppercase">Ecosystem Level</p>
                    <p className="text-lg font-black text-amber-400 mt-1">Lvl 5 Aces</p>
                  </div>
                  <div className="bg-slate-900/60 border border-slate-800 p-3.5 rounded-xl">
                    <p className="text-[8px] font-mono text-slate-500 uppercase">Unlocked Achievements</p>
                    <p className="text-lg font-black text-indigo-400 mt-1">3 Badges</p>
                  </div>
                </div>

                <div className="p-4 bg-slate-900/30 border border-slate-800 rounded-xl space-y-1">
                  <h4 className="text-xs font-bold text-slate-300">💡 Local UNEB Focus Note:</h4>
                  <p className="text-[11px] text-slate-400 leading-normal">
                    Learn database structures with bridge tables, solve loops in code, and coordinate HTML style matrices in real-time.
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between text-[9px] font-mono text-slate-500 pt-6">
                <span>STAHIZZA CONTROL MODULES</span>
                <span className="text-pink-400">EXP + CODE + CONNECT</span>
              </div>
            </div>
          </div>

        </section>

        {/* FEATURES DETAIL bento-style section */}
        <section id="features-section" className="w-full bg-slate-900/40 border-y border-slate-900 py-20 px-6">
          <div className="max-w-7xl mx-auto space-y-12">
            
            <div className="text-center space-y-2">
              <span className="px-2.5 py-0.5 rounded text-[8px] font-mono tracking-widest bg-pink-500/10 text-pink-400 font-bold uppercase border border-pink-500/20">
                PROVEN TECH TRACK
              </span>
              <h2 className="text-2xl sm:text-4xl font-black text-white leading-tight font-sans">
                Next-Gen Operational Capabilities
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 max-w-lg mx-auto font-light">
                Tailored components drafted precisely to meet academic requirements and foster creative coding innovations.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-6">
              
              {/* Feature 1 */}
              <div id="feature-card-1" className="bg-slate-950 border border-slate-800 hover:border-slate-755/90 p-6 rounded-2xl flex flex-col justify-between space-y-6">
                <div className="space-y-3">
                  <div className="w-10 h-10 bg-pink-500/10 border border-pink-500/30 text-pink-400 rounded-xl flex items-center justify-center">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <h3 className="text-sm font-extrabold text-slate-200 uppercase font-sans">
                    AI-Powered Mentorship
                  </h3>
                  <p className="text-xs text-slate-400 font-light leading-relaxed">
                    A context-aware AI tutor specifically trained on the Ugandan O/A-level curriculum. Draft HTML code recipes, solve logic loops, and debug SQL syntax securely 24/7.
                  </p>
                </div>
                <span className="text-[9px] font-mono text-pink-400 group-hover:underline">STAHIZZA Mentoring Nodule →</span>
              </div>

              {/* Feature 2 */}
              <div id="feature-card-2" className="bg-slate-950 border border-slate-800 hover:border-slate-755/90 p-6 rounded-2xl flex flex-col justify-between space-y-6">
                <div className="space-y-3">
                  <div className="w-10 h-10 bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 rounded-xl flex items-center justify-center">
                    <Code className="w-5 h-5" />
                  </div>
                  <h3 className="text-sm font-extrabold text-slate-200 uppercase font-sans">
                    HTML Sandbox Playgrounds
                  </h3>
                  <p className="text-xs text-slate-400 font-light leading-relaxed">
                    Test and render dynamic CSS styling rules, centered welcomes, flex structures, and standard table indices inside the visual live container directly in any school laboratory browser.
                  </p>
                </div>
                <span className="text-[9px] font-mono text-indigo-400">Zero-install local compilers →</span>
              </div>

              {/* Feature 3 */}
              <div id="feature-card-3" className="bg-slate-950 border border-slate-800 hover:border-slate-755/90 p-6 rounded-2xl flex flex-col justify-between space-y-6">
                <div className="space-y-3">
                  <div className="w-10 h-10 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-xl flex items-center justify-center">
                    <Trophy className="w-5 h-5" />
                  </div>
                  <h3 className="text-sm font-extrabold text-slate-200 uppercase font-sans">
                    Gamified Ranks & Leaderboard
                  </h3>
                  <p className="text-xs text-slate-400 font-light leading-relaxed">
                    Climb the school leaderboard from student Cadet limits up to elite Senior Fellow. Win prestigious titles, digital badges, and high-bound ranking scores by passing assessment trivia.
                  </p>
                </div>
                <span className="text-[9px] font-mono text-emerald-400">Competitive high-school rank scorecard 👑</span>
              </div>

            </div>

          </div>
        </section>

        {/* UNEB SYLLABUS SECTION */}
        <section id="uneb-curriculum-section" className="w-full max-w-7xl mx-auto px-6 py-20 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6 text-left">
            <span className="px-2.5 py-0.5 rounded text-[8px] font-mono tracking-widest bg-pink-500/10 text-pink-400 font-bold uppercase border border-pink-500/20">
              ACADEMIC FOCUS
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-white leading-tight font-sans">
              Tailored Explicitly for Ugandan O & A Level Curriculum Requirements
            </h2>
            <p className="text-xs sm:text-sm text-slate-450 leading-relaxed font-light text-slate-400">
              The STAHIZZA ICT Hub aligns with textbooks, syllabus directives, and practical UNEB constraints. Practice real past issues, explore Excel functions, study core hardware networks, and solve relational database questions effortlessly.
            </p>

            <div className="grid grid-cols-2 gap-4 pt-4 text-xs font-mono">
              <div className="flex items-center gap-2 text-slate-305">
                <span className="w-1.5 h-1.5 rounded-full bg-pink-400" />
                <span>Spreadsheets & Excel Functions</span>
              </div>
              <div className="flex items-center gap-2 text-slate-305">
                <span className="w-1.5 h-1.5 rounded-full bg-pink-400" />
                <span>HTML Structured Layouts</span>
              </div>
              <div className="flex items-center gap-2 text-slate-305">
                <span className="w-1.5 h-1.5 rounded-full bg-pink-400" />
                <span>Relational Database Structs</span>
              </div>
              <div className="flex items-center gap-2 text-slate-305">
                <span className="w-1.5 h-1.5 rounded-full bg-pink-400" />
                <span>Hardware Components & OS</span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-indigo-950/20 via-slate-900/60 to-slate-950 p-6 rounded-2xl border border-slate-800/80 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-xs font-bold font-sans text-slate-205 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-pink-400" />
                RECOMMENDED DAILY SYLLABUS CHALLENGE
              </h3>
              <span className="text-[9px] font-mono text-amber-500 font-bold">40 XP REWARD</span>
            </div>

            <div className="space-y-3 font-sans">
              <p className="text-xs font-bold text-slate-300">"The Centered STAHIZZA Hub h1 Welcome Header"</p>
              <p className="text-[11px] text-slate-400 leading-normal font-light">
                Write a compliant inline style attribute that turns an `&lt;h1&gt;` text skyblue and centers it on the viewport. This question challenges your knowledge of style selectors.
              </p>
            </div>

            <button
              onClick={onEnterHub}
              className="w-full py-2 bg-pink-500/10 hover:bg-pink-500 text-pink-400 hover:text-white border border-pink-500/20 rounded-xl text-xs font-bold font-mono tracking-widest transition-all uppercase cursor-pointer"
            >
              Start Revision Challenge Now
            </button>
          </div>
        </section>

        {/* CALL TO ACTION BOT-UP BANNER */}
        <section id="cta-section" className="w-full max-w-7xl mx-auto px-6 pb-20 pt-10">
          <div className="bg-gradient-to-r from-pink-500/10 via-indigo-500/5 to-slate-950 border border-slate-800/80 rounded-3xl p-8 sm:p-12 text-center space-y-6 relative overflow-hidden">
            <div id="cta-glow" className="absolute top-0 right-0 w-80 h-80 bg-pink-500/10 rounded-full blur-3xl pointer-events-none" />
            
            <div className="space-y-2 relative z-10 max-w-lg mx-auto">
              <h2 className="text-xl sm:text-3xl font-extrabold text-white uppercase tracking-tight font-sans">Ready to test your ICT limits?</h2>
              <p className="text-xs text-slate-400 leading-relaxed font-light font-sans">
                Boot up the direct STAHIZZA dashboard portal, consult with our custom virtual tutor mentor, browse notice logs, and join other ICT scholars.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 relative z-10 pt-4">
              <button
                id="cta-enter-direct"
                onClick={onEnterHub}
                className="w-full sm:w-auto px-8 py-3 bg-white text-slate-950 hover:bg-slate-100 rounded-xl text-xs font-mono tracking-wider font-extrabold uppercase transition-all shadow-xl active:scale-95 cursor-pointer"
              >
                ENTER CENTRAL HUB DIRECT
              </button>
              <button
                id="cta-register-access"
                onClick={onNavigateToRegister}
                className="w-full sm:w-auto px-8 py-3 bg-slate-900 hover:bg-slate-850 text-slate-300 border border-slate-800 rounded-xl text-xs font-mono tracking-wider font-bold uppercase transition-all cursor-pointer"
              >
                REQUEST NO-ACC-KEYS ACCESS
              </button>
            </div>
          </div>
        </section>

      </main>

      {/* FOOTER AREA */}
      <footer id="landing-footer" className="bg-[#070A13] border-t border-slate-900 py-8 px-6 relative z-10">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6 text-slate-500 font-mono text-[10px]">
          <div>
            <p className="font-semibold text-slate-400">© 2026 Standard High High School Zzana (STAHIZZA) ICT Club.</p>
            <p className="text-slate-600 mt-0.5">Central OS platform running over Express proxy links.</p>
          </div>
          <div className="bg-slate-900/40 border border-slate-900/60 px-3.5 py-1.5 rounded-xl text-right">
            <span>Core Designer & Fullstack Mentor: </span>
            <span className="text-pink-400 font-bold">Atamba Joel</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
