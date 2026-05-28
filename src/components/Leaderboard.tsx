import React, { useState, useEffect } from "react";
import { 
  Trophy, 
  Search, 
  Award, 
  Filter, 
  RefreshCw, 
  User, 
  TrendingUp, 
  Sparkles, 
  Star,
  Users,
  ChevronRight,
  Shield,
  Clock,
  IdCard
} from "lucide-react";
import { supabase, isSupabaseConfigured } from "../lib/supabaseClient";
import { StudentProfile } from "../types";

interface LeaderboardProps {
  userProfile: StudentProfile;
}

interface LeaderboardUser {
  rank: number;
  id?: string;
  name: string;
  username: string;
  xp: number;
  level: number;
  class_level: string;
  role: string | "Member" | "President" | "VP" | "Mentor" | "Designer";
  avatar_url: string;
  email?: string;
  bio?: string;
  created_at?: string;
}

export default function Leaderboard({ userProfile }: LeaderboardProps) {
  const [users, setUsers] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedClass, setSelectedClass] = useState<string>("All");
  const [selectedUser, setSelectedUser] = useState<LeaderboardUser | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);

  // Fallback default list
  const defaultCompetitors: LeaderboardUser[] = [
    { rank: 1, name: "Atamba Joel", username: "joel", xp: 2840, level: 6, class_level: "Senior 6", role: "Mentor", avatar_url: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80", bio: "Fullstack Leader & Cadet Mentor. Specializes in advanced systems design and web infrastructure." },
    { rank: 2, name: "Jerome K. Maku", username: "jerome", xp: 2450, level: 5, class_level: "Senior 5", role: "President", avatar_url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80", bio: "STAHIZZA ICT President. Avid fan of responsive designs, secure APIs, and relational databases." },
    { rank: 3, name: "Kyobe Arthur", username: "arthur", xp: 1980, level: 4, class_level: "Senior 6", role: "VP", avatar_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80", bio: "Systems VP and hardware laboratory supervisor. Keeping the servers up and the terminals clean." },
    { rank: 4, name: "Nabulo Maria", username: "maria", xp: 1850, level: 4, class_level: "Senior 3", role: "Designer", avatar_url: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80", bio: "Visual creative and class representative. Passionate about SVG rendering, graphic styling, and typography." },
    { rank: 5, name: "Hakim Kavuma", username: "hakim", xp: 1210, level: 3, class_level: "Senior 6", role: "Member", avatar_url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80", bio: "O-Level revision expert. Always studying algorithm structures and hardware networking setups." },
    { rank: 6, name: "Namazzi Sandra", username: "sandra", xp: 950, level: 2, class_level: "Senior 2", role: "Member", avatar_url: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150&q=80", bio: "Keen design critic. Working through basic computer systems and word wrap exercises." }
  ];

  useEffect(() => {
    async function loadAllUsers() {
      setLoading(true);
      try {
        if (isSupabaseConfigured) {
          const { data, error } = await supabase
            .from("profiles")
            .select("*")
            .order("xp", { ascending: false });

          if (data && data.length > 0 && !error) {
            // Check if current user is represented, if not we add them locally to the view
            const userExists = data.some(
              (u: any) => (u.full_name || "").toLowerCase() === (userProfile.name || "").toLowerCase()
            );
            
            let mergedList = [...data];
            if (!userExists && userProfile.name) {
              mergedList.push({
                full_name: userProfile.name,
                username: userProfile.username || "me",
                xp: userProfile.xp,
                level: userProfile.level || 1,
                class_level: userProfile.classLevel || "Senior 5",
                role: userProfile.rank || "member",
                avatar_url: userProfile.avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(userProfile.name)}`,
                bio: userProfile.bio || "Active STAHIZZA scholar studying O/A Level computer coursework."
              });
            }

            // Map and rank all users
            const formatted: LeaderboardUser[] = mergedList
              .map((p: any) => ({
                id: p.id,
                name: p.full_name || p.username || "Standard Scholar",
                username: p.username || "scholar",
                xp: typeof p.xp === "number" ? p.xp : parseInt(p.xp) || 0,
                level: p.level || 1,
                class_level: p.class_level || "Senior 5",
                role: p.role || "Member",
                avatar_url: p.avatar_url || p.avatar_seed || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(p.full_name || p.username || 'Scholar')}`,
                email: p.email,
                bio: p.bio || "Dedicated ICT Club scholar and quiz competitor.",
                created_at: p.created_at
              }))
              .sort((a, b) => b.xp - a.xp)
              .map((user, idx) => ({ ...user, rank: idx + 1 }));

            setUsers(formatted);
            setLoading(false);
            return;
          }
        }
      } catch (err) {
        console.error("Failed to load user list from live Supabase database:", err);
      }

      // Offline / Local storage / Database missing fallback path
      let localMerged = [...defaultCompetitors];
      if (userProfile.name) {
        const index = localMerged.findIndex(u => u.name.toLowerCase() === userProfile.name.toLowerCase());
        if (index !== -1) {
          localMerged[index].xp = Math.max(localMerged[index].xp, userProfile.xp);
          if (userProfile.avatarUrl) {
            localMerged[index].avatar_url = userProfile.avatarUrl;
          }
        } else {
          localMerged.push({
            rank: 0,
            name: userProfile.name,
            username: userProfile.username || "me",
            xp: userProfile.xp,
            level: userProfile.level || 1,
            class_level: userProfile.classLevel || "Senior 5",
            role: userProfile.rank || "Member",
            avatar_url: userProfile.avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(userProfile.name)}`,
            bio: userProfile.bio || "Active STAHIZZA scholar studying O/A Level computer coursework."
          });
        }
      }

      const finalLocalList = localMerged
        .sort((a, b) => b.xp - a.xp)
        .map((user, idx) => ({ ...user, rank: idx + 1 }));

      setUsers(finalLocalList);
      setLoading(false);
    }

    loadAllUsers();
  }, [refreshTrigger, userProfile.xp, userProfile.name, userProfile.avatarUrl]);

  // Unique lists of classes for secondary filtering header
  const classLevels = ["All", "Senior 1", "Senior 2", "Senior 3", "Senior 4", "Senior 5", "Senior 6"];

  // Perform search and dropdown filters
  const filteredUsers = users.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          u.role.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesClass = selectedClass === "All" || u.class_level.toLowerCase().includes(selectedClass.toLowerCase());
    
    return matchesSearch && matchesClass;
  });

  const topThree = users.slice(0, 3);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Visual podium section for the overall top 3 players */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-slate-900 border border-slate-850 rounded-2xl p-6 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 blur-[40px] pointer-events-none" />
          <div className="absolute bottom-0 left-10 w-24 h-24 bg-pink-500/5 blur-[30px] pointer-events-none" />
          
          <div className="space-y-1.5 z-10">
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-indigo-400" />
              <span className="px-2 py-0.5 rounded text-[8px] font-mono tracking-widest bg-indigo-500/10 text-indigo-300 font-bold uppercase border border-indigo-500/20">
                ACTIVE CHAMPIONSHIPS
              </span>
            </div>
            <h3 className="font-sans font-extrabold text-slate-100 uppercase text-sm tracking-normal mt-2">STAHIZZA ICT ALL-STARS</h3>
            <p className="text-[11px] text-slate-400 font-mono leading-relaxed max-w-sm">
              Live student achievements dashboard compiling point statistics, test ranks, and revision completion benchmarks across all terms.
            </p>
          </div>

          <div className="mt-6 flex items-end justify-around border-t border-slate-800/80 pt-6">
            {/* 2nd place in top stats widget */}
            {topThree[1] && (
              <div className="flex flex-col items-center text-center">
                <div className="relative">
                  <img 
                    src={topThree[1].avatar_url} 
                    className="w-10 h-10 rounded-full border border-slate-700 object-cover shadow-md"
                    alt="" 
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute -bottom-1 -right-1 bg-slate-800 rounded-full w-5 h-5 flex items-center justify-center border border-slate-700">
                    <span className="text-[9px] font-bold text-slate-300">2</span>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-slate-200 mt-2 truncate w-20">
                  {topThree[1].name.split(" ")[0]}
                </span>
                <span className="text-[9px] text-slate-400 font-mono font-medium">{topThree[1].xp} XP</span>
              </div>
            )}

            {/* 1st place in top stats widget */}
            {topThree[0] && (
              <div className="flex flex-col items-center text-center">
                <div className="relative">
                  <img 
                    src={topThree[0].avatar_url} 
                    className="w-14 h-14 rounded-full border-2 border-pink-500 object-cover shadow-lg ring-4 ring-pink-500/15"
                    alt="" 
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-sm drop-shadow animate-bounce">👑</div>
                  <div className="absolute -bottom-1 -right-1 bg-pink-500 rounded-full w-6 h-6 flex items-center justify-center border border-slate-900 shadow">
                    <span className="text-[10px] font-black text-white">1</span>
                  </div>
                </div>
                <span className="text-[11px] font-extrabold text-pink-400 mt-2 truncate w-24">
                  {topThree[0].name}
                </span>
                <span className="text-[10px] text-pink-300 font-mono font-bold">{topThree[0].xp} XP</span>
              </div>
            )}

            {/* 3rd place in top stats widget */}
            {topThree[2] && (
              <div className="flex flex-col items-center text-center">
                <div className="relative">
                  <img 
                    src={topThree[2].avatar_url} 
                    className="w-10 h-10 rounded-full border border-slate-700 object-cover shadow-md"
                    alt="" 
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute -bottom-1 -right-1 bg-slate-800 rounded-full w-5 h-5 flex items-center justify-center border border-slate-700">
                    <span className="text-[9px] font-bold text-amber-600">3</span>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-slate-200 mt-2 truncate w-20">
                  {topThree[2].name.split(" ")[0]}
                </span>
                <span className="text-[9px] text-slate-400 font-mono font-medium">{topThree[2].xp} XP</span>
              </div>
            )}
          </div>
        </div>

        {/* Selected student breakdown panel */}
        <div className="bg-slate-900 border border-slate-850 rounded-2xl p-6 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute bottom-0 right-0 w-32 h-32 bg-slate-800/10 rounded-full blur-2xl pointer-events-none" />
          {selectedUser ? (
            <div className="space-y-4 animate-fadeIn flex flex-col justify-between h-full">
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <img 
                      src={selectedUser.avatar_url} 
                      className="w-12 h-12 rounded-xl object-cover border border-slate-800 shadow-md" 
                      alt=""
                      referrerPolicy="no-referrer"
                    />
                    <div>
                      <h4 className="text-sm font-bold text-slate-100 flex items-center gap-1.5">
                        {selectedUser.name}
                        {selectedUser.rank <= 3 && <Star className="w-3.5 h-3.5 text-pink-500 fill-pink-500" />}
                      </h4>
                      <p className="text-[10px] text-slate-400 font-mono uppercase tracking-wider">{selectedUser.role} • {selectedUser.class_level}</p>
                    </div>
                  </div>
                  <span className="text-xl font-mono text-indigo-400 font-black">#{selectedUser.rank}</span>
                </div>

                <div className="p-3 bg-slate-950 border border-slate-800/60 rounded-xl space-y-2">
                  <div className="flex items-center gap-1.5 text-slate-300 text-[11px] font-mono">
                    <IdCard className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Bio:</span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed font-sans font-medium">
                    {selectedUser.bio}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-3">
                <div className="bg-slate-950 border border-slate-850 p-2.5 rounded-xl text-center">
                  <span className="text-[9px] text-slate-500 font-mono block uppercase">Level Milestone</span>
                  <span className="text-base font-black text-slate-200 font-mono">Level {selectedUser.level}</span>
                </div>
                <div className="bg-slate-950 border border-slate-850 p-2.5 rounded-xl text-center">
                  <span className="text-[9px] text-slate-500 font-mono block uppercase">Total Accumulation</span>
                  <span className="text-base font-black text-pink-500 font-mono">{selectedUser.xp} XP</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center p-6 text-center h-full space-y-3 border border-dashed border-slate-800 rounded-xl bg-slate-950/20 select-none">
              <div className="w-12 h-12 rounded-full bg-slate-950 flex items-center justify-center border border-slate-850 text-slate-400">
                <Users className="w-5 h-5 text-slate-500" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-200">ROSTER DETAILS</h4>
                <p className="text-[10px] text-slate-400 font-mono max-w-[200px] mt-1">
                  Click on any classmate in the register below to reveal their active curriculum bios and progress milestones!
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Roster Controls and Search Panel */}
      <div className="bg-slate-900 border border-slate-850 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 sm:p-5 border-b border-slate-850 bg-slate-900/60 backdrop-blur-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h3 className="text-xs sm:text-sm font-extrabold text-slate-200 uppercase tracking-tight flex items-center gap-2">
              <Award className="w-4 h-4 text-pink-500" />
              STAHIZZA REGISTRATION MASTER SCOREBOARD
            </h3>
            
            <button
              onClick={() => setRefreshTrigger(p => p + 1)}
              className="px-2.5 py-1 text-[10px] uppercase font-mono tracking-wider font-bold bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 rounded-lg flex items-center gap-1.5 transition-all self-start sm:self-auto cursor-pointer"
            >
              <RefreshCw className={`w-3 h-3 ${loading ? "animate-spin" : ""}`} />
              <span>Sync Live Database</span>
            </button>
          </div>

          <div className="flex flex-col md:flex-row gap-3">
            {/* Search inputs */}
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search classmates by name, username or roles..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-200 placeholder-slate-500 outline-none focus:border-indigo-500 transition-all font-medium"
              />
            </div>

            {/* Filter by class buttons scrollable list */}
            <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-850 overflow-x-auto scrollbar-none select-none max-w-full">
              {classLevels.map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => setSelectedClass(lvl)}
                  className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase transition-all whitespace-nowrap cursor-pointer ${
                    selectedClass === lvl
                      ? "bg-indigo-600 text-white shadow"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Leaderboard user list */}
        {loading ? (
          <div className="p-12 text-center space-y-3">
            <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin mx-auto" />
            <p className="text-xs text-slate-400 font-mono">Retrieving scholar achievements from Supabase clusters...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-12 text-center space-y-1 bg-slate-950/20">
            <User className="w-8 h-8 text-slate-600 mx-auto stroke-1" />
            <p className="text-xs font-bold text-slate-400">No class records matching query</p>
            <p className="text-[10px] text-slate-500 font-mono">Verify spelling or select another Class Level filter option above.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-850 bg-slate-950/40 text-[9px] text-slate-500 font-mono uppercase tracking-wider">
                  <th className="py-3 px-4 font-bold text-center w-14">Rank</th>
                  <th className="py-3 px-4 font-bold">Student Scholar</th>
                  <th className="py-3 px-4 font-bold text-center">Class Level</th>
                  <th className="py-3 px-4 font-bold">Role & Rank</th>
                  <th className="py-3 px-4 font-bold text-right pr-6">Level</th>
                  <th className="py-3 px-4 font-bold text-right pr-6">Activity (XP)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850 font-sans">
                {filteredUsers.map((user) => {
                  const isCurrentUser = (user.name || "").toLowerCase() === (userProfile.name || "").toLowerCase();
                  return (
                    <tr 
                      key={user.rank}
                      onClick={() => setSelectedUser(user)}
                      className={`group hover:bg-slate-800/40 transition-colors cursor-pointer text-xs ${
                        isCurrentUser ? "bg-pink-500/5 hover:bg-pink-500/10 border-l-2 border-pink-500" : ""
                      }`}
                    >
                      {/* Rank Column */}
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center font-mono">
                          {user.rank === 1 ? (
                            <span className="w-5 h-5 rounded-full bg-pink-500 text-white font-black flex items-center justify-center text-[10px] shadow-sm shadow-pink-900/10 uppercase">
                              1
                            </span>
                          ) : user.rank === 2 ? (
                            <span className="w-5 h-5 rounded-full bg-slate-700 text-slate-100 font-bold flex items-center justify-center text-[10px] uppercase">
                              2
                            </span>
                          ) : user.rank === 3 ? (
                            <span className="w-5 h-5 rounded-full bg-amber-800/60 text-amber-200 font-bold flex items-center justify-center text-[10px] uppercase">
                              3
                            </span>
                          ) : (
                            <span className="text-[11px] font-bold text-slate-400 group-hover:text-slate-200">
                              {user.rank}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* User Column */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <img 
                            src={user.avatar_url} 
                            className="w-8 h-8 rounded-full border border-slate-800 object-cover shrink-0 filter brightness-95 group-hover:brightness-100 transition-all" 
                            alt="" 
                            referrerPolicy="no-referrer"
                          />
                          <div>
                            <p className="font-bold text-slate-200 group-hover:text-slate-100 flex items-center gap-1.5 leading-snug">
                              {user.name}
                              {isCurrentUser && (
                                <span className="text-[8px] bg-pink-500/15 text-pink-400 uppercase tracking-widest px-1.5 py-0.5 rounded border border-pink-500/30 font-mono font-bold">
                                  YOU
                                </span>
                              )}
                            </p>
                            <p className="text-[10px] text-slate-500 font-mono">@{user.username}</p>
                          </div>
                        </div>
                      </td>

                      {/* Class level Column */}
                      <td className="py-3 px-4 text-center font-mono text-slate-300">
                        {user.class_level}
                      </td>

                      {/* Role & status Column */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5">
                          {user.role.toLowerCase() === "president" || user.role.toLowerCase() === "vp" || user.role.toLowerCase() === "mentor" ? (
                            <Shield className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                          ) : (
                            <User className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                          )}
                          <span className="text-slate-300 font-medium capitalize">{user.role}</span>
                        </div>
                      </td>

                      {/* Milestone Level Column */}
                      <td className="py-3 px-4 text-right pr-6 font-mono text-slate-400 group-hover:text-slate-300 font-medium">
                        Lv. {user.level}
                      </td>

                      {/* Real XP Column */}
                      <td className="py-3 px-4 text-right pr-6 font-mono font-bold text-indigo-400 group-hover:text-pink-400 transition-colors">
                        {user.xp.toLocaleString()} XP
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
