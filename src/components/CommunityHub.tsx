import React, { useState, useEffect } from "react";
import { Users2, Award, ShieldAlert, Sparkles, MessageCircle, Heart, UserPlus, Star, User, Loader2 } from "lucide-react";
import { StudentProfile } from "../types";
import { supabase, isSupabaseConfigured } from "../lib/supabaseClient";
import { fetchProjectsFromSupabase } from "../lib/supabaseSync";

interface CommunityHubProps {
  userProfile: StudentProfile;
  onGrantXp: (amount: number, reason: string) => void;
}

export default function CommunityHub({ userProfile, onGrantXp }: CommunityHubProps) {
  const [memberCount, setMemberCount] = useState(0);
  const [termRegistrationCount, setTermRegistrationCount] = useState(0);
  const [activeTeamsCount, setActiveTeamsCount] = useState(0);
  const [projectCount, setProjectCount] = useState(0);
  const [activeMentorsCount, setActiveMentorsCount] = useState(0);
  
  const [hasFollowed, setHasFollowed] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [spotlightUser, setSpotlightUser] = useState({
    name: "Atamba Joel",
    role: "Fullstack Leader / S6",
    bio: "Recreated the STAHIZZA ICT Club Hub with premium dark appearance and interactive modules. Enthusiastic about databases, API designs, and React.",
    xp: 2840,
    contributions: 31,
    avatarUrl: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80",
    tags: ["React Developer", "UI Designer", "DB Administrator"]
  });

  const [activeTeamCode, setActiveTeamCode] = useState<string | null>(null);
  const [communityMembers, setCommunityMembers] = useState<any[]>([]);

  useEffect(() => {
    async function fetchCommunityData() {
      try {
        if (!isSupabaseConfigured) {
          // Fallback if not configured
          const fakeMembers = [
            { name: "Jerome K. Maku", role: "S5 Leader / President", xp: 2450, contributions: 25, isLive: true, avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80" },
            { name: "Kyobe Arthur", role: "S6 Rep / Systems VP", xp: 1980, contributions: 18, isLive: false, avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80" },
            { name: "Nabulo Maria", role: "S3 Rep / Design Scholar", xp: 1850, contributions: 22, isLive: true, avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80" },
            { name: "Hakim Kavuma", role: "S6 Student / Cadet", xp: 1210, contributions: 12, isLive: false, avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80" },
            { name: "Namazzi Sandra", role: "S2 Rep / Visual Creator", xp: 950, contributions: 9, isLive: false, avatarUrl: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150&q=80" }
          ];
          setCommunityMembers(fakeMembers);
          setMemberCount(fakeMembers.length);
          setTermRegistrationCount(fakeMembers.length);
          setActiveTeamsCount(3);
          setProjectCount(5);
          setActiveMentorsCount(2);
          setLoading(false);
          return;
        }

        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .order("xp", { ascending: false });

        if (error || !data || data.length === 0) {
          // If table has 0 rows, use beautiful default list fallback
          const fakeMembers = [
            { name: "Jerome K. Maku", role: "S5 Leader / President", xp: 2450, contributions: 25, isLive: true, avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80" },
            { name: "Kyobe Arthur", role: "S6 Rep / Systems VP", xp: 1980, contributions: 18, isLive: false, avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80" },
            { name: "Nabulo Maria", role: "S3 Rep / Design Scholar", xp: 1850, contributions: 22, isLive: true, avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80" },
            { name: "Hakim Kavuma", role: "S6 Student / Cadet", xp: 1210, contributions: 12, isLive: false, avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80" },
            { name: "Namazzi Sandra", role: "S2 Rep / Visual Creator", xp: 950, contributions: 9, isLive: false, avatarUrl: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150&q=80" }
          ];
          setCommunityMembers(fakeMembers);
          setMemberCount(fakeMembers.length);
          setTermRegistrationCount(fakeMembers.length);
          setActiveTeamsCount(3);
          setProjectCount(5);
          setActiveMentorsCount(2);
        } else {
          const membersList = data.map((p: any) => ({
            name: p.full_name,
            role: p.class_level || "Member",
            xp: p.xp,
            contributions: Math.max(3, Math.round(p.xp / 90)),
            isLive: p.username === "jerome" || p.username === "maria",
            avatarUrl: p.avatar_url && p.avatar_url.startsWith("http") ? p.avatar_url : null
          }));
          setCommunityMembers(membersList);

          // Find the top user for the spotlight (highest XP)
          const topUser = data[0];
          if (topUser) {
            setSpotlightUser({
              name: topUser.full_name,
              role: topUser.class_level || "Standard Contributor",
              bio: topUser.bio || "Recreated the STAHIZZA ICT Club Hub with premium dark appearance and interactive modules. Enthusiastic about databases, API designs, and React.",
              xp: topUser.xp,
              contributions: Math.max(5, Math.round(topUser.xp / 90)),
              avatarUrl: topUser.avatar_url && topUser.avatar_url.startsWith("http") ? topUser.avatar_url : "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80",
              tags: topUser.role === "president" ? ["React Developer", "UI Designer", "DB Administrator"] : ["ICT Scholar", "Code Ninja", "Submissions Champion"]
            });
          }
          setMemberCount(data.length);

          // Count users registered in the last 90 days (approx. school term length)
          const termRegs = data.filter((p: any) => {
            if (!p.created_at) return true;
            const diffTime = Math.abs(new Date().getTime() - new Date(p.created_at).getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            return diffDays <= 90;
          }).length;
          setTermRegistrationCount(termRegs);

          // Active mentors are leaders, mentors, vps, or scholars with over 1000 XP
          const mentors = data.filter((p: any) => 
            p.role === "mentor" || 
            p.role === "president" || 
            p.role === "vp" || 
            p.xp >= 1000
          ).length;
          setActiveMentorsCount(mentors);
        }

        // Fetch projects to determine actual active teams (categories) and projects count
        const projects = await fetchProjectsFromSupabase();
        if (projects) {
          const uniqueCategories = new Set(projects.map(p => p.category));
          setActiveTeamsCount(Math.max(1, uniqueCategories.size));
          setProjectCount(projects.length);
        } else {
          setActiveTeamsCount(3);
          setProjectCount(5);
        }
      } catch (err) {
        console.error("Failed to load community data:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchCommunityData();
  }, []);

  const handleFollow = (name: string) => {
    setHasFollowed(prev => {
      const isNowFollowed = !prev[name];
      if (isNowFollowed) {
        onGrantXp(5, `Gave peer recognition to ${name}!`);
      }
      return { ...prev, [name]: isNowFollowed };
    });
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Tops Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
         <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl relative overflow-hidden">
          <div className="absolute top-2 right-2 p-1.5 bg-indigo-500/10 text-indigo-400 rounded-lg">
            <Users2 className="w-4 h-4" />
          </div>
          <span className="text-[10px] uppercase font-mono text-slate-500">Total Members</span>
          <p className="text-xl sm:text-2xl font-bold text-slate-100 mt-1">
            {loading ? <span className="opacity-40">...</span> : memberCount}
          </p>
          <span className="text-[9px] text-emerald-400 flex items-center gap-0.5 mt-1 font-mono">
            +{termRegistrationCount} registered this term
          </span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl relative overflow-hidden">
          <div className="absolute top-2 right-2 p-1.5 bg-indigo-500/10 text-indigo-400 rounded-lg">
            <Award className="w-4 h-4" />
          </div>
          <span className="text-[10px] uppercase font-mono text-slate-500">Active Teams</span>
          <p className="text-xl sm:text-2xl font-bold text-slate-100 mt-1">
            {loading ? <span className="opacity-40">...</span> : `${activeTeamsCount} Teams`}
          </p>
          <span className="text-[9px] text-slate-400 block mt-1 font-mono truncate" title={projectCount > 0 ? `${projectCount} Project Showcases` : "National Expo Prep"}>
            {projectCount > 0 ? `${projectCount} Project Showcases` : "National Expo Prep"}
          </span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl relative overflow-hidden">
          <div className="absolute top-2 right-2 p-1.5 bg-indigo-500/10 text-indigo-400 rounded-lg">
            <Sparkles className="w-4 h-4" />
          </div>
          <span className="text-[10px] uppercase font-mono text-slate-500">Member Spotlight</span>
          <p className="text-xl sm:text-2xl font-bold text-indigo-400 mt-1 truncate" title={spotlightUser.name}>
            {loading ? "Live • Weekly" : spotlightUser.name.split(" ")[0]}
          </p>
          <span className="text-[9px] text-slate-400 block mt-1 font-mono truncate">
            {loading ? "Highlighted achievements" : `${spotlightUser.xp} XP • Spotlight`}
          </span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl relative overflow-hidden">
          <div className="absolute top-2 right-2 p-1.5 bg-indigo-500/10 text-indigo-400 rounded-lg">
            <ShieldAlert className="w-4 h-4" />
          </div>
          <span className="text-[10px] uppercase font-mono text-slate-500">Active Mentors</span>
          <p className="text-xl sm:text-2xl font-bold text-emerald-400 mt-1">
            {loading ? <span className="opacity-40">...</span> : `${activeMentorsCount} Fellows`}
          </p>
          <span className="text-[9px] text-slate-400 block mt-1 font-mono">
            Supporting standard labs
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Recognition Board */}
        <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
            <div>
              <h3 className="text-sm font-bold font-sans text-slate-200">RECOGNITION BOARD</h3>
              <p className="text-[11px] text-slate-500 font-mono">Standard High School Zzana standard contributors ranking</p>
            </div>
            <button
              onClick={() => {
                setMemberCount(prev => prev + 1);
                onGrantXp(10, "Joined a new project study group!");
                setActiveTeamCode(Math.floor(1000 + Math.random() * 9000).toString());
              }}
              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-slate-100 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all shadow-md"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Join a Study Group</span>
            </button>
          </div>

          {activeTeamCode && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-xs text-emerald-400 font-mono">
              🎉 Success! Assigned to Study Team Code: <span className="font-bold">STAHIZZA-G{activeTeamCode}</span>. XP granted!
            </div>
          )}

          <div className="divide-y divide-slate-800">
            {communityMembers.map((member, idx) => {
              const followed = !!hasFollowed[member.name];
              return (
                <div key={idx} className="py-3 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-slate-950 border border-slate-800 shrink-0 relative flex items-center justify-center overflow-hidden">
                      {member.avatarUrl ? (
                        <img src={member.avatarUrl} className="w-full h-full object-cover" alt={member.name} referrerPolicy="no-referrer" />
                      ) : (
                        <User className="w-4 h-4 text-slate-400" />
                      )}
                      {member.isLive && (
                        <span className="absolute top-0.5 right-0.5 flex h-2 w-2 z-10">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                        </span>
                      )}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                        {member.name}
                        {member.xp > 2000 && <Star className="w-3 h-3 text-amber-400 fill-amber-400" />}
                      </p>
                      <p className="text-[10px] text-slate-500 font-mono">{member.role}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-xs font-mono">
                    <div className="text-right hidden sm:block">
                      <p className="text-slate-300 font-bold">{member.xp} XP</p>
                      <p className="text-[9px] text-indigo-400">{member.contributions} submissions</p>
                    </div>
                    <button
                      onClick={() => handleFollow(member.name)}
                      className={`px-3 py-1.5 rounded-lg border text-[10px] font-semibold transition-all ${
                        followed
                          ? "bg-slate-950 border-emerald-500/40 text-emerald-400"
                          : "bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700"
                      }`}
                    >
                      {followed ? "✓ Endorsed" : "Endorse"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Spotlight Profile Side column */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-[#0B1220] border border-pink-500/10 rounded-2xl p-5 space-y-4 relative overflow-hidden shadow-xl text-center">
            {/* Glowing Accent Border */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-pink-500 via-indigo-500 to-cyan-500" />
            
            <span className="mx-auto block w-fit px-2.5 py-0.5 rounded text-[8px] font-mono tracking-widest bg-pink-500/10 text-pink-400 font-bold uppercase border border-pink-500/20">
              WEEKLY SPOTLIGHT
            </span>

            <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-pink-500 to-indigo-500 p-0.5 mx-auto overflow-hidden">
              <div className="w-full h-full bg-slate-950 rounded-2xl flex items-center justify-center overflow-hidden">
                {spotlightUser.avatarUrl ? (
                  <img src={spotlightUser.avatarUrl} className="w-full h-full object-cover rounded-2xl" alt={spotlightUser.name} referrerPolicy="no-referrer" />
                ) : (
                  <span className="text-4xl">👨🏾‍💻</span>
                )}
              </div>
            </div>

            <div className="space-y-1">
              <h4 className="text-sm font-sans font-bold text-slate-200">{spotlightUser.name}</h4>
              <p className="text-[10px] font-mono text-pink-400">{spotlightUser.role}</p>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed font-light font-sans select-text">
              &ldquo;{spotlightUser.bio}&rdquo;
            </p>

            <div className="grid grid-cols-2 gap-2 bg-slate-950 p-3 rounded-xl border border-slate-900 font-mono text-[10px]">
              <div>
                <span className="text-slate-500 text-[9px]">TOTAL XP</span>
                <p className="font-bold text-slate-200 mt-0.5">{spotlightUser.xp} PTS</p>
              </div>
              <div>
                <span className="text-slate-500 text-[9px]">CONTRIBUTION INDEX</span>
                <p className="font-bold text-indigo-400 mt-0.5">{spotlightUser.contributions} submissions</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-1.5 justify-center">
              {spotlightUser.tags.map((tag, i) => (
                <span key={i} className="text-[9px] font-mono bg-[#070A13] border border-slate-800 text-slate-400 px-2 py-0.5 rounded">
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
