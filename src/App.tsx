import React, { useState, useEffect } from "react";
import { StudentProfile } from "./types";
import { supabase, isSupabaseConfigured } from "./lib/supabaseClient";
import { fetchProfileFromSupabase, saveProfileToSupabase, fetchProfileByEmail } from "./lib/supabaseSync";
import { useAuth } from "./context/AuthContext";
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
  AlertCircle,
  Sun,
  Moon,
  Image
} from "lucide-react";

// Import modular subcomponents safely
import LiveChat from "./components/LiveChat";
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
import ChallengesPage from "./components/ChallengesPage";
import Leaderboard from "./components/Leaderboard";
import Gallery from "./components/Gallery";

// Import new modular routing pages
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";

export default function App() {
  const { user, loading: authLoading } = useAuth();
  const [currentScreen, setCurrentScreen] = useState<"landing" | "login" | "register" | "app">("landing");

  const [activeTab, setActiveTab] = useState<
    | "dashboard"
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
  >("dashboard");

  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [showAiAlert, setShowAiAlert] = useState<boolean>(true);
  const [challengesSubTab, setChallengesSubTab] = useState<"lounge" | "quizzes" | "leaderboard">("lounge");

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
      name: "Guest Scholar",
      classLevel: "Senior 5",
      xp: 120,
      level: 1,
      unlockedBadges: ["Starter Bit"],
      solvedChallengeIds: [],
      avatarUrl: "",
      rank: "Cadet",
      role: "member"
    };
  });

  const [levelUpMessage, setLevelUpMessage] = useState<string | null>(null);
  const [events, setEvents] = useState<any[]>([]);

  useEffect(() => {
    async function loadEvents() {
      if (!isSupabaseConfigured) return;
      try {
        const { data, error } = await supabase
          .from("club_events")
          .select("*")
          .order("date", { ascending: true });

        if (error || !data || data.length === 0) {
          // Beautiful default list fallback if table doesn't have rows
          setEvents([
            {
              id: "e-1",
              title: "Practical CSS Flexbox & Bento Layouts",
              date: "2026-05-29",
              time: "2:00 PM - 4:00 PM",
              location: "Main Computer Laboratory / Block B",
              description: "A fun, hands-on masterclass led by Senior 5 web mentors. Bring code design ideas, learn alignment, layout design grids, and build bento boxes.",
              type: "Workshop",
              host: "Jerome Maku (President)"
            },
            {
              id: "e-2",
              title: "The S3 Inter-House Code Battle",
              date: "2026-06-03",
              time: "3:30 PM - 5:00 PM",
              location: "Lab Annex A",
              description: "Solve algorithmic computer logic loops and structure high-contrast CSS headers under precise count-down. Compete in Houses to win prestigious trophies and core XP points!",
              type: "Contest",
              host: "STAHIZZA Patron Board"
            },
            {
              id: "e-3",
              title: "Preparatory Session: UNEB Computer Studies Paper 2 Prep",
              date: "2026-06-12",
              time: "2:30 PM - 4:30 PM",
              location: "Multi-media Lab",
              description: "Detailed step-by-step review of standard past papers, spreadsheets design, databases structures, indexing syntax, with tips to gain maximum scores.",
              type: "Meeting",
              host: "Mr. Ronald Mwebesa"
            }
          ]);
        } else {
          setEvents(data.map((e: any) => ({
            id: e.id,
            title: e.title,
            date: e.date,
            time: e.time,
            location: e.location,
            description: e.description,
            type: e.type,
            host: e.host
          })));
        }
      } catch (err) {
        console.error("Failed to load events:", err);
      }
    }
    loadEvents();
  }, []);

  const [theme, setTheme] = useState<"dark" | "light">(() => {
    const saved = localStorage.getItem("theme");
    return (saved === "light" || saved === "dark") ? saved : "dark";
  });

  useEffect(() => {
    localStorage.setItem("theme", theme);
    if (theme === "light") {
      document.documentElement.classList.add("light");
    } else {
      document.documentElement.classList.remove("light");
    }
  }, [theme]);

  const [leaderboard, setLeaderboard] = useState<any[]>([]);

  useEffect(() => {
    async function loadLeaderboard() {
      if (isSupabaseConfigured) {
        try {
          const { fetchLeaderboardFromSupabase } = await import("./lib/supabaseSync");
          const list = await fetchLeaderboardFromSupabase();
          if (list && list.length > 0) {
            const userExists = list.some((u: any) => (u.name || "").toLowerCase() === (userProfile.name || "").toLowerCase());
            let mergedList = [...list];
            if (!userExists && userProfile.name) {
              mergedList.push({
                name: userProfile.name,
                xp: userProfile.xp,
                class_level: userProfile.classLevel || "Senior 5",
                role: userProfile.rank || "Cadet",
                avatar_url: userProfile.avatarUrl || ""
              });
            }
            // Ensure values conform
            const mapped = mergedList.map(u => ({
              name: u.name || "Scholar",
              xp: typeof u.xp === "number" ? u.xp : parseInt(u.xp) || 0,
              class_level: u.class_level || "Standard Scholar",
              role: u.role || "Member",
              avatar_url: u.avatar_url || u.avatar_seed || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(u.name || 'Scholar')}`
            }));
            mapped.sort((a, b) => b.xp - a.xp);
            setLeaderboard(mapped.slice(0, 5));
            return;
          }
        } catch (err) {
          console.error("Failed to load leaderboard from live Supabase:", err);
        }
      }
      
      // Fallback for offline/local mode or if database is empty
      const defaultCompetitors = [
        { name: "Atamba Joel", xp: 2840, class_level: "Senior 6", role: "Mentor", avatar_url: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80" },
        { name: "Jerome K. Maku", xp: 2450, class_level: "Senior 5", role: "President", avatar_url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80" },
        { name: "Kyobe Arthur", xp: 1980, class_level: "Senior 6", role: "VP", avatar_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80" },
        { name: "Nabulo Maria", xp: 1850, class_level: "Senior 3", role: "Designer", avatar_url: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80" },
        { name: "Hakim Kavuma", xp: 1210, class_level: "Senior 6", role: "Member", avatar_url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80" },
        { name: "Namazzi Sandra", xp: 950, class_level: "Senior 2", role: "Member", avatar_url: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150&q=80" }
      ];
      
      let merged = [...defaultCompetitors];
      if (userProfile.name) {
        const index = merged.findIndex(u => u.name.toLowerCase() === userProfile.name.toLowerCase());
        if (index !== -1) {
          merged[index].xp = Math.max(merged[index].xp, userProfile.xp);
          if (userProfile.avatarUrl) {
            merged[index].avatar_url = userProfile.avatarUrl;
          }
        } else {
          merged.push({
            name: userProfile.name,
            xp: userProfile.xp,
            class_level: userProfile.classLevel || "Senior 5",
            role: userProfile.rank || "Cadet",
            avatar_url: userProfile.avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(userProfile.name)}`
          });
        }
      }
      merged.sort((a, b) => b.xp - a.xp);
      setLeaderboard(merged.slice(0, 5));
    }
    loadLeaderboard();
  }, [userProfile.xp, userProfile.name, userProfile.avatarUrl]);

  // Fetch initial profile from Supabase when user changes
  useEffect(() => {
    async function loadDbProfile() {
      if (!isSupabaseConfigured) return;
      if (!user) return;
      const dbProf = await fetchProfileFromSupabase(user.id);
      if (dbProf) {
        setUserProfile(dbProf);
        setCurrentScreen("app");
      } else {
        // Initial insert
        // Derive clean name from student email
        const cleanName = user.email ? user.email.split("@")[0]
          .replace(/[^a-zA-Z0-9]/g, " ")
          .split(" ")
          .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" ") : "Student Scholar";

        const initProfile: StudentProfile = {
          id: user.id,
          name: cleanName,
          classLevel: "Senior 5",
          xp: 120,
          level: 1,
          unlockedBadges: ["Starter Bit"],
          solvedChallengeIds: [],
          avatarUrl: "",
          rank: "Cadet",
          role: "member",
          email: user.email,
        };
        setUserProfile(initProfile);
        await saveProfileToSupabase(initProfile, user.id);
        setCurrentScreen("app");
      }
    }
    loadDbProfile();
  }, [user]);

  // Listen for auth changes to handle automatic routing screens safely
  useEffect(() => {
    if (!authLoading) {
      if (user) {
        setCurrentScreen("app");
      } else if (currentScreen === "app") {
        setCurrentScreen("landing");
      }
    }
  }, [user, authLoading]);

  // Sync profile edits with localStorage & Supabase
  useEffect(() => {
    localStorage.setItem("stahiza_ict_profile", JSON.stringify(userProfile));
    
    if (isSupabaseConfigured && user?.id) {
      saveProfileToSupabase(userProfile, user.id);
    }
  }, [userProfile, user]);

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

  const handleLoginSuccess = async (email: string) => {
    let loadedProfile: StudentProfile | null = null;
    if (isSupabaseConfigured) {
      loadedProfile = await fetchProfileByEmail(email);
    }

    if (loadedProfile) {
      setUserProfile(loadedProfile);
      handleGrantXp(10, "Cloud profile matched & synchronized!");
    } else {
      const cleanName = email.split("@")[0]
        .replace(/[^a-zA-Z0-9]/g, " ")
        .split(" ")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");

      setUserProfile((prev) => ({
        ...prev,
        name: cleanName || prev.name,
        classLevel: "Senior 6",
        role: "member",
        email: email
      }));
      handleGrantXp(10, "Workspace Access Credentials authenticated!");
    }

    setCurrentScreen("app");
    setActiveTab("dashboard");
  };

  const handleRegisterSuccess = (
    name: string,
    email: string,
    classLevel: string,
    avatarUrl: string,
    role: "president" | "cabinet" | "member",
    username?: string,
    bio?: string
  ) => {
    setUserProfile({
      name,
      classLevel,
      xp: 120,
      level: 1,
      unlockedBadges: ["Starter Bit"],
      solvedChallengeIds: [],
      avatarUrl,
      rank: classLevel.includes("Patron") ? "Patron Mentor" : "Cadet",
      role,
      email,
      username: username || email.split("@")[0].replace(/[^a-zA-Z0-9]/g, "").toLowerCase(),
      bio: bio || ""
    });
    handleGrantXp(15, "Created member portal keys successfully!");
    setCurrentScreen("app");
    setActiveTab("dashboard");
  };

  const levelFloorXp = (userProfile.level - 1) * 300;
  const xpInCurrentLevel = userProfile.xp - levelFloorXp;
  const progressPercent = Math.min(100, Math.max(0, (xpInCurrentLevel / 300) * 100));

  // Comprehensive 15 Navigation tabs based on screenshots schema
  const navigationItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, desc: "Personal stats & metrics" },
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
    { id: "gallery", label: "Gallery", icon: Image, desc: "ICT Club Moments & Activities" },
    { id: "profile", label: "Profile", icon: User, desc: "Configure student registers" }
  ];

  if (authLoading && isSupabaseConfigured) {
    return (
      <div className="min-h-screen bg-[#070A13] text-slate-100 flex flex-col items-center justify-center p-4">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500 mx-auto animate-[spin_1s_linear_infinite]"></div>
          <p className="font-mono text-xs text-slate-400">LOADING DIGITAL PORTAL KEYS...</p>
        </div>
      </div>
    );
  }

  if (currentScreen === "landing") {
    return (
      <Landing
        onEnterHub={() => {
          setCurrentScreen("app");
          setActiveTab("dashboard");
        }}
        onNavigateToLogin={() => setCurrentScreen("login")}
        onNavigateToRegister={() => setCurrentScreen("register")}
      />
    );
  }

  if (currentScreen === "login") {
    return (
      <Login
        onLoginSuccess={handleLoginSuccess}
        onNavigateToRegister={() => setCurrentScreen("register")}
        onBackToLanding={() => setCurrentScreen("landing")}
      />
    );
  }

  if (currentScreen === "register") {
    return (
      <Register
        onRegisterSuccess={handleRegisterSuccess}
        onNavigateToLogin={() => setCurrentScreen("login")}
        onBackToLanding={() => setCurrentScreen("landing")}
      />
    );
  }

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
        <div className={`p-4 border-b border-slate-900/60 flex items-center justify-between gap-3 ${sidebarCollapsed ? "justify-center" : ""}`}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-center shrink-0 overflow-hidden">
              <img src="/club-logo.png" className="w-full h-full object-cover" alt="STAHIZZA ICT Logo" referrerPolicy="no-referrer" />
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
          
          {/* Theme Toggle Button */}
          {!sidebarCollapsed && (
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="w-8 h-8 rounded-lg bg-slate-900/50 hover:bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white transition-colors cursor-pointer shrink-0"
              title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {theme === "dark" ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-400" />}
            </button>
          )}
        </div>

        {/* Level Progression Indicator Section in Sidebar */}
        {!sidebarCollapsed && (
          <div className="p-4 border-b border-slate-900/60 bg-[#0B1220]/40 space-y-2">
            <div className="flex items-center gap-2.5">
              <span className="text-xl bg-slate-950 w-8 h-8 rounded-xl flex items-center justify-center border border-slate-800 shrink-0 overflow-hidden">
                {userProfile.avatarUrl ? (
                  <img src={userProfile.avatarUrl} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                  <User className="w-4 h-4 text-slate-400" />
                )}
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
            <div className="flex flex-col items-center gap-3">
              <button
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="w-8 h-8 rounded-lg bg-slate-900/50 hover:bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white transition-colors cursor-pointer shrink-0"
                title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
              >
                {theme === "dark" ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-400" />}
              </button>
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
                <div className="w-8 h-8 bg-slate-950 border border-slate-800 rounded-lg flex items-center justify-center shrink-0 overflow-hidden">
                  <img src="/club-logo.png" className="w-full h-full object-cover" alt="STAHIZZA ICT Logo" referrerPolicy="no-referrer" />
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
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="w-8 h-8 rounded-lg bg-slate-900 hover:bg-slate-800 border border-[#1e293b] flex items-center justify-center text-slate-400 hover:text-white transition-colors cursor-pointer"
              title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {theme === "dark" ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-400" />}
            </button>
            <span className="text-lg bg-slate-900 w-7 h-7 rounded-lg flex items-center justify-center border border-[#1e293b] overflow-hidden">
              {userProfile.avatarUrl ? (
                <img src={userProfile.avatarUrl} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              ) : (
                <User className="w-3.5 h-3.5 text-slate-400" />
              )}
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

          {/* VIEW 0: METRICS STUDENT DASHBOARD */}
          {activeTab === "dashboard" && (
            <Dashboard
              userProfile={userProfile}
              onNavigateToTab={(tab) => {
                setActiveTab(tab as any);
              }}
              onLogout={async () => {
                if (isSupabaseConfigured) {
                  await supabase.auth.signOut();
                }
                setCurrentScreen("landing");
              }}
              onUpdateProfile={handleUpdateProfile}
            />
          )}

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
                      {leaderboard.map((item, idx) => (
                        <div key={idx} className={`flex items-center justify-between ${idx > 0 ? "border-t border-slate-950 pt-1.5" : ""}`}>
                          <span className="text-slate-400">{idx + 1}. {item?.name || "Member"}</span>
                          <span className="text-pink-400 font-bold">{(item?.xp || 0).toLocaleString()} XP</span>
                        </div>
                      ))}
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
                <p className="text-xs text-slate-400 font-mono">Collaborate live with peer scholars & cabinets in real-time. No manual refresh needed.</p>
              </div>

              <div className="min-h-[680px]">
                <LiveChat userProfile={userProfile} />
              </div>
            </div>
          )}

          {/* VIEW 4: REVISION QUIZZES & TRIVIA */}
          {activeTab === "challenges" && (
            <div className="space-y-6 animate-fadeIn">
              
              {/* Header section with sub-tab switcher */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-900 pb-4">
                <div>
                  <h2 className="text-base sm:text-lg font-sans font-extrabold text-slate-100 uppercase tracking-tight flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-pink-500" />
                    STAHIZZA Revision & Challenges
                  </h2>
                  <p className="text-[11px] text-slate-400 font-mono">Complete O/A-Level computer syllabus revisions and compete in live challenges</p>
                </div>
                
                <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-900 select-none self-start sm:self-auto font-sans text-xs">
                  <button
                    onClick={() => setChallengesSubTab("lounge")}
                    className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                      challengesSubTab === "lounge"
                        ? "bg-pink-500 text-white shadow-md shadow-pink-950/15"
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    🏆 Challenges
                  </button>
                  <button
                    onClick={() => setChallengesSubTab("quizzes")}
                    className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                      challengesSubTab === "quizzes"
                        ? "bg-pink-500 text-white shadow-md shadow-pink-950/15"
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    🧠 Quizzes
                  </button>
                  <button
                    onClick={() => setChallengesSubTab("leaderboard")}
                    className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                      challengesSubTab === "leaderboard"
                        ? "bg-pink-500 text-white shadow-md shadow-pink-950/15"
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    👑 Leaderboard
                  </button>
                </div>
              </div>

              {challengesSubTab === "lounge" ? (
                <ChallengesPage
                  userProfile={userProfile}
                  onGrantXp={handleGrantXp}
                  onUnlockBadge={handleUnlockBadge}
                />
              ) : challengesSubTab === "leaderboard" ? (
                <Leaderboard
                  userProfile={userProfile}
                />
              ) : (
                <div className="space-y-6 animate-fadeIn">
                  {/* HALL OF FAME PODIUM WIDGET (as shown in Screenshot 4) */}
                  <div className="bg-slate-900 border border-slate-850 rounded-2xl p-6 flex flex-col items-center justify-center space-y-6 relative overflow-hidden">
                    <div className="absolute top-0 right-1/4 w-32 h-32 bg-pink-500/5 blur-[40px] pointer-events-none" />
                    
                    <div className="text-center space-y-1">
                      <span className="px-2.5 py-0.5 rounded text-[8px] font-mono tracking-widest bg-pink-500/10 text-pink-400 font-bold uppercase border border-pink-500/20">
                        HALL OF FAME
                      </span>
                      <h3 className="font-sans font-extrabold text-[#D946EF] uppercase text-sm tracking-wide mt-1.5">STAHIZZA ICT PODIUM</h3>
                      <p className="text-[11px] text-slate-400 font-mono max-w-sm">Standard high-school O/A level computer revisions leaderboard</p>
                    </div>

                    {/* Vertical Podium presentation */}
                    {(() => {
                      const firstPlace = leaderboard[0] || { name: "Awaiting Quizzer", xp: 0, class_level: "Standard Scholar", avatar_url: "" };
                      const secondPlace = leaderboard[1] || { name: "Open Slot", xp: 0, class_level: "Standard Scholar", avatar_url: "" };
                      const thirdPlace = leaderboard[2] || { name: "Open Slot", xp: 0, class_level: "Standard Scholar", avatar_url: "" };

                      return (
                        <div className="flex items-end justify-center gap-4 sm:gap-6 pt-6 w-full max-w-md select-none">
                          {/* 2nd Place */}
                          <div className="flex flex-col items-center space-y-2">
                            {secondPlace.avatar_url ? (
                              <img src={secondPlace.avatar_url} className="w-10 h-10 rounded-full border border-slate-700 object-cover shadow-md ring-2 ring-slate-800/50" alt="" referrerPolicy="no-referrer" />
                            ) : (
                              <span className="text-2xl">👨🏾‍💻</span>
                            )}
                            <span className="text-[10px] font-bold text-slate-200 text-center truncate max-w-[100px]" title={secondPlace.name}>
                              {secondPlace.name}
                            </span>
                            <div className="w-16 bg-slate-800 border-t border-slate-700 h-16 rounded-t-xl flex flex-col items-center justify-center relative shadow-inner">
                              <span className="text-lg font-bold text-slate-400">2nd</span>
                              <span className="text-[9px] text-slate-500 font-mono">
                                {secondPlace.xp ? `${secondPlace.xp} XP` : secondPlace.class_level}
                              </span>
                            </div>
                          </div>

                          {/* 1st Place */}
                          <div className="flex flex-col items-center space-y-2">
                            <div className="relative">
                              {firstPlace.avatar_url ? (
                                <img src={firstPlace.avatar_url} className="w-12 h-12 rounded-full border-2 border-pink-500 object-cover shadow-lg ring-4 ring-pink-500/20" alt="" referrerPolicy="no-referrer" />
                              ) : (
                                <span className="text-3xl animate-bounce">👑</span>
                              )}
                              {firstPlace.avatar_url && (
                                <span className="absolute -top-3.5 -right-1 text-base drop-shadow-md animate-bounce">👑</span>
                              )}
                            </div>
                            <span className="text-[10px] font-bold text-pink-400 text-center truncate max-w-[120px]" title={firstPlace.name}>
                              {firstPlace.name}
                            </span>
                            <div className="w-20 bg-gradient-to-t from-pink-600/20 via-slate-850 to-slate-800 border-t border-pink-500 h-24 rounded-t-xl flex flex-col items-center justify-center relative shadow-lg">
                              <span className="text-xl font-bold text-pink-400">1st</span>
                              <span className="text-[9px] text-pink-300 font-mono">
                                {firstPlace.xp ? `${firstPlace.xp} XP` : firstPlace.class_level}
                              </span>
                            </div>
                          </div>

                          {/* 3rd Place */}
                          <div className="flex flex-col items-center space-y-2">
                            {thirdPlace.avatar_url ? (
                              <img src={thirdPlace.avatar_url} className="w-10 h-10 rounded-full border border-slate-700 object-cover shadow-md ring-2 ring-slate-800/50" alt="" referrerPolicy="no-referrer" />
                            ) : (
                              <span className="text-2xl">👩🏾‍💻</span>
                            )}
                            <span className="text-[10px] font-bold text-slate-200 text-center truncate max-w-[100px]" title={thirdPlace.name}>
                              {thirdPlace.name}
                            </span>
                            <div className="w-16 bg-slate-800 border-t border-slate-700 h-12 rounded-t-xl flex flex-col items-center justify-center relative shadow-inner">
                              <span className="text-lg font-bold text-amber-600">3rd</span>
                              <span className="text-[9px] text-slate-500 font-mono">
                                {thirdPlace.xp ? `${thirdPlace.xp} XP` : thirdPlace.class_level}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                  </div>

                  {/* Revision Quests List */}
                  <QuestsTrivia
                    userProfile={userProfile}
                    onGrantXp={handleGrantXp}
                    onUnlockBadge={handleUnlockBadge}
                  />
                </div>
              )}
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
                {events.map((evt) => (
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

          {/* VIEW 15: GALLERY MODULE */}
          {activeTab === "gallery" && (
            <div className="space-y-6 animate-fadeIn">
              <Gallery
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
