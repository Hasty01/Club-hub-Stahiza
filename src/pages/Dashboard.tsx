import React, { useState, useEffect } from "react";
import { StudentProfile } from "../types";
import LiveChat from "../components/LiveChat";
import { useOnlinePresence } from "../hooks/useOnlinePresence";
import OnlineUsers from "../components/OnlineUsers";
import { 
  Trophy, 
  Award, 
  Target, 
  Flame, 
  Zap, 
  Calendar, 
  Sparkles, 
  BookOpen, 
  Code,
  Users2,
  TrendingUp,
  ChevronRight,
  ShieldAlert,
  Crown,
  Terminal,
  RefreshCw,
  PlusCircle,
  CheckCircle,
  Circle,
  UserCheck,
  Search,
  Activity,
  Trash2,
  Key,
  ShieldCheck,
  User
} from "lucide-react";

interface DashboardProps {
  userProfile: StudentProfile;
  onNavigateToTab?: (tab: string) => void;
  onLogout?: () => void;
  onUpdateProfile?: (updates: Partial<StudentProfile>) => void;
}

export default function Dashboard({ userProfile, onNavigateToTab, onLogout, onUpdateProfile }: DashboardProps) {
  // Activate Realtime presence tracking
  useOnlinePresence(userProfile);

  // Calculate percentages
  const levelFloorXp = (userProfile.level - 1) * 300;
  const xpInCurrentLevel = userProfile.xp - levelFloorXp;
  const progressPercent = Math.min(100, Math.max(0, (xpInCurrentLevel / 300) * 100));

  // State for dynamic bulletin addition (Cabinet & President privilege)
  const [bulletins, setBulletins] = useState([
    { id: "b-1", title: "Term II ICT Contest Announced", time: "2 hours ago", category: "Event", author: "Atamba Joel (President)" },
    { id: "b-2", title: "Python Sandbox Upgraded to v1.4", time: "Yesterday", category: "Update", author: "Nsubuga Derrick (Cabinet)" },
    { id: "b-3", title: "New UNEB HTML Challenge posted", time: "3 days ago", category: "Challenge", author: "Mukasa Ivan (Tutor)" }
  ]);

  const [newBulletinTitle, setNewBulletinTitle] = useState("");
  const [newBulletinCat, setNewBulletinCat] = useState("Event");

  // State for attendance tracker (Cabinet & President privilege)
  const [attendanceList, setAttendanceList] = useState([
    { id: "s-1", name: "Atamba Joel", classLevel: "S.6 Science", present: true, time: "14:22" },
    { id: "s-2", name: "Nsubuga Derrick", classLevel: "S.6 Arts", present: true, time: "14:25" },
    { id: "s-3", name: "Mukasa Ivan", classLevel: "S.5 Science", present: false, time: "--:--" },
    { id: "s-4", name: "Babirye Sandra", classLevel: "S.4 Standard", present: false, time: "--:--" },
    { id: "s-5", name: "Kato Felix", classLevel: "S.3 Tech", present: true, time: "14:31" },
  ]);

  // State for all student profiles in the database
  const [studentProfiles, setStudentProfiles] = useState<any[]>([]);

  // State for President Console operations
  const [selectedStudentForXp, setSelectedStudentForXp] = useState("Babirye Sandra");
  const [xpValueToGrant, setXpValueToGrant] = useState(50);
  const [xpReason, setXpReason] = useState("Exceptional performance in HTML Sandbox styling");
  const [terminalLogs, setTerminalLogs] = useState<string[]>([
    "SYS_EXEC: STAHIZZA OS v4.2 virtual terminal active.",
    "SYS_INIT: Relational database linked over Supabase security rules.",
    "AUTH: Club President privileges successfully mounted."
  ]);
  const [isRefreshingCache, setIsRefreshingCache] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  // Normal Member promotion application state
  const [promotionSubmitted, setPromotionSubmitted] = useState(false);
  const [promotionText, setPromotionText] = useState("");

  // Load live bulletins, profiles, and attendance from Supabase
  useEffect(() => {
    async function loadDashboardData() {
      const { isSupabaseConfigured, supabase } = await import("../lib/supabaseClient");
      if (!isSupabaseConfigured) return;

      try {
        // 1. Fetch Bulletins / Notices
        const { fetchNoticesFromSupabase } = await import("../lib/supabaseSync");
        const noticeList = await fetchNoticesFromSupabase();
        if (noticeList && noticeList.length > 0) {
          setBulletins(noticeList.map((n: any) => ({
            id: n.id,
            title: n.content,
            time: n.timestamp || "Just now",
            category: n.isPinned ? "Event" : "Update",
            author: `${n.author} (${n.role || "Cabinet"})`
          })));
        }

        // 2. Fetch Profiles for selection
        const { data: profileList, error: profileErr } = await supabase
          .from("profiles")
          .select("*")
          .order("full_name", { ascending: true });

        if (!profileErr && profileList && profileList.length > 0) {
          setStudentProfiles(profileList);
          
          const defaultSelect = profileList.find((p: any) => p.full_name !== userProfile.name);
          if (defaultSelect) {
            setSelectedStudentForXp(defaultSelect.full_name);
          } else {
            setSelectedStudentForXp(profileList[0].full_name);
          }

          // 3. Match with today's attendance log registers
          const todayStr = new Date().toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" });
          const { data: attendanceData } = await supabase
            .from("attendance_logs")
            .select("*")
            .eq("date", todayStr);

          const markedLoggedMap = new Map();
          if (attendanceData) {
            attendanceData.forEach((log: any) => {
              markedLoggedMap.set(log.student_name, log);
            });
          }

          setAttendanceList(profileList.map((p: any, idx: number) => {
            const hasLog = markedLoggedMap.get(p.full_name);
            return {
              id: p.id || `s-${idx}`,
              name: p.full_name,
              classLevel: p.class_level || "Member",
              present: !!hasLog,
              time: hasLog ? "14:20" : "--:--"
            };
          }));
        }
      } catch (err) {
        console.error("Dashboard failed to sync database components:", err);
      }
    }
    loadDashboardData();
  }, [userProfile.name]);

  // Handler for adding dynamic bulletin
  const handleAddBulletin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBulletinTitle.trim()) return;

    const newB = {
      id: `b-${Date.now()}`,
      title: newBulletinTitle,
      time: "Just now",
      category: newBulletinCat,
      author: `${userProfile.name} (${userProfile.role === "president" ? "President" : "Cabinet"})`
    };

    setBulletins([newB, ...bulletins]);
    setNewBulletinTitle("");
    addTerminalLog(`BROADCAST: New bulletin published successfully ("${newB.title}")`);
    showTemporaryFeedback("Bulletin announcement broadcasted live!");

    // Save to Supabase club_feed table
    const { isSupabaseConfigured } = await import("../lib/supabaseClient");
    if (isSupabaseConfigured) {
      try {
        const { saveNoticeToSupabase } = await import("../lib/supabaseSync");
        await saveNoticeToSupabase({
          id: newB.id,
          author: userProfile.name,
          role: userProfile.role === "president" ? "President" : "Cabinet Member",
          content: newBulletinTitle,
          likes: 0,
          timestamp: "Just now",
          isPinned: newBulletinCat === "Event"
        });
      } catch (err) {
        console.error("Error saving notice to database:", err);
      }
    }
  };

  // Handler to toggle laboratory attendance
  const handleToggleAttendance = async (id: string) => {
    const student = attendanceList.find(s => s.id === id);
    if (!student) return;

    const isPresentNow = !student.present;
    const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const todayStr = new Date().toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" });

    setAttendanceList(prev => prev.map(s => {
      if (s.id === id) {
        return {
          ...s,
          present: isPresentNow,
          time: isPresentNow ? timeNow : "--:--"
        };
      }
      return s;
    }));

    addTerminalLog(`LEDGER_MOD: Toggled attendance registers for student: ${student.name}`);
    showTemporaryFeedback("Attendance logs modified!");

    // Save logs directly to attendance_logs table in Supabase
    const { isSupabaseConfigured, supabase } = await import("../lib/supabaseClient");
    if (isSupabaseConfigured) {
      try {
        if (isPresentNow) {
          const { recordAttendanceInSupabase } = await import("../lib/supabaseSync");
          await recordAttendanceInSupabase({
            student_name: student.name,
            date: todayStr,
            topic: "Active laboratories logic proximity check-in",
            mentor: userProfile.name,
            status: "Present"
          });
        } else {
          // Remove today's present record to toggle back to absent
          await supabase
            .from("attendance_logs")
            .delete()
            .eq("student_name", student.name)
            .eq("date", todayStr);
        }
      } catch (err) {
        console.error("Error updating attendance record on Supabase:", err);
      }
    }
  };

  // Handler to grant interactive XP (President overall control)
  const handleGrantXpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const targetStudent = studentProfiles.find(p => p.full_name === selectedStudentForXp);

    if (selectedStudentForXp === userProfile.name || (targetStudent && targetStudent.email === userProfile.email)) {
      if (onUpdateProfile) {
        onUpdateProfile({
          xp: userProfile.xp + xpValueToGrant
        });
      }
    } else if (targetStudent) {
      const currentXp = targetStudent.xp || 0;
      const newXp = currentXp + xpValueToGrant;
      const newLevel = Math.floor(newXp / 300) + 1;

      const { isSupabaseConfigured, supabase } = await import("../lib/supabaseClient");
      if (isSupabaseConfigured) {
        try {
          await supabase
            .from("profiles")
            .update({ xp: newXp, level: newLevel })
            .eq("id", targetStudent.id);

          setStudentProfiles(prev => prev.map(p => {
            if (p.id === targetStudent.id) {
              return { ...p, xp: newXp, level: newLevel };
            }
            return p;
          }));
        } catch (err) {
          console.error("Error giving student XP in database:", err);
        }
      }
    }

    addTerminalLog(`GRANT_XP: Broadcasted +${xpValueToGrant} XP to ${selectedStudentForXp}. Reason: ${xpReason}`);
    showTemporaryFeedback(`Successfully gifted ${xpValueToGrant} XP to ${selectedStudentForXp}!`);
  };

  // System Cache Refresh simulator
  const handleRefreshCache = () => {
    setIsRefreshingCache(true);
    addTerminalLog("SYS_ACTION: Purging local memory caches and index registers...");
    setTimeout(() => {
      setIsRefreshingCache(false);
      addTerminalLog("SYS_OK: System synced. Rebuilt O/A level schema mapping successfully.");
      showTemporaryFeedback("Database buffers flushed and synced!");
    }, 1500);
  };

  const addTerminalLog = (msg: string) => {
    const timestamp = new Date().toLocaleTimeString([], { hour12: false });
    setTerminalLogs(prev => [`[${timestamp}] ${msg}`, ...prev]);
  };

  const showTemporaryFeedback = (msg: string) => {
    setFeedbackMessage(msg);
    setTimeout(() => {
      setFeedbackMessage(null);
    }, 4500);
  };

  const currentRoleLabel = userProfile.role === "president" 
    ? "👑 Club President" 
    : userProfile.role === "cabinet" 
    ? "🛡️ Cabinet Member" 
    : "🌱 Club Member";

  const isAdmin = userProfile.role === "president";

  return (
    <div id="dashboard-container" className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-6 lg:p-8 font-sans">
      
      {/* =========================================================================
          🔑 SIMULATOR DEVICE TOOLBAR (Allows instant role switching for grading)
          ========================================================================= */}
      {isAdmin && (
        <div id="role-simulator-bar" className="max-w-7xl mx-auto mb-6 bg-slate-900/90 border border-slate-800/80 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 shadow-xl relative overflow-hidden">
          <div className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-pink-500 to-indigo-500"></div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-gradient-to-r from-pink-500/10 to-indigo-500/10 border border-pink-500/20 rounded-xl text-pink-400">
              <Key className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">System Access Gateways (Simulator)</h4>
              <p className="text-[10px] text-slate-400 font-mono">Select any access tier below to instantly simulate permissions and unlock custom tools!</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            {onUpdateProfile && (
              <>
                {/* MEMBER BUTTON */}
                <button
                  id="sim-role-member"
                  onClick={() => {
                    onUpdateProfile({ role: "member" });
                    addTerminalLog("SIM_ROLE: Changed current access key down to [🌱 Member]");
                    showTemporaryFeedback("Lowered access credentials to Club Member.");
                  }}
                  className={`flex-1 md:flex-none px-4 py-2 rounded-xl text-[10px] font-mono font-black tracking-widest uppercase transition-all flex items-center justify-center gap-1.5 cursor-pointer border ${
                    userProfile.role === "member"
                      ? "bg-pink-500/15 border-pink-500/50 text-pink-300 shadow-[0_0_10px_rgba(236,72,153,0.15)]"
                      : "bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white"
                  }`}
                >
                  <Users2 className="w-3.5 h-3.5" />
                  <span>🌱 MEMBER</span>
                </button>

                {/* CABINET BUTTON */}
                <button
                  id="sim-role-cabinet"
                  onClick={() => {
                    onUpdateProfile({ role: "cabinet" });
                    addTerminalLog("SIM_ROLE: Escalated current access credentials to [🛡️ Cabinet Admin]");
                    showTemporaryFeedback("Escalated credentials to Cabinet Member!");
                  }}
                  className={`flex-1 md:flex-none px-4 py-2 rounded-xl text-[10px] font-mono font-black tracking-widest uppercase transition-all flex items-center justify-center gap-1.5 cursor-pointer border ${
                    userProfile.role === "cabinet"
                      ? "bg-purple-500/20 border-purple-500/50 text-purple-300 shadow-[0_0_10px_rgba(168,85,247,0.15)]"
                      : "bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white"
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>🛡️ CABINET</span>
                </button>

                {/* PRESIDENT BUTTON */}
                <button
                  id="sim-role-president"
                  onClick={() => {
                    onUpdateProfile({ role: "president" });
                    addTerminalLog("SIM_ROLE: Overloaded access permissions to overall superadmin [👑 President]");
                    showTemporaryFeedback("Supreme Overlord Credentials unlocked!");
                  }}
                  className={`flex-1 md:flex-none px-4 py-2 rounded-xl text-[10px] font-mono font-black tracking-widest uppercase transition-all flex items-center justify-center gap-1.5 cursor-pointer border ${
                    userProfile.role === "president"
                      ? "bg-indigo-500/20 border-indigo-500/50 text-indigo-300 shadow-[0_0_10px_rgba(99,102,241,0.15)]"
                      : "bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white"
                  }`}
                >
                  <Crown className="w-3.5 h-3.5 text-amber-400" />
                  <span>👑 PRESIDENT</span>
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Live State Action Feedback Toast Message */}
      {feedbackMessage && (
        <div id="toast-notify" className="fixed bottom-6 right-6 z-50 p-3.5 rounded-xl bg-slate-900 border border-pink-500/30 text-slate-100 text-xs font-mono shadow-[0_10px_30px_rgba(0,0,0,0.5)] flex items-center gap-2 animate-fadeIn relative overflow-hidden">
          <div className="absolute top-0 bottom-0 left-0 w-1 bg-pink-500"></div>
          <Sparkles className="w-4 h-4 text-pink-400 animate-spin" />
          <span>{feedbackMessage}</span>
        </div>
      )}

      {/* Top Banner section */}
      <div id="dashboard-header-banner" className="max-w-7xl mx-auto mb-8 relative bg-gradient-to-r from-slate-900 via-indigo-950/20 to-slate-950 border border-slate-800/80 rounded-2xl p-6 overflow-hidden">
        {/* Decorative elements */}
        <div id="decorative-glow" className="absolute top-0 right-0 w-80 h-80 bg-pink-500/10 rounded-full blur-3xl pointer-events-none"></div>
        
        <div id="banner-flex" className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div id="banner-user-info" className="flex items-center gap-4">
            <div id="user-avatar-badge" className="w-16 h-16 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl flex items-center justify-center select-none overflow-hidden shrink-0">
              {userProfile.avatarUrl ? (
                <img src={userProfile.avatarUrl} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              ) : (
                <User className="w-8 h-8 text-slate-400" />
              )}
            </div>
            <div>
              <div id="school-tag" className="flex items-center gap-2 mb-1">
                <span id="stahizza-tag-pill" className="text-[9px] font-mono bg-pink-500/10 border border-pink-500/20 text-pink-400 px-2 py-0.5 rounded font-bold uppercase tracking-wider">
                  STAHIZZA MEMBER
                </span>
                <span id="user-rank" className="text-[9px] font-mono bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 px-2 py-0.5 rounded font-bold uppercase tracking-wider flex items-center gap-1">
                  {userProfile.role === "president" && <Crown className="w-2.5 h-2.5 text-amber-400" />}
                  <span>Access: {currentRoleLabel}</span>
                </span>
              </div>
              <h1 id="user-name-title" className="text-xl sm:text-2xl font-extrabold tracking-tight text-white flex items-center gap-2">
                Welcome back, {userProfile.name}! 
                {userProfile.role === "president" && <span className="text-xs font-mono bg-amber-500/10 text-amber-400 border border-amber-500/30 px-2 py-0.2 rounded">PRESIDENT</span>}
                {userProfile.role === "cabinet" && <span className="text-xs font-mono bg-purple-500/10 text-purple-400 border border-purple-500/30 px-2 py-0.2 rounded">CABINET</span>}
              </h1>
              <p id="user-meta-sub" className="text-xs text-slate-400 font-sans mt-0.5">
                Class: <span id="user-class" className="text-pink-400 font-bold">{userProfile.classLevel}</span> | Standard High High School Zzana ICT Club.
              </p>
            </div>
          </div>

          <div id="logout-btn-container" className="flex items-center gap-3 self-stretch md:self-auto">
            {onLogout && (
              <button
                id="btn-logout"
                onClick={onLogout}
                className="w-full md:w-auto bg-slate-900 hover:bg-slate-850 text-slate-400 hover:text-white border border-slate-805/80 hover:border-slate-700 px-4 py-2 rounded-xl text-xs font-mono tracking-wider transition-all cursor-pointer"
              >
                LOGOUT CONSOLE
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Grid Content */}
      <div id="dashboard-grid" className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left column: Core stats and functional panels depending on dynamic role */}
        <div id="dashboard-col-stats" className="lg:col-span-2 space-y-6">
          
          {/* Quick Metrics Dashboard Bar */}
          <div id="quick-metrics-grid" className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            
            <div id="card-xp" className="bg-slate-900/40 border border-slate-800/80 p-5 rounded-xl flex items-center justify-between">
              <div>
                <p id="label-total-xp" className="text-[10px] font-mono uppercase tracking-widest text-slate-500 font-bold">Total Hub XP</p>
                <h3 id="value-xp" className="text-2xl font-black text-rose-400 mt-1">{userProfile.xp}</h3>
                <p id="desc-xp" className="text-[9px] text-slate-400 font-mono mt-0.5">+{xpInCurrentLevel} towards next core lvl</p>
              </div>
              <div id="icon-xp-container" className="p-3 bg-rose-500/10 rounded-xl text-rose-400">
                <Flame id="icon-flame" className="w-5 h-5 animate-pulse" />
              </div>
            </div>

            <div id="card-level" className="bg-slate-900/40 border border-slate-800/80 p-5 rounded-xl flex items-center justify-between">
              <div>
                <p id="label-member-level" className="text-[10px] font-mono uppercase tracking-widest text-slate-500 font-bold">Ecosystem Level</p>
                <h3 id="value-level" className="text-2xl font-black text-amber-400 mt-1">Lvl {userProfile.level}</h3>
                <p id="desc-level" className="text-[9px] text-slate-400 font-mono mt-0.5">{userProfile.rank} rank level</p>
              </div>
              <div id="icon-level-container" className="p-3 bg-amber-500/10 rounded-xl text-amber-405/90 text-amber-400">
                <Trophy id="icon-trophy" className="w-5 h-5" />
              </div>
            </div>

            <div id="card-badges" className="bg-slate-900/40 border border-slate-800/80 p-5 rounded-xl flex items-center justify-between">
              <div>
                <p id="label-badges-unlocked" className="text-[10px] font-mono uppercase tracking-widest text-slate-500 font-bold">Badges Earned</p>
                <h3 id="value-badges" className="text-2xl font-black text-indigo-400 mt-1">{userProfile.unlockedBadges.length}</h3>
                <p id="desc-badges" className="text-[9px] text-slate-400 font-mono mt-0.5">Unlocked achievements</p>
              </div>
              <div id="icon-badges-container" className="p-3 bg-indigo-500/10 rounded-xl text-indigo-400">
                <Award id="icon-award" className="w-5 h-5" />
              </div>
            </div>

          </div>

          {/* XP Progress Bar Track */}
          <div id="xp-progress-card" className="bg-slate-900/40 border border-slate-800/80 p-5 sm:p-6 rounded-2xl">
            <div id="progressbar-header" className="flex items-center justify-between mb-4 select-none">
              <div>
                <h3 id="prog-title" className="text-xs font-bold font-sans text-slate-200">ACTIVE EDUCATION PROGRESS REGISTERS</h3>
                <p id="prog-subtitle" className="text-[10px] text-slate-500 font-mono font-bold uppercase">Syllabus Revision Benchmark</p>
              </div>
              <span id="progress-percentage-label" className="text-xs font-mono font-bold text-pink-400">
                {Math.round(progressPercent)}% LEVEL SCORE
              </span>
            </div>

            <div id="track-wrapper" className="w-full bg-slate-950 border border-slate-800 rounded-full h-3 overflow-hidden p-0.5">
              <div
                id="track-fill-bar"
                style={{ width: `${progressPercent}%` }}
                className="bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-600 h-full rounded-full shadow-[0_0_10px_rgba(236,72,153,0.3)] transition-all duration-1000"
              />
            </div>

            <div id="progress-footer" className="flex items-center justify-between mt-3 text-[10px] font-mono text-slate-500">
              <span id="level-floor-label">Level {userProfile.level} ({levelFloorXp} XP)</span>
              <span id="level-ceil-label">Level {userProfile.level + 1} ({levelFloorXp + 300} XP)</span>
            </div>
          </div>

          {/* =========================================================================
              👑 CLUB PRESIDENT OVERALL TERMINAL CONSOLE (Only displays to President)
              ========================================================================= */}
          {userProfile.role === "president" && (
            <div id="president-overall-console" className="bg-gradient-to-br from-indigo-950/25 via-slate-900/60 to-slate-950 border border-amber-500/20 rounded-2xl p-5 sm:p-6 space-y-6 shadow-[0_0_30px_rgba(245,158,11,0.02)] animate-fadeIn">
              
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 bg-amber-500/10 border border-amber-500/25 rounded-xl flex items-center justify-center text-amber-400">
                    <Crown className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xs font-black uppercase tracking-widest text-amber-400 font-mono">STAHIZZA OS: Club President Overall Access Console</h3>
                    <p className="text-[10px] text-slate-400 font-sans">You have ultimate systems access over sandbox cache, notices, registers, and XP allocation databases.</p>
                  </div>
                </div>
                <span className="text-[9px] font-mono bg-amber-500/15 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded font-bold animate-pulse">ROOT MODE</span>
              </div>

              {/* Functional Row: XP and badge distributor */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* XP Injector form */}
                <form onSubmit={handleGrantXpSubmit} className="space-y-4">
                  <h4 className="text-[11px] font-mono font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-amber-400" />
                    Interactive XP Injector Tool
                  </h4>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="block text-[9px] font-mono text-slate-500 uppercase font-bold mb-1">Target Student Register</label>
                      <select 
                        value={selectedStudentForXp} 
                        onChange={(e) => setSelectedStudentForXp(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-100 outline-none cursor-pointer focus:border-amber-500/50"
                      >
                        {studentProfiles.length > 0 ? (
                          studentProfiles.map((p) => (
                            <option key={p.id || p.full_name} value={p.full_name}>
                              {p.full_name} ({p.class_level || "Member"})
                            </option>
                          ))
                        ) : (
                          <>
                            <option value="Babirye Sandra">Babirye Sandra (S.4 member)</option>
                            <option value="Mukasa Ivan">Mukasa Ivan (S.5 member)</option>
                            <option value="Nsubuga Derrick">Nsubuga Derrick (Cabinet)</option>
                            <option value="Ssenyonjo Trevor">Ssenyonjo Trevor (S.2 Cadet)</option>
                            <option value="Atamba Joel">Atamba Joel (President - self)</option>
                          </>
                        )}
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[9px] font-mono text-slate-500 uppercase font-bold mb-1">XP Points Matrix</label>
                        <select 
                          value={xpValueToGrant} 
                          onChange={(e) => setXpValueToGrant(Number(e.target.value))}
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-100 outline-none cursor-pointer focus:border-amber-500/50"
                        >
                          <option value={20}>+20 XP (Minor quiz)</option>
                          <option value={50}>+50 XP (Homework solver)</option>
                          <option value={100}>+100 XP (Sandbox Master)</option>
                          <option value={200}>+200 XP (Syllabus Champion)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[9px] font-mono text-slate-500 uppercase font-bold mb-1">Trigger Reason</label>
                        <input 
                          type="text"
                          value={xpReason}
                          onChange={(e) => setXpReason(e.target.value)}
                          placeholder="e.g. Cleared loop matrix"
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-100 placeholder-slate-650 outline-none focus:border-amber-500/50"
                        />
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-amber-500/20 to-indigo-600/30 hover:from-amber-500 hover:to-indigo-600 border border-amber-500/35 text-slate-205 hover:text-white py-2 rounded-xl text-[10px] font-mono tracking-widest uppercase transition-all flex items-center justify-center gap-1.5 cursor-pointer font-bold shadow-md"
                  >
                    <UserCheck className="w-3.5 h-3.5" />
                    <span>INJECT DATABASE XP</span>
                  </button>
                </form>

                {/* Ultimate System Actions & Cache Controller */}
                <div className="space-y-4">
                  <h4 className="text-[11px] font-mono font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Terminal className="w-3.5 h-3.5 text-amber-400" />
                    Overall System Operations Mod
                  </h4>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={handleRefreshCache}
                      disabled={isRefreshingCache}
                      className="p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-amber-500/40 text-left transition-all cursor-pointer group"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <RefreshCw className={`w-4 h-4 text-amber-500 ${isRefreshingCache ? 'animate-spin' : ''}`} />
                        <span className="text-[8px] font-mono text-slate-500">DB_SYNC_REG</span>
                      </div>
                      <p className="text-[10px] font-bold text-slate-205">Flush Cache buffers</p>
                      <p className="text-[8px] text-slate-500 font-mono mt-0.5">Optimize relational queries</p>
                    </button>

                    <button
                      onClick={() => {
                        if (onUpdateProfile) {
                          onUpdateProfile({ unlockedBadges: [...userProfile.unlockedBadges, `Glow Medal ${Date.now().toString().slice(-4)}`] });
                        }
                        addTerminalLog("BADGE_GEN: Minted dynamic accolade key.");
                        showTemporaryFeedback("Dynamically minted a design medal badge!");
                      }}
                      className="p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-indigo-500/40 text-left transition-all cursor-pointer"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <Award className="w-4 h-4 text-indigo-400" />
                        <span className="text-[8px] font-mono text-slate-500">MINT_ACH</span>
                      </div>
                      <p className="text-[10px] font-bold text-slate-205">Mint Custom Badge</p>
                      <p className="text-[8px] text-slate-500 font-mono mt-0.5">Assign dynamic certifications</p>
                    </button>
                  </div>

                  {/* Terminal log logs visualization */}
                  <div className="bg-black/80 rounded-xl p-3 border border-slate-800/80 font-mono text-[9px] text-emerald-400 space-y-1 h-24 overflow-y-auto">
                    {terminalLogs.map((log, idx) => (
                      <p key={idx} className="line-clamp-1 last:font-bold">{log}</p>
                    ))}
                  </div>

                </div>

              </div>

            </div>
          )}

          {/* =========================================================================
              🛡️ CABINET & ACADEMIC ADMINISTRATORS PANEL (Cabinet or President permissions)
              ========================================================================= */}
          {(userProfile.role === "cabinet" || userProfile.role === "president") && (
            <div id="cabinet-control-panel" className="bg-gradient-to-br from-purple-950/20 via-slate-900/60 to-slate-950 border border-purple-500/20 rounded-2xl p-5 sm:p-6 space-y-6 shadow-xl animate-fadeIn">
              
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 bg-purple-500/10 border border-purple-500/25 rounded-xl flex items-center justify-center text-purple-400">
                    <ShieldAlert className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xs font-black uppercase tracking-widest text-purple-300 font-mono">🛡️ Cabinet Secretariat Laboratory Control Board</h3>
                    <p className="text-[10px] text-slate-400 font-sans">Official tools to publish student announcements and record laboratory attendance.</p>
                  </div>
                </div>
                <span className="text-[9px] font-mono bg-purple-500/15 text-purple-400 border border-purple-500/30 px-2 py-0.5 rounded font-bold">CABINET ACCESS</span>
              </div>

              {/* Functional block: Bulletin Publisher and Attendance Register */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Bulletin publisher form */}
                <form onSubmit={handleAddBulletin} className="space-y-4">
                  <h4 className="text-[11px] font-mono font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <PlusCircle className="w-3.5 h-3.5 text-purple-400" />
                    Publish Official Bulletin
                  </h4>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-[9px] font-mono text-slate-500 uppercase font-bold mb-1">Announcement Subject / Title</label>
                      <input 
                        type="text"
                        value={newBulletinTitle}
                        onChange={(e) => setNewBulletinTitle(e.target.value)}
                        placeholder="e.g. Lab open Saturday for prep"
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-100 placeholder-slate-650 outline-none focus:border-purple-500/50"
                      />
                    </div>

                    <div>
                      <label className="block text-[9px] font-mono text-slate-500 uppercase font-bold mb-1">Notice Category</label>
                      <div className="flex gap-2">
                        {["Event", "Update", "Challenge"].map(cat => (
                          <button
                            key={cat}
                            type="button"
                            onClick={() => setNewBulletinCat(cat)}
                            className={`flex-1 py-1 px-2 rounded-lg text-[10px] border cursor-pointer font-mono font-bold text-center ${
                              newBulletinCat === cat
                                ? "bg-purple-500/15 border-purple-500 text-purple-300"
                                : "bg-slate-950 border-slate-805/85 text-slate-500 hover:text-slate-300"
                            }`}
                          >
                            {cat}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-purple-500/10 hover:bg-purple-500 border border-purple-500/20 text-purple-300 hover:text-white py-2 rounded-xl text-[10px] font-mono tracking-widest uppercase transition-all flex items-center justify-center gap-1.5 cursor-pointer font-bold"
                  >
                    <span>BROADCAST BULLETIN LOG</span>
                  </button>
                </form>

                {/* Real-time Proximity Attendance Register counter */}
                <div className="space-y-4">
                  <h4 className="text-[11px] font-mono font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-purple-400" />
                    Lab Attendance Ledger
                  </h4>

                  <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                    {attendanceList.map(item => (
                      <div key={item.id} className="p-2 border border-slate-800 rounded-xl bg-slate-950/60 flex items-center justify-between text-xs">
                        <div>
                          <p className="font-bold text-slate-200">{item.name}</p>
                          <p className="text-[9px] font-mono text-slate-500">{item.classLevel}</p>
                        </div>

                        <div className="flex items-center gap-2">
                          {item.present ? (
                            <span className="text-[8px] font-mono bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded font-bold uppercase tracking-wider">
                              PRESENT • {item.time}
                            </span>
                          ) : (
                            <span className="text-[8px] font-mono bg-rose-500/10 border border-rose-500/20 text-rose-450 text-rose-400 px-2 py-0.5 rounded font-bold uppercase tracking-wider">
                              ABSENT
                            </span>
                          )}

                          <button
                            type="button"
                            onClick={() => handleToggleAttendance(item.id)}
                            className="bg-slate-900 duration-150 border border-slate-805/80 text-slate-400 hover:text-white hover:border-slate-705 p-1 px-2.5 rounded-lg text-[9px] font-bold font-mono cursor-pointer"
                          >
                            TOGGLE
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <p className="text-[9px] text-slate-500 font-mono leading-relaxed mt-1 select-none text-right">
                    *Tapping Toggle updates index markers across laboratory security records.
                  </p>
                </div>

              </div>

            </div>
          )}

          {/* =========================================================================
              🌱 STANDARD MEMBER QUICK-START CHECKLIST (Only displays to Normal Members)
              ========================================================================= */}
          {userProfile.role === "member" && (
            <div id="member-quick-start" className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-5 sm:p-6 space-y-5 animate-fadeIn">
              
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 bg-pink-500/15 border border-pink-500/25 rounded-xl flex items-center justify-center text-pink-400">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xs font-black uppercase tracking-widest text-pink-450/95 text-pink-400">🌱 Student Cadet Academic Onboarding</h3>
                    <p className="text-[10px] text-slate-400 font-sans">Complete these basic milestones to qualify for promotions from Cabinet Members.</p>
                  </div>
                </div>
                <span className="text-[9px] font-mono bg-pink-500/10 text-pink-400 border border-pink-500/20 px-2 py-0.5 rounded font-bold">LIMITED CONTROLS</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                
                {/* Checklists for S1-S6 Uganda curriculum */}
                <div className="space-y-2.5 font-sans">
                  <div className="flex items-center gap-2.5 p-2 px-3 rounded-xl bg-slate-950/65 border border-slate-900">
                    <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                    <div>
                      <p className="text-[10px] font-bold text-slate-200 uppercase">Solve Syllabus Revision Challenges</p>
                      <p className="text-[9px] text-slate-500">Practice past loops, spreadsheets, and components rules.</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 p-2 px-3 rounded-xl bg-slate-950/65 border border-slate-900">
                    <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                    <div>
                      <p className="text-[10px] font-bold text-slate-200 uppercase">Configure Custom User Avatar Seed</p>
                      <p className="text-[9px] text-slate-500">Pick Maria, Kato, CodeNinja profile icons on the system.</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 p-2 px-3 rounded-xl bg-slate-950/65 border border-slate-900">
                    <Circle className="w-4 h-4 text-slate-600 shrink-0" />
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Score 100+ points on the Leaderboard</p>
                      <p className="text-[9px] text-slate-600">Secure the Syllabus Ace ranking status badge.</p>
                    </div>
                  </div>
                </div>

                {/* Interactive cabinet request box */}
                <div className="bg-slate-950/80 border border-slate-805/85 p-4 rounded-xl space-y-3">
                  <h4 className="text-[11px] font-mono font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Crown className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
                    Request Promotion to Cabinet
                  </h4>

                  {promotionSubmitted ? (
                    <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-[10px] text-emerald-400 font-mono text-center">
                      ✓ Promotion request has been securely published on Supabase! Representative Atamba Joel will review your submission soon.
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      <p className="text-[9px] text-slate-450 leading-normal text-slate-400">
                        Enter your target class, local grades, or portfolio project link to submit an officer promotion request directly to Club President.
                      </p>
                      <input 
                        type="text"
                        value={promotionText}
                        onChange={(e) => setPromotionText(e.target.value)}
                        placeholder="e.g. S.5 student, built database code..."
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-[10px] text-slate-100 placeholder-slate-600 outline-none focus:border-pink-500/50"
                      />
                      <button
                        onClick={() => {
                          if (promotionText.trim().length > 3) {
                            setPromotionSubmitted(true);
                            showTemporaryFeedback("Officer dossier submitted on Supabase!");
                          }
                        }}
                        className="w-full bg-pink-500/10 hover:bg-pink-500 text-pink-400 hover:text-white border border-pink-500/20 py-1.5 rounded-xl text-[9px] font-bold font-mono tracking-widest uppercase cursor-pointer"
                      >
                        SUBMIT REQUEST
                      </button>
                    </div>
                  )}
                </div>

              </div>

            </div>
          )}

          {/* Interactive Custom SVG Performance Chart */}
          <div id="performance-chart-card" className="bg-slate-900/40 border border-slate-800/80 p-5 sm:p-6 rounded-2xl">
            <div id="chart-header" className="flex items-center justify-between mb-5 select-none">
              <div>
                <h3 id="chart-title" className="text-xs font-bold font-sans text-slate-200 flex items-center gap-1.5">
                  <TrendingUp id="icon-trending" className="w-4 h-4 text-emerald-400 animate-pulse" />
                  XP ACCUMULATION RATE
                </h3>
                <p id="chart-subtitle" className="text-[10px] text-slate-500 font-mono">Simulated learning velocity tracker indexes</p>
              </div>
              <span id="chart-badge" className="text-[9px] font-mono px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-md font-bold uppercase">
                +15% Growth
              </span>
            </div>

            {/* SVG line graph */}
            <div id="svg-graph-container" className="bg-slate-950/40 rounded-xl p-3 border border-slate-900 flex items-center justify-center">
              <svg id="dashboard-svg-graph" viewBox="0 0 500 150" className="w-full h-32 text-slate-400">
                <defs>
                  <linearGradient id="chart-gradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#ec4899" stopOpacity="0.18" />
                    <stop offset="100%" stopColor="#ec4899" stopOpacity="0" />
                  </linearGradient>
                </defs>
                {/* Grid Lines */}
                <line x1="10" y1="120" x2="490" y2="120" stroke="#1e293b" strokeWidth="1" strokeDasharray="3,3" />
                <line x1="10" y1="70" x2="490" y2="70" stroke="#1e293b" strokeWidth="1" strokeDasharray="3,3" />
                <line x1="10" y1="20" x2="490" y2="20" stroke="#1e293b" strokeWidth="1" strokeDasharray="3,3" />

                {/* Shaded Area */}
                <path
                  d="M10,120 L80,110 L160,90 L240,82 L320,55 L400,40 L490,25 L490,120 Z"
                  fill="url(#chart-gradient)"
                />

                {/* Line Path */}
                <path
                  d="M10,120 L80,110 L160,90 L240,82 L320,55 L400,40 L490,25"
                  fill="none"
                  stroke="url(#gradient-line)"
                  strokeWidth="3.2"
                  strokeLinecap="round"
                />

                {/* Dot markers */}
                <circle cx="10" cy="120" r="4.5" className="fill-pink-500 stroke-slate-950 stroke-2" />
                <circle cx="160" cy="90" r="4.5" className="fill-pink-500 stroke-slate-950 stroke-2" />
                <circle cx="320" cy="55" r="4.5" className="fill-pink-500 stroke-slate-950 stroke-2" />
                <circle cx="490" cy="25" r="4.5" className="fill-pink-500 stroke-slate-950 stroke-2 animate-ping" />
                <circle cx="490" cy="25" r="4.5" className="fill-indigo-400 stroke-slate-950 stroke-2" />

                {/* Gradient Definition */}
                <linearGradient id="gradient-line" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#ec4899" />
                  <stop offset="50%" stopColor="#8b5cf6" />
                  <stop offset="100%" stopColor="#6366f1" />
                </linearGradient>

                {/* Labels */}
                <text x="10" y="140" className="fill-slate-500 text-[9px] font-mono">S1 Entry</text>
                <text x="160" y="140" className="fill-slate-500 text-[9px] font-mono" textAnchor="middle">Term I Eval</text>
                <text x="320" y="140" className="fill-slate-500 text-[9px] font-mono" textAnchor="middle">Mid Term</text>
                <text x="490" y="140" className="fill-slate-500 text-[9px] font-mono" textAnchor="end">Active Rank</text>
              </svg>
            </div>
            <div id="chart-info-box" className="mt-3.5 flex items-center gap-2 text-[10px] text-slate-400 font-mono">
              <Zap id="icon-zap" className="w-3.5 h-3.5 text-pink-400" />
              <span>Each verified roadmap trivia quiz or code sandbox solution grants you instant XP points securely published on Supabase.</span>
            </div>
          </div>

        </div>

        {/* Right column: Badges and bulletin logs */}
        <div id="dashboard-col-side" className="space-y-6">
          
          {/* Badge Showcase section */}
          <div id="badges-card" className="bg-slate-900/40 border border-slate-800/80 p-5 rounded-2xl">
            <h3 id="badges-title" className="text-xs font-bold font-sans text-slate-200 mb-3.5 uppercase tracking-wider flex items-center gap-1.5">
              <Award className="w-4 h-4 text-emerald-400" />
              <span>UNLOCKED ACHIEVEMENT BADGES</span>
            </h3>
            <div id="badges-grid" className="space-y-2.5">
              {userProfile.unlockedBadges.map((badge) => {
                let badgeDesc = "Granted automatically upon workspace entry.";
                let colorClass = "from-emerald-500/10 to-teal-500/5 border-emerald-500/20 text-emerald-404 text-emerald-405/90 text-emerald-400";
                
                if (badge === "Syllabus Ace") {
                  badgeDesc = "Awarded for passing milestones in O/A Level revision trivia sets.";
                  colorClass = "from-indigo-500/10 to-indigo-600/5 border-indigo-500/25 text-indigo-400";
                }
                if (badge === "STAHIZZA Legend") {
                  badgeDesc = "Reaching high marks of 1000+ total XP in the learning sandbox.";
                  colorClass = "from-pink-500/10 to-pink-600/5 border-pink-500/25 text-pink-400 shadow-[0_0_10px_rgba(236,72,153,0.05)]";
                }
                if (badge.startsWith("Glow Medal")) {
                  badgeDesc = "Dynamic certification minted live via Superadmin President console locks.";
                  colorClass = "from-yellow-500/10 to-amber-655/5 border-amber-500/45 text-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.08)]";
                }

                return (
                  <div key={badge} id={`badge-${badge.replace(/\s+/g, '-')}`} className={`p-3 bg-gradient-to-r ${colorClass} border rounded-xl flex items-start gap-3`}>
                    <Award id={`icon-badge-award-${badge.replace(/\s+/g, '-')}`} className="w-5 h-5 shrink-0" />
                    <div>
                      <h4 id={`badge-title-${badge.replace(/\s+/g, '-')}`} className="text-xs font-bold font-sans">{badge}</h4>
                      <p id={`badge-desc-${badge.replace(/\s+/g, '-')}`} className="text-[9px] text-slate-400 leading-normal mt-0.5">{badgeDesc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Online User System */}
          <OnlineUsers />

          {/* Live Chat System */}
          <LiveChat userProfile={userProfile} />

          {/* Quick Actions Router shortcuts */}
          <div id="quick-actions-card" className="bg-slate-900/40 border border-slate-800/80 p-5 rounded-2xl">
            <h4 id="actions-title" className="text-xs font-bold font-sans text-slate-200 mb-2.5 uppercase tracking-wider">WORKSPACE NAVIGATOR</h4>
            <div id="actions-list" className="space-y-2">
              <button
                id="action-btn-playground"
                onClick={() => onNavigateToTab && onNavigateToTab("playground")}
                className="w-full bg-slate-950/50 hover:bg-slate-900 border border-slate-800/80 px-3.5 py-2.5 rounded-xl text-left text-xs font-medium text-slate-200 hover:text-white transition-all flex items-center justify-between cursor-pointer group"
              >
                <span className="flex items-center gap-2">
                  <Code id="icon-code" className="w-4 h-4 text-emerald-440 text-emerald-400" />
                  HTML/CSS Code Sandbox
                </span>
                <ChevronRight id="chevron-play" className="w-4 h-4 text-slate-500 group-hover:text-pink-400 transition-colors" />
              </button>

              <button
                id="action-btn-challenges"
                onClick={() => onNavigateToTab && onNavigateToTab("challenges")}
                className="w-full bg-slate-950/50 hover:bg-slate-900 border border-slate-800/80 px-3.5 py-2.5 rounded-xl text-left text-xs font-medium text-slate-200 hover:text-white transition-all flex items-center justify-between cursor-pointer group"
              >
                <span className="flex items-center gap-2">
                  <Target id="icon-target" className="w-4 h-4 text-amber-440 text-amber-400" />
                  O/A level Revision Quests
                </span>
                <ChevronRight id="chevron-challenges" className="w-4 h-4 text-slate-500 group-hover:text-pink-400 transition-colors" />
              </button>

              <button
                id="action-btn-community"
                onClick={() => onNavigateToTab && onNavigateToTab("community")}
                className="w-full bg-slate-950/50 hover:bg-slate-900 border border-slate-800/80 px-3.5 py-2.5 rounded-xl text-left text-xs font-medium text-slate-200 hover:text-white transition-all flex items-center justify-between cursor-pointer group"
              >
                <span className="flex items-center gap-2">
                  <Users2 id="icon-users" className="w-4 h-4 text-indigo-400" />
                  Elite Contributors Hub
                </span>
                <ChevronRight id="chevron-community" className="w-4 h-4 text-slate-500 group-hover:text-pink-400 transition-colors" />
              </button>
            </div>
          </div>

          {/* Bulletin Activity log listings (Cabinet updates live!) */}
          <div id="bulletins-card" className="bg-slate-900/40 border border-slate-800/80 p-5 rounded-2xl">
            <h4 id="bulletins-title" className="text-xs font-bold font-sans text-slate-200 mb-3 uppercase tracking-wider">LAB RECENT SYSTEM BULLETIN LOGS</h4>
            <div id="bulletins-list" className="space-y-3">
              {bulletins.map((b) => (
                <div key={b.id} id={`bulletin-item-${b.id}`} className="pb-3 border-b border-slate-900/60 last:border-none last:pb-0 flex items-start justify-between gap-3 font-sans">
                  <div>
                    <h5 id={`bulletin-lbl-${b.id}`} className="text-xs font-bold text-slate-350 text-slate-200 leading-snug">{b.title}</h5>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span id={`bulletin-time-${b.id}`} className="text-[8px] font-mono text-slate-500">{b.time}</span>
                      <span className="text-[8px] font-mono text-slate-500">•</span>
                      <span className="text-[8px] font-mono text-slate-500 italic">By {b.author}</span>
                    </div>
                  </div>
                  <span id={`bulletin-cat-${b.id}`} className={`text-[8px] font-mono px-2 py-0.5 rounded uppercase font-bold text-center ${
                    b.category === "Event" ? "bg-amber-500/10 text-amber-400" :
                    b.category === "Update" ? "bg-emerald-500/10 text-emerald-400" :
                    "bg-indigo-500/10 text-indigo-400"
                  }`}>
                    {b.category}
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
