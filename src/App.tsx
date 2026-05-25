import React, { useState, useEffect } from "react";
import { StudentProfile } from "./types";
import { TOP_MEMBERS, INITIAL_EVENTS, AVATAR_PRESETS } from "./data";
import { isSupabaseConfigured } from "./lib/supabaseClient";
import { fetchProfileFromSupabase, saveProfileToSupabase } from "./lib/supabaseSync";
import { 
  Shield, 
  Sparkles, 
  LayoutDashboard, 
  Terminal, 
  Code, 
  Award, 
  Megaphone, 
  Trophy, 
  Clock, 
  Zap, 
  Calendar, 
  MapPin, 
  ChevronRight, 
  Menu, 
  X, 
  ChevronLeft, 
  Activity, 
  BookOpen,
  Users2,
  MessageSquare,
  Lightbulb,
  FolderKanban,
  ClipboardCheck,
  Compass,
  Gamepad2,
  Rss,
  User,
  AlertCircle
} from "lucide-react";

// Import modular subcomponents safely
import TutorChat from "./components/TutorChat";
import CodeSandbox from "./components/CodeSandbox";
import QuestsTrivia from "./components/QuestsTrivia";
import NoticeBoard from "./components/NoticeBoard";
import ProjectShowcase from "./components/ProjectShowcase";
import ProfileCard from "./components/ProfileCard";
import CommunityHub from "./components/CommunityHub";
import SuggestionsHub from "./components/SuggestionsHub";
import ProjectsBoard from "./components/ProjectsBoard";
import RoadmapView from "./components/RoadmapView";
import GamesLounge from "./components/GamesLounge";
import AttendanceView from "./components/AttendanceView";
import ResourcesView from "./components/ResourcesView";

export default function App() {
  const [activeTab, setActiveTab] = useState<
    | "feed"
    | "community"
    | "messages"
    | "challenges"
    | "suggestions"
    | "activities"
    | "projects"
    | "attendance"
    | "roadmap"
    | "resources"
    | "playground"
    | "games"
    | "showcase"
    | "profile"
  >("feed");

  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [showAiAlert, setShowAiAlert] = useState<boolean>(true);

  const [userProfile, setUserProfile] = useState<StudentProfile>(() => {
    const stored = localStorage.getItem("stahiza_ict_profile");
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        console.warn("Failed to parse stored profile", e);
      }
    }
    return {
      name: "Atamba Joel",
      classLevel: "Senior 6",
      xp: 120,
      level: 1,
      unlockedBadges: ["Starter Bit"],
      solvedChallengeIds: [],
      avatarSeed: "Sandra",
      rank: "Cadet"
    };
  });

  const [levelUpMessage, setLevelUpMessage] = useState<string | null>(null);

  // Fetch initial profile from Supabase
  useEffect(() => {
    async function loadDbProfile() {
      if (!isSupabaseConfigured) return;
      const dbProf = await fetchProfileFromSupabase();
      if (dbProf) {
        setUserProfile(dbProf);
      } else {
        // Initial insert
        await saveProfileToSupabase(userProfile);
      }
    }
    loadDbProfile();
  }, []);

  // Sync profile edits with localStorage & Supabase
  useEffect(() => {
    localStorage.setItem("stahiza_ict_profile", JSON.stringify(userProfile));
    
    if (isSupabaseConfigured) {
      saveProfileToSupabase(userProfile);
    }
  }, [userProfile]);

  // Handle XP increments and level-up milestones
  const handleGrantXp = (amount: number, reason: string) => {
    setUserProfile((prev) => {
      const newXp = prev.xp + amount;
      const expectedLevel = Math.floor(newXp / 300) + 1;
      const leveledUp = expectedLevel > prev.level;

      const updatedBadges = [...prev.unlockedBadges];
      
      if (newXp >= 100 && !updatedBadges.includes("Starter Bit")) {
        updatedBadges.push("Starter Bit");
      }
      if (newXp >= 500 && !updatedBadges.includes("Syllabus Ace")) {
        updatedBadges.push("Syllabus Ace");
      }
      if (newXp >= 1000 && !updatedBadges.includes("STAHIZZA Legend")) {
        updatedBadges.push("STAHIZZA Legend");
      }

      let newRank = prev.rank;
      if (expectedLevel >= 3) newRank = "Acolyte";
      if (expectedLevel >= 6) newRank = "Tutor Mentor";
      if (expectedLevel >= 9) newRank = "Senior Fellow";

      if (leveledUp) {
        setLevelUpMessage(
          `🎉 Milestones Achieved! Level Up! You reached Level ${expectedLevel} (Title: ${newRank})! Keep coding!`
        );
        setTimeout(() => setLevelUpMessage(null), 8500);
      }

      return {
        ...prev,
        xp: newXp,
        level: expectedLevel,
        unlockedBadges: updatedBadges,
        rank: newRank
      };
    });
  };

  const handleUnlockBadge = (badge: string) => {
    setUserProfile((prev) => {
      if (prev.unlockedBadges.includes(badge)) return prev;
      return {
        ...prev,
        unlockedBadges: [...prev.unlockedBadges, badge]
      };
    });
  };

  const handleUpdateProfile = (updates: Partial<StudentProfile>) => {
    setUserProfile((prev) => ({
      ...prev,
      ...updates
    }));
  };

  const activeAvatarInfo = AVATAR_PRESETS.find(a => a.id === userProfile.avatarSeed) || AVATAR_PRESETS[0];

  const levelFloorXp = (userProfile.level - 1) * 300;
  const xpInCurrentLevel = userProfile.xp - levelFloorXp;
  const progressPercent = Math.min(100, Math.max(0, (xpInCurrentLevel / 300) * 100));

  // Comprehensive 14 Navigation tabs based on screenshots schema
  const navigationItems = [
    { id: "feed", label: "Club Feed", icon: Rss, desc: "News & peer discussions" },
    { id: "community", label: "Community", icon: Users2, desc: "Explore peer contributors" },
    { id: "messages", label: "Messages", icon: MessageSquare, desc: "Syllabus Chat rooms" },
    { id: "challenges", label: "Challenges", icon: Trophy, desc: "O/A-Level training revision" },
    { id: "suggestions", label: "Suggestions", icon: Lightbulb, desc: "Proposal tickets catalog" },
    { id: "activities", label: "Activities", icon: Calendar, desc: "Term II meetings & contests" },
    { id: "projects", label: "Projects", icon: FolderKanban, desc: "Kanban progress board" },
    { id: "attendance", label: "Attendance", icon: ClipboardCheck, desc: "Log proximity registers" },
    { id: "roadmap", label: "Roadmap", icon: Compass, desc: "Python & Javascript tracks" },
    { id: "resources", label: "Resources", icon: BookOpen, desc: "Digital workbook eLibrary" },
    { id: "playground", label: "Playground", icon: Code, desc: "HTML/CSS sandbox compiler" },
    { id: "games", label: "Games", icon: Gamepad2, desc: "Reaction & speed runs" },
    { id: "showcase", label: "Showcase", icon: Award, desc: "Publish digital creations" },
    { id: "profile", label: "Profile", icon: User, desc: "Configure student registers" }
  ];

  return (
    <div className="min-h-screen bg-[#070A13] text-slate-100 flex font-sans antialiased text-sm select-text selection:bg-pink-600/30 selection:text-pink-100">
      
      {/* -------------------------------------------------------------
          DESKTOP STICKY SIDEBAR NAVIGATION ("SLIDEBAR")
          - Expandable / Collapsible via smooth state transitions
         ------------------------------------------------------------- */}
      <aside 
        className={`hidden md:flex flex-col border-r border-slate-900 bg-[#0B1220] transition-all duration-300 relative select-none z-30 shrink-0 ${
          sidebarCollapsed ? "w-20" : "w-64"
        }`}
      >
        {/* Collapse Toggle Handle Button */}
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="absolute -right-3 top-8 w-6 h-6 rounded-full border border-slate-800 bg-[#0B1220] text-slate-400 hover:text-pink-400 flex items-center justify-center transition-transform hover:scale-110 shadow-lg focus:outline-none focus:ring-1 focus:ring-pink-500/30 cursor-pointer"
          title={sidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          {sidebarCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
        </button>

        {/* Sidebar Header Brand Area */}
        <div className={`p-4 border-b border-slate-900/60 flex items-center gap-3 ${sidebarCollapsed ? "justify-center" : ""}`}>
          <div className="w-9 h-9 bg-pink-500/15 border border-pink-500/30 rounded-xl flex items-center justify-center shrink-0">
            <span className="font-extrabold text-pink-400 text-xs font-sans tracking-wide">ICH</span>
          </div>
          {!sidebarCollapsed && (
            <div className="animate-fadeIn truncate">
              <div className="flex items-center gap-1">
                <h1 className="font-sans font-extrabold text-[12px] tracking-tight text-slate-100 uppercase">
                  STAHIZZA Hub
                </h1>
                <span className="text-[8px] font-mono bg-pink-500/10 border border-pink-500/20 text-pink-400 px-1 py-0.1 select-none rounded font-bold">
                  PRO
                </span>
              </div>
              <p className="text-[9px] font-mono text-slate-500">Standard High High School Zzana</p>
            </div>
          )}
        </div>

        {/* Level Progression Indicator Section in Sidebar */}
        {!sidebarCollapsed && (
          <div className="p-4 border-b border-slate-900/60 bg-[#0B1220]/40 space-y-2">
            <div className="flex items-center gap-2.5">
              <span className="text-xl bg-slate-950 w-8 h-8 rounded-xl flex items-center justify-center border border-slate-800 shrink-0">
                {activeAvatarInfo.emoji}
              </span>
              <div className="truncate">
                <p className="text-xs font-bold text-slate-200 truncate">{userProfile.name}</p>
                <p className="text-[9px] font-mono text-indigo-400 font-bold tracking-wider uppercase">LVL {userProfile.level} • {userProfile.rank}</p>
              </div>
            </div>

            <div className="space-y-1 text-[9px] font-mono">
              <div className="flex justify-between text-slate-500">
                <span>Core Progression</span>
                <span>{userProfile.xp} XP</span>
              </div>
              <div className="w-full h-1 bg-slate-950 rounded-full overflow-hidden border border-slate-900">
                <div 
                  className="bg-pink-500 h-full rounded-full transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Dynamic Navigation Tabs list */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto scrollbar-none">
          {navigationItems.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`w-full flex items-center gap-3.5 px-3 py-2 rounded-xl transition-all duration-200 text-left outline-none cursor-pointer ${
                  isActive
                    ? "bg-pink-500 text-slate-100 shadow-[0_0_15px_rgba(236,72,153,0.15)]"
                    : "bg-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/40"
                }`}
                title={tab.label}
              >
                {/* Collapsed view uses round shape and active pink accent dot background */}
                <span className={`p-1.5 rounded-lg flex items-center justify-center shrink-0 ${
                  isActive ? "bg-slate-950/20 text-slate-100" : "text-slate-500"
                }`}>
                  <Icon className="w-4 h-4" />
                </span>
                {!sidebarCollapsed && (
                  <div className="animate-fadeIn leading-none">
                    <p className="text-xs font-semibold font-sans">{tab.label}</p>
                    <p className={`text-[9px] font-sans mt-0.5 font-light ${isActive ? "text-pink-100" : "text-slate-500"}`}>
                      {tab.desc}
                    </p>
                  </div>
                )}
              </button>
            );
          })}
        </nav>

        {/* Sidebar Footer node */}
        <div className={`p-4 border-t border-slate-900/60 text-slate-500 text-[10px] font-mono ${sidebarCollapsed ? "text-center" : "space-y-1 bg-[#0B1220]/20"}`}>
          {!sidebarCollapsed ? (
            <div className="animate-fadeIn">
              <div className="flex items-center gap-1.5 justify-center sm:justify-start">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-[pulse_1.5s_infinite]" />
                <span className="text-slate-400 text-[9px] font-semibold">WORKSPACE: ONLINE</span>
              </div>
              <p className="text-[8px] text-slate-600 mt-0.5">STAHIZZA ICT Club Hub OS v4.2</p>
            </div>
          ) : (
            <div className="flex justify-center">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse" title="Systems online" />
            </div>
          )}
        </div>
      </aside>

      {/* -------------------------------------------------------------
          MOBILE NAVIGATION OVERLAY DRAWER (SLIDING SIDEBAR)
         ------------------------------------------------------------- */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex justify-start">
          <div 
            className="absolute inset-0 bg-black/75 backdrop-blur-sm transition-opacity"
            onClick={() => setIsMobileMenuOpen(false)}
          />

          <aside className="relative w-72 max-w-[80vw] h-full bg-[#0B1220] border-r border-slate-900 flex flex-col p-4 space-y-4 z-10 shadow-2xl overflow-y-auto">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-900/60">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-pink-500/15 border border-pink-500/35 rounded-lg flex items-center justify-center">
                  <span className="font-bold text-pink-400 text-xs">ICH</span>
                </div>
                <div>
                  <h2 className="font-sans font-extrabold text-[11px] tracking-tight uppercase">STAHIZZA Hub</h2>
                  <p className="text-[8px] font-mono text-slate-500">Standard High High School Zzana</p>
                </div>
              </div>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-8 h-8 rounded-lg bg-slate-950 border border-slate-800 text-slate-400 hover:text-slate-200 flex items-center justify-center hover:bg-slate-900 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <nav className="flex-1 space-y-0.5">
              {navigationItems.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id as any);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all text-xs text-left cursor-pointer ${
                      isActive
                        ? "bg-pink-500 text-slate-100"
                        : "bg-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/40"
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span className="font-sans font-medium">{tab.label}</span>
                  </button>
                );
              })}
            </nav>

            <div className="pt-3 border-t border-slate-900/60 flex items-center justify-between text-[9px] font-mono text-slate-500">
              <span className="flex items-center gap-1">
                <span className={`w-1.5 h-1.5 rounded-full ${isSupabaseConfigured ? 'bg-emerald-400' : 'bg-amber-500'} inline-block animate-pulse`} />
                <span>{isSupabaseConfigured ? 'Supabase Connected' : 'Local Sandbox Mode'}</span>
              </span>
              <span>OS v4.2</span>
            </div>

          </aside>
        </div>
      )}

      {/* -------------------------------------------------------------
          MAIN APPLICATION WINDOW WRAPPER
         ------------------------------------------------------------- */}
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        
        {/* MOBILE TOP BAR HEADER */}
        <header className="md:hidden sticky top-0 z-45 bg-[#0B1220]/95 backdrop-blur-md border-b border-slate-900/80 p-3 flex items-center justify-between select-none">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="w-9 h-9 flex items-center justify-center bg-[#0B1220] border border-slate-800 rounded-xl text-slate-400 hover:text-slate-205 cursor-pointer"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <h1 className="font-sans font-extrabold text-xs tracking-tight text-slate-100 uppercase">
                STAHIZZA HUB
              </h1>
              <p className="text-[8px] font-mono text-slate-500">Standard High High School Zzana</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-lg bg-slate-900 w-7 h-7 rounded-lg flex items-center justify-center border border-slate-804">
              {activeAvatarInfo.emoji}
            </span>
          </div>
        </header>

        {/* Level Up congratulations popup */}
        {levelUpMessage && (
          <div className="mx-4 mt-4 bg-gradient-to-r from-emerald-600 to-pink-600 text-slate-100 text-center py-3 px-4 font-sans text-xs sm:text-sm font-semibold relative animate-bounce shadow-xl rounded-xl flex items-center justify-center gap-2 select-none z-20">
            <Sparkles className="w-4 h-4 animate-pulse" />
            <span>{levelUpMessage}</span>
            <button 
              type="button" 
              onClick={() => setLevelUpMessage(null)} 
              className="absolute right-4 text-slate-200 hover:text-white font-mono text-xs font-bold bg-black/15 px-1.5 rounded"
            >
              ✕
            </button>
          </div>
        )}

        {/* -------------------------------------------------------------
            PRIMARY MAIN SCROLLER CONTAINER
           ------------------------------------------------------------- */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 space-y-6 pb-20 select-text">

          {/* VIEW 1: CLUB FEED (Corresponds to Screenshot 1 "Club Feed") */}
          {activeTab === "feed" && (
            <div className="space-y-6 animate-fadeIn">
              
              {/* PRIMARY FEED SEARCH BANNER */}
              <div className="bg-gradient-to-r from-[#0B1220] to-[#070A13] border border-slate-850 p-6 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
                <div className="absolute top-0 right-1/4 w-40 h-40 bg-pink-500/5 blur-[50px] pointer-events-none" />
                
                <div className="space-y-1.5 text-center md:text-left">
                  <span className="px-2.5 py-0.5 rounded text-[8px] font-mono tracking-widest bg-pink-500/10 text-pink-400 font-bold uppercase border border-pink-500/20">
                    STAHIZZA COMMUNICATOR
                  </span>
                  <h2 className="text-lg sm:text-xl font-bold font-sans text-slate-100">STAHIZZA ICT Club Feed</h2>
                  <p className="text-xs text-slate-400 font-light font-sans max-w-md">
                    Peer communication system for Standard High High School Zzana computer science scholars. Read syllabus news, event notes, and laboratory bulletins.
                  </p>
                </div>

                <div className="bg-slate-950 px-4 py-2 hover:border-slate-750 transition-all rounded-xl border border-slate-800 w-full max-w-xs flex items-center gap-2">
                  <span className="text-slate-500">🔍</span>
                  <input
                    type="text"
                    disabled
                    placeholder="Search posts, authors, hashtags..."
                    className="bg-transparent text-xs text-slate-400 w-full outline-none"
                  />
                </div>
              </div>

              {/* WARNING ALERT CARD FOR "AI FEATURE DOWN TIME" (as shown in Screenshot 1) */}
              {showAiAlert && (
                <div className="bg-amber-500/10 border border-amber-500/30 p-4 rounded-xl flex items-start gap-3 relative animate-fadeIn select-text">
                  <span className="p-1.5 bg-amber-500/20 text-amber-400 rounded-lg shrink-0">
                    <AlertCircle className="w-4 h-4" />
                  </span>
                  <div className="text-xs space-y-1 pr-8 select-text">
                    <h4 className="font-bold text-amber-400 font-sans">AI FEATURE DOWN TIME NOTICE</h4>
                    <p className="text-slate-300 leading-relaxed font-light select-text">
                      Due to sudden upstream rate limit restrictions from free Google AI interfaces, certain direct AI interactions inside the <strong>STAHIZZA Learning Nodule</strong> may occasionally display compilation delays. Standard O/A-level revision trivia and HTML sandbox compilers remain 100% active. Thank you for your patience!
                    </p>
                  </div>
                  <button
                    onClick={() => setShowAiAlert(false)}
                    className="absolute top-4 right-4 text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
                    title="Dismiss alert"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Bento Grid: Main stream and right widgets */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                
                {/* Left Stream: Notices Bulletin */}
                <div className="lg:col-span-8 space-y-6">
                  <NoticeBoard
                    userProfile={userProfile}
                    onGrantXp={handleGrantXp}
                  />
                </div>

                {/* Right Column details */}
                <div className="lg:col-span-4 space-y-6 select-none">
                  
                  {/* ONLINE NOW WIDGET (from Screenshot 1) */}
                  <div className="bg-[#0B1220] border border-slate-850 p-4 rounded-xl space-y-3">
                    <div className="flex items-center justify-between border-b border-sidebar-line pb-2">
                      <span className="text-[10px] font-mono font-bold text-slate-300 uppercase">ONLINE NOW</span>
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                      </span>
                    </div>

                    <div className="space-y-2.5">
                      <div className="flex items-center gap-2.5 text-xs">
                        <span className="text-base bg-slate-950 w-7 h-7 rounded border border-slate-800 flex items-center justify-center">👨🏾‍💻</span>
                        <div>
                          <p className="font-bold text-slate-250">Jerome K. Maku</p>
                          <p className="text-[9px] text-emerald-400 font-mono">Present in Block B Lab</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2.5 text-xs">
                        <span className="text-base bg-slate-950 w-7 h-7 rounded border border-slate-800 flex items-center justify-center">👩🏾‍💻</span>
                        <div>
                          <p className="font-bold text-slate-250">Nabulo Maria</p>
                          <p className="text-[9px] text-emerald-400 font-mono">Designing Responsive grids</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2.5 text-xs">
                        <span className="text-base bg-slate-950 w-7 h-7 rounded border border-slate-800 flex items-center justify-center">👨🏾‍💻</span>
                        <div>
                          <p className="font-bold text-slate-250">Atamba Joel</p>
                          <p className="text-[9px] text-emerald-405 font-mono">Solving database trivia</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* CHALLENGES TOP BOARD SUMMARY (from Screenshot 1) */}
                  <div className="bg-[#0B1220] border border-slate-850 p-4 rounded-xl space-y-3">
                    <div className="flex items-center justify-between border-b pb-2 border-slate-850">
                      <span className="text-[10px] font-mono font-bold text-slate-300 uppercase">CHALLENGES LEADERBOARD</span>
                      <span className="text-[9px] font-mono text-pink-400 font-bold uppercase">Weekly</span>
                    </div>

                    <div className="space-y-2 text-xs font-mono">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">1. Kyobe Arthur</span>
                        <span className="text-pink-400 font-bold">1,980 XP</span>
                      </div>
                      <div className="flex items-center justify-between border-t border-slate-950 pt-1.5">
                        <span className="text-slate-400">2. Jerome Maku</span>
                        <span className="text-pink-400 font-medium">1,910 XP</span>
                      </div>
                      <div className="flex items-center justify-between border-t border-slate-950 pt-1.5">
                        <span className="text-slate-400">3. Nabulo Maria</span>
                        <span className="text-slate-400">1,850 XP</span>
                      </div>
                    </div>
                  </div>

                </div>

              </div>

            </div>
          )}

          {/* VIEW 2: COMMUNITY HUB */}
          {activeTab === "community" && (
            <CommunityHub
              userProfile={userProfile}
              onGrantXp={handleGrantXp}
            />
          )}

          {/* VIEW 3: SYLLABUS MESSAGES */}
          {activeTab === "messages" && (
            <div className="space-y-6 animate-fadeIn">
              <div>
                <h2 className="text-lg font-bold font-sans text-slate-100">Syllabus Chat Lounge</h2>
                <p className="text-xs text-slate-400 font-mono">Collaborate with peers, ask questions, or direct queries to our active AI Learning Nodule.</p>
              </div>

              <TutorChat
                userProfile={userProfile}
                onGrantXp={handleGrantXp}
              />
            </div>
          )}

          {/* VIEW 4: REVISION QUIZZES & TRIVIA */}
          {activeTab === "challenges" && (
            <div className="space-y-6 animate-fadeIn">
              
              {/* HALL OF FAME PODIUM WIDGET (as shown in Screenshot 4) */}
              <div className="bg-slate-900 border border-slate-850 rounded-2xl p-6 flex flex-col items-center justify-center space-y-6 relative overflow-hidden">
                <div className="absolute top-0 right-1/4 w-32 h-32 bg-pink-500/5 blur-[40px] pointer-events-none" />
                
                <div className="text-center space-y-1">
                  <span className="px-2.5 py-0.5 rounded text-[8px] font-mono tracking-widest bg-pink-500/10 text-pink-400 font-bold uppercase border border-pink-500/20">
                    HALL OF FAME
                  </span>
                  <h3 className="font-sans font-extrabold text-[#D946EF] uppercase text-sm tracking-wide mt-1.5">STAHIZZA ICT PODIUM</h3>
                  <p className="text-[11px] text-slate-410 font-mono max-w-sm">Elite high-school O/A level computer revisions leaderboard</p>
                </div>

                {/* Vertical Podium presentation */}
                <div className="flex items-end justify-center gap-4 sm:gap-6 pt-6 w-full max-w-md select-none">
                  
                  {/* 2nd Place: Jerome */}
                  <div className="flex flex-col items-center space-y-2">
                    <span className="text-2xl">👨🏾‍💻</span>
                    <span className="text-[10px] font-bold text-slate-205">Jerome Maku</span>
                    <div className="w-16 bg-slate-800 border-t border-slate-700 h-16 rounded-t-xl flex flex-col items-center justify-center relative shadow-inner">
                      <span className="text-lg font-bold text-slate-400">2nd</span>
                      <span className="text-[9px] text-slate-500 font-mono">Senior 5</span>
                    </div>
                  </div>

                  {/* 1st Place: Arthur (Highest Column) */}
                  <div className="flex flex-col items-center space-y-2">
                    <span className="text-2xl animate-bounce">👑</span>
                    <span className="text-[10px] font-bold text-pink-400">Kyobe Arthur</span>
                    <div className="w-20 bg-gradient-to-t from-pink-600/20 via-slate-850 to-slate-800 border-t border-pink-500 h-24 rounded-t-xl flex flex-col items-center justify-center relative shadow-lg">
                      <span className="text-xl font-bold text-pink-405">1st</span>
                      <span className="text-[9px] text-pink-300 font-mono">Senior 6</span>
                    </div>
                  </div>

                  {/* 3rd Place: Nabulo */}
                  <div className="flex flex-col items-center space-y-2">
                    <span className="text-2xl">👩🏾‍💻</span>
                    <span className="text-[10px] font-bold text-slate-205">Nabulo Maria</span>
                    <div className="w-16 bg-slate-800 border-t border-slate-700 h-12 rounded-t-xl flex flex-col items-center justify-center relative shadow-inner">
                      <span className="text-lg font-bold text-amber-600">3rd</span>
                      <span className="text-[9px] text-slate-500 font-mono">Senior 3</span>
                    </div>
                  </div>

                </div>
              </div>

              {/* Revision Quests List */}
              <QuestsTrivia
                userProfile={userProfile}
                onGrantXp={handleGrantXp}
                onUnlockBadge={handleUnlockBadge}
              />
            </div>
          )}

          {/* VIEW 5: SUGGESTIONS INDEX */}
          {activeTab === "suggestions" && (
            <SuggestionsHub
              userProfile={userProfile}
              onGrantXp={handleGrantXp}
            />
          )}

          {/* VIEW 6: ACTIVITIES & EVENTS */}
          {activeTab === "activities" && (
            <div className="space-y-6 animate-fadeIn">
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Calendar className="w-5 h-5 text-indigo-400" />
                    <h3 className="font-sans font-semibold text-slate-100 text-sm">Upcoming Activities & Expo</h3>
                  </div>
                  <p className="text-[11px] text-slate-400 font-mono">Term II official calendar detailing hands-on laboratory hackathons and inter-house battles.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {INITIAL_EVENTS.map((evt) => (
                  <div key={evt.id} className="bg-slate-900 border border-slate-800 hover:border-slate-750 p-4 rounded-xl space-y-3 flex flex-col justify-between">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-[10px] font-mono select-none">
                        <span className="bg-indigo-600/15 text-indigo-400 px-2 py-0.5 rounded border border-indigo-500/10 font-bold uppercase tracking-wide">
                          {evt.type}
                        </span>
                        <span>{evt.time}</span>
                      </div>
                      <h4 className="text-slate-200 font-bold text-xs select-text">{evt.title}</h4>
                      <p className="text-[11px] text-slate-400 font-light select-text leading-normal">{evt.description}</p>
                    </div>

                    <div className="pt-2 border-t border-slate-850 space-y-2 text-[10px] font-mono text-slate-500">
                      <p className="flex items-center gap-1.5 text-slate-400">
                        <MapPin className="w-3.5 h-3.5 text-indigo-400" />
                        {evt.location}
                      </p>
                      <button
                        onClick={() => handleGrantXp(10, `RSVP to Event: ${evt.title}`)}
                        className="w-full py-1.5 bg-slate-950 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-350 text-[10px] font-mono rounded font-bold transition-all"
                      >
                        ✓ RSVP / Intend to Attend
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* VIEW 7: CLUB PROJECTS tracking */}
          {activeTab === "projects" && (
            <ProjectsBoard
              userProfile={userProfile}
              onGrantXp={handleGrantXp}
            />
          )}

          {/* VIEW 8: ATTENDANCE SCANNER */}
          {activeTab === "attendance" && (
            <AttendanceView
              userProfile={userProfile}
              onGrantXp={handleGrantXp}
            />
          )}

          {/* VIEW 9: LEARNING ROADMAPS */}
          {activeTab === "roadmap" && (
            <RoadmapView
              userProfile={userProfile}
              onGrantXp={handleGrantXp}
            />
          )}

          {/* VIEW 10: eLIBRARY resources */}
          {activeTab === "resources" && (
            <ResourcesView
              userProfile={userProfile}
              onGrantXp={handleGrantXp}
            />
          )}

          {/* VIEW 11: CODE PLAYGROUND */}
          {activeTab === "playground" && (
            <div className="space-y-6 animate-fadeIn">
              <div>
                <h2 className="text-lg font-bold font-sans text-slate-100">STAHIZZA Visual Sandbox Editor</h2>
                <p className="text-xs text-slate-400 font-mono">Iterate on styling templates, build elements, and verify compilation constraints.</p>
              </div>

              <CodeSandbox
                userProfile={userProfile}
                onGrantXp={handleGrantXp}
                onUnlockBadge={handleUnlockBadge}
              />
            </div>
          )}

          {/* VIEW 12: GAMES LOUNGE */}
          {activeTab === "games" && (
            <GamesLounge
              userProfile={userProfile}
              onGrantXp={handleGrantXp}
            />
          )}

          {/* VIEW 13: PROJECT PORTFOLIO SHOWCASE */}
          {activeTab === "showcase" && (
            <div className="space-y-6 animate-fadeIn">
              <div>
                <h2 className="text-lg font-bold font-sans text-slate-100">Digital Portfolio Publishing</h2>
                <p className="text-xs text-slate-400 font-mono">Present your high school websites and computer algorithm files.</p>
              </div>

              <ProjectShowcase
                userProfile={userProfile}
                onGrantXp={handleGrantXp}
              />
            </div>
          )}

          {/* VIEW 14: PROFILE CONFIGURATION */}
          {activeTab === "profile" && (
            <div className="space-y-6 animate-fadeIn">
              <div>
                <h2 className="text-lg font-bold font-sans text-slate-100">Student Register Configuration</h2>
                <p className="text-xs text-slate-400 font-mono">Edit registration details, customize profile avatars, and review badge medals.</p>
              </div>

              <div className="max-w-2xl">
                <ProfileCard
                  userProfile={userProfile}
                  onUpdateProfile={handleUpdateProfile}
                />
              </div>
            </div>
          )}

        </main>

        {/* SECURE PROFESSIONAL FOOTER CREATER CREDITS */}
        <footer className="bg-slate-950 border-t border-slate-900 py-5 px-6 shrink-0 select-none z-20 font-mono text-[10px] text-slate-500">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <p className="font-semibold text-slate-400">© 2026 Standard High High School Zzana (STAHIZZA) ICT Club.</p>
              <p className="text-slate-600 mt-0.5">Built securely via Express + Vite full-stack node link integrations.</p>
            </div>
            <div className="text-center sm:text-right bg-slate-900/40 border border-slate-900/60 px-3.5 py-2 rounded-xl">
              <span>Recreated & styled by </span>
              <span className="text-pink-400 font-bold hover:text-pink-300">Atamba Joel</span>
            </div>
          </div>
        </footer>

      </div>

    </div>
  );
}
