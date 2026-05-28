import React, { useState, useEffect } from "react";
import { 
  Trophy, 
  Sparkles, 
  Clock, 
  Plus, 
  Send, 
  Check, 
  X, 
  FileText, 
  ExternalLink, 
  Shield, 
  User, 
  Award, 
  AlertCircle, 
  ThumbsUp, 
  CheckCircle 
} from "lucide-react";
import { supabase, isSupabaseConfigured } from "../lib/supabaseClient";
import { StudentProfile } from "../types";

interface Challenge {
  id: string;
  title: string;
  description: string;
  points: number;
  created_by: string;
  start_date: string;
  end_date?: string;
  is_active: boolean;
  created_at: string;
}

interface Submission {
  id: string;
  challenge_id: string;
  user_id: string;
  user_name: string;
  content: string;
  file_url?: string;
  status: "pending" | "approved" | "rejected";
  points_earned: number;
  created_at: string;
}

interface UserStat {
  user_id: string;
  user_name: string;
  total_points: number;
  completed_challenges: number;
}

interface ChallengesPageProps {
  userProfile: StudentProfile;
  onGrantXp: (amount: number, reason: string) => void;
  onUnlockBadge: (badge: string) => void;
}

export default function ChallengesPage({ userProfile, onGrantXp, onUnlockBadge }: ChallengesPageProps) {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [leaderboard, setLeaderboard] = useState<UserStat[]>([]);
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);
  const [loading, setLoading] = useState(true);

  // Form states for submitting
  const [subContent, setSubContent] = useState("");
  const [subFileUrl, setSubFileUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form states for admin creating
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newPoints, setNewPoints] = useState(50);
  const [newDurationHours, setNewDurationHours] = useState(48);

  const isAdmin = userProfile.role === "president" || userProfile.role === "cabinet" || userProfile.classLevel.includes("Patron") || userProfile.classLevel.includes("Teacher") || userProfile.classLevel.includes("Leader") || userProfile.classLevel.includes("Mentor");

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    try {
      if (isSupabaseConfigured) {
        // 1. Fetch Challenges
        const { data: listChal, error: chalErr } = await supabase
          .from("challenges")
          .select("*")
          .order("created_at", { ascending: false });

        if (!chalErr && listChal) {
          setChallenges(listChal);
        }

        // 2. Fetch Submissions
        const { data: listSub, error: subErr } = await supabase
          .from("challenge_submissions")
          .select("*")
          .order("created_at", { ascending: false });

        if (!subErr && listSub) {
          setSubmissions(listSub);
        } else {
          setSubmissions([]);
        }

        // 3. Fetch challenge leaderboard from user_challenge_stats
        const { data: statsData, error: statsErr } = await supabase
          .from("user_challenge_stats")
          .select("*")
          .order("total_points", { ascending: false });

        if (!statsErr && statsData && statsData.length > 0) {
          setLeaderboard(statsData);
        } else {
          // Dynamically compute real leaderboard entries from live student profiles if stats are not populated yet
          const { data: activeProfiles, error: profErr } = await supabase
            .from("profiles")
            .select("id, full_name, xp")
            .order("xp", { ascending: false })
            .limit(10);

          if (!profErr && activeProfiles) {
            setLeaderboard(
              activeProfiles.map((p) => ({
                user_id: p.id,
                user_name: p.full_name || "Anonymous Scholar",
                total_points: p.xp || 0,
                completed_challenges: Math.max(1, Math.floor((p.xp || 0) / 150))
              }))
            );
          } else {
            setLeaderboard([]);
          }
        }
      } else {
        // Local state fallback without hardcoded defaults
        const cachedChallenges = localStorage.getItem("stahizza_local_challenges");
        setChallenges(cachedChallenges ? JSON.parse(cachedChallenges) : []);

        const cachedSubmissions = localStorage.getItem("stahizza_local_challenge_submissions");
        setSubmissions(cachedSubmissions ? JSON.parse(cachedSubmissions) : []);

        const cachedStats = localStorage.getItem("stahizza_local_challenge_stats");
        setLeaderboard(cachedStats ? JSON.parse(cachedStats) : []);
      }
    } catch (e) {
      console.warn("Challenges fetch issue:", e);
      setChallenges([]);
      setSubmissions([]);
      setLeaderboard([]);
    } finally {
      setLoading(false);
    }
  }

  // Set selected challenge on list load
  useEffect(() => {
    if (challenges.length > 0 && !selectedChallenge) {
      setSelectedChallenge(challenges[0]);
    }
  }, [challenges, selectedChallenge]);

  // Handle submit challenge
  async function handleSubmitWork(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedChallenge) return;
    if (!subContent.trim()) {
      alert("Please provide some explanation or solution draft before submitting!");
      return;
    }

    setIsSubmitting(true);
    const myId = userProfile.id || "guest-id";
    const myName = userProfile.name;

    const newSub: Partial<Submission> = {
      challenge_id: selectedChallenge.id,
      user_id: myId,
      user_name: myName,
      content: subContent,
      file_url: subFileUrl.trim() ? subFileUrl.trim() : undefined,
      status: "pending",
      points_earned: 0,
      created_at: new Date().toISOString()
    };

    try {
      if (isSupabaseConfigured) {
        const { error } = await supabase
          .from("challenge_submissions")
          .insert([newSub]);

        if (error) throw error;
      } else {
        const updatedSubs = [newSub as Submission, ...submissions];
        setSubmissions(updatedSubs);
        localStorage.setItem("stahizza_local_challenge_submissions", JSON.stringify(updatedSubs));
      }

      setSubContent("");
      setSubFileUrl("");
      onGrantXp(15, `Submitted Solution Draft for: ${selectedChallenge.title}`);
      alert("🏆 Submission entered successfully! A cabinet member or President will review your schema shortly to approve bonus XP.");
      fetchData();
    } catch (err) {
      console.error("Submission failed:", err);
      alert("Failed to submit. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  // Admin approves a submission
  async function handleApproveSubmission(sub: Submission) {
    const points = selectedChallenge?.points || sub.points_earned || 50;
    try {
      if (isSupabaseConfigured) {
        // Update submission status
        const { error: subErr } = await supabase
          .from("challenge_submissions")
          .update({ status: "approved", points_earned: points })
          .eq("id", sub.id);

        if (subErr) throw subErr;

        // Upsert user_challenge_stats
        const { data: existingStat } = await supabase
          .from("user_challenge_stats")
          .select("*")
          .eq("user_id", sub.user_id)
          .maybeSingle();

        if (existingStat) {
          await supabase
            .from("user_challenge_stats")
            .update({
              total_points: existingStat.total_points + points,
              completed_challenges: existingStat.completed_challenges + 1,
              updated_at: new Date().toISOString()
            })
            .eq("user_id", sub.user_id);
        } else {
          await supabase
            .from("user_challenge_stats")
            .insert([{
              user_id: sub.user_id,
              user_name: sub.user_name,
              total_points: points,
              completed_challenges: 1
            }]);
        }

        // Grant XP dynamically to member profile in public profiles table
        const { data: prof } = await supabase
          .from("profiles")
          .select("xp, level")
          .eq("id", sub.user_id)
          .maybeSingle();

        if (prof) {
          const nextXp = prof.xp + points;
          const nextLevel = Math.floor(nextXp / 300) + 1;
          await supabase
            .from("profiles")
            .update({ xp: nextXp, level: nextLevel })
            .eq("id", sub.user_id);
        }
      } else {
        // Local Updates
        const updatedSubs = submissions.map(s => s.id === sub.id ? { ...s, status: "approved" as const, points_earned: points } : s);
        setSubmissions(updatedSubs);
        localStorage.setItem("stahizza_local_challenge_submissions", JSON.stringify(updatedSubs));

        const updatedStats = [...leaderboard];
        const statIdx = updatedStats.findIndex(st => st.user_id === sub.user_id);
        if (statIdx !== -1) {
          updatedStats[statIdx].total_points += points;
          updatedStats[statIdx].completed_challenges += 1;
        } else {
          updatedStats.push({
            user_id: sub.user_id,
            user_name: sub.user_name,
            total_points: points,
            completed_challenges: 1
          });
        }
        setLeaderboard(updatedStats);
        localStorage.setItem("stahizza_local_challenge_stats", JSON.stringify(updatedStats));
      }

      onGrantXp(10, `Approved submission from ${sub.user_name}`);
      alert(`Submission approved! Granted +${points} XP directly to ${sub.user_name}.`);
      fetchData();
    } catch (e) {
      console.error("Failed to approve submission:", e);
    }
  }

  // Admin rejects a submission
  async function handleRejectSubmission(sub: Submission) {
    try {
      if (isSupabaseConfigured) {
        await supabase
          .from("challenge_submissions")
          .update({ status: "rejected" })
          .eq("id", sub.id);
      } else {
        const updatedSubs = submissions.map(s => s.id === sub.id ? { ...s, status: "rejected" as const } : s);
        setSubmissions(updatedSubs);
        localStorage.setItem("stahizza_local_challenge_submissions", JSON.stringify(updatedSubs));
      }
      alert(`Submission by ${sub.user_name} marked as rejected.`);
      fetchData();
    } catch (e) {
      console.error("Failed to reject submission:", e);
    }
  }

  // Admin creates a challenge
  async function handleCreateChallenge(e: React.FormEvent) {
    e.preventDefault();
    if (!newTitle.trim() || !newDescription.trim()) return;

    const endRaw = new Date();
    endRaw.setHours(endRaw.getHours() + Number(newDurationHours));

    const newChal: Partial<Challenge> = {
      title: newTitle.trim(),
      description: newDescription.trim(),
      points: Number(newPoints),
      created_by: userProfile.name,
      start_date: new Date().toISOString(),
      end_date: endRaw.toISOString(),
      is_active: true
    };

    try {
      if (isSupabaseConfigured) {
        const { error } = await supabase
          .from("challenges")
          .insert([newChal]);

        if (error) throw error;
      } else {
        const fullNewChal: Challenge = {
          ...newChal,
          id: `chal-local-${Date.now()}`,
          created_at: new Date().toISOString()
        } as Challenge;

        const updatedChallenges = [fullNewChal, ...challenges];
        setChallenges(updatedChallenges);
        localStorage.setItem("stahizza_local_challenges", JSON.stringify(updatedChallenges));
      }

      onGrantXp(25, `Created High School Club Challenge: ${newTitle}`);
      onUnlockBadge("Club Initiator");
      setNewTitle("");
      setNewDescription("");
      setNewPoints(50);
      setShowCreateModal(false);
      alert("🎯 Active community challenge published successfully! Submissions are now open.");
      fetchData();
    } catch (err) {
      console.error("Failed to insert challenge:", err);
    }
  }

  const selectedChallengeSubmissions = submissions.filter(
    (sub) => sub.challenge_id === selectedChallenge?.id
  );

  const mySubmissionsForSelected = selectedChallengeSubmissions.filter(
    (sub) => sub.user_id === (userProfile.id || "guest-id")
  );

  if (loading) {
    return (
      <div className="bg-[#0B1220] border border-slate-900 rounded-2xl p-16 text-center flex flex-col items-center justify-center space-y-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500 animate-[spin_1s_linear_infinite]"></div>
        <p className="font-mono text-xs text-slate-400 uppercase tracking-widest">Constructing Community Challenges Node...</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start select-text" id="challenges-page-root">
      
      {/* =========================================================
          LEFT SIDE: Active challenges list
          ========================================================= */}
      <section className="lg:col-span-3 space-y-4" id="challenges-left-sidebar">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">
            Active Challenges ({challenges.length})
          </h3>
          {isAdmin && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="p-1 px-2.5 rounded-lg bg-pink-500/10 border border-pink-500/20 text-pink-400 hover:bg-pink-500/20 transition-all font-mono text-[10px] flex items-center gap-1 cursor-pointer"
              title="Publish challenge"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>NEW</span>
            </button>
          )}
        </div>

        <div className="space-y-2.5 max-h-[600px] overflow-y-auto scrollbar-thin pr-1">
          {challenges.length === 0 ? (
            <div className="p-6 rounded-xl border border-slate-900 bg-[#0B1220]/40 text-center text-xs text-slate-500">
              No active challenges in database yet.
            </div>
          ) : (
            challenges.map((chal) => {
              const isSelected = selectedChallenge?.id === chal.id;
              const subCount = submissions.filter(s => s.challenge_id === chal.id).length;
              const myApproved = submissions.filter(s => s.challenge_id === chal.id && s.user_id === userProfile.id && s.status === "approved").length > 0;

              return (
                <button
                  key={chal.id}
                  onClick={() => setSelectedChallenge(chal)}
                  className={`w-full text-left p-4 rounded-xl border transition-all flex flex-col justify-between align-stretch text-xs leading-relaxed space-y-2 cursor-pointer ${
                    isSelected
                      ? "bg-[#111A2E]/90 border-pink-500/25 shadow-md shadow-pink-950/5 text-slate-100"
                      : "bg-[#0B1220]/60 border-slate-900 hover:bg-[#0E1627] text-slate-400"
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-1.5 font-mono text-[9px]">
                      <span className="flex items-center gap-1 select-none text-pink-400">
                        <Trophy className="w-3 h-3" />
                        +{chal.points} XP
                      </span>
                      {myApproved ? (
                        <span className="text-emerald-400 font-bold flex items-center gap-0.5">
                          <Check className="w-3 h-3" /> SUCCESS
                        </span>
                      ) : (
                        <span className="text-slate-500">{subCount} entries</span>
                      )}
                    </div>
                    <h4 className={`font-sans font-bold text-xs ${isSelected ? "text-slate-100" : "text-slate-250"}`}>
                      {chal.title}
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                      {chal.description}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-900/60 flex items-center justify-between font-mono text-[8px] text-slate-550 select-none">
                    <span>Author: {chal.created_by.split(" ")[0]}</span>
                    <span className="flex items-center gap-0.5">
                      <Clock className="w-2.5 h-2.5 text-indigo-400" /> ACTIVE
                    </span>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </section>

      {/* =========================================================
          MIDDLE: Selected challenge details & feed entries
          ========================================================= */}
      <section className="lg:col-span-5 space-y-6" id="challenges-middle-content">
        {selectedChallenge ? (
          <div className="bg-[#0B1220]/90 border border-slate-900/90 rounded-2xl p-6 space-y-6 relative overflow-hidden" id="selected-challenge-panel">
            <div className="absolute top-0 right-0 w-32 h-32 bg-pink-500/[0.02] blur-[40px] pointer-events-none" />

            {/* Title Block */}
            <div className="space-y-2 border-b border-slate-900/60 pb-4">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[8px] font-mono tracking-widest bg-pink-500/10 border border-pink-500/20 text-pink-400 uppercase font-bold select-none">
                  Syllabus Challenge Revision Task
                </span>
                <span className="px-2 py-0.5 rounded text-[8px] font-mono bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 uppercase font-bold select-none flex items-center gap-0.5">
                  <Sparkles className="w-2.5 h-2.5" /> REWARDED
                </span>
              </div>
              <h3 className="font-sans text-base font-extrabold text-slate-100">
                {selectedChallenge.title}
              </h3>
              <p className="text-xs font-mono text-slate-400">
                Created By: <span className="text-slate-300 font-bold">{selectedChallenge.created_by}</span>
              </p>
            </div>

            {/* Task Specification info */}
            <div className="space-y-3">
              <h4 className="text-[10px] font-mono font-bold tracking-wider text-slate-400 uppercase">
                Task Specifications & Context
              </h4>
              <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-900 font-sans text-xs sm:text-sm text-slate-300 leading-relaxed font-light select-text">
                {selectedChallenge.description}
              </div>
            </div>

            {/* XP Claim parameters */}
            <div className="grid grid-cols-2 gap-4 border-t border-b border-slate-900/60 py-4 select-none">
              <div>
                <span className="text-[9px] font-mono uppercase text-slate-500 block">REVISION BONUS</span>
                <span className="text-sm font-bold text-pink-405 font-mono flex items-center gap-1 mt-0.5">
                  <Award className="w-4 h-4 text-pink-400" />
                  +{selectedChallenge.points} XP POINTS
                </span>
              </div>
              <div>
                <span className="text-[9px] font-mono uppercase text-slate-500 block">DEADLINE RANGE</span>
                <span className="text-xs font-bold text-slate-300 font-mono flex items-center gap-1 mt-1">
                  <Clock className="w-3.5 h-3.5 text-indigo-405" />
                  Open Continuous Revisions
                </span>
              </div>
            </div>

            {/* Active Submissions List Feed under this challenge */}
            <div className="space-y-4">
              <h4 className="text-[10px] font-mono font-bold tracking-wider text-slate-400 uppercase">
                Classroom Submissions ({selectedChallengeSubmissions.length})
              </h4>
              
              {selectedChallengeSubmissions.length === 0 ? (
                <div className="p-6 rounded-xl bg-slate-950/30 border border-[#0f172a] text-center text-slate-500 text-xs">
                  Be the first Standard scholar to solve this problem! Document your code below to submit.
                </div>
              ) : (
                <div className="space-y-3 max-h-[300px] overflow-y-auto scrollbar-thin pr-1">
                  {selectedChallengeSubmissions.map((sub) => {
                    const isApproved = sub.status === "approved";
                    const isRejected = sub.status === "rejected";

                    return (
                      <div 
                        key={sub.id} 
                        className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-900 flex flex-col justify-between space-y-3 leading-relaxed text-xs"
                      >
                        <div className="flex border-b border-slate-900 pb-2 items-center justify-between select-none">
                          <div className="flex items-center gap-2">
                            <span className="w-5 h-5 bg-slate-900 rounded-md border border-slate-800 flex items-center justify-center text-[10px]">
                              👤
                            </span>
                            <span className="font-bold text-slate-250 truncate max-w-[120px]">
                              {sub.user_name}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 font-mono text-[9px]">
                            {isApproved && (
                              <span className="px-1.5 py-0.2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded flex items-center gap-0.5 font-extrabold whitespace-nowrap">
                                <CheckCircle className="w-2.5 h-2.5" /> Approved +{sub.points_earned} XP
                              </span>
                            )}
                            {isRejected && (
                              <span className="px-1.5 py-0.2 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded flex items-center gap-0.5 font-extrabold whitespace-nowrap">
                                <AlertCircle className="w-2.5 h-2.5" /> Rejected
                              </span>
                            )}
                            {sub.status === "pending" && (
                              <span className="px-1.5 py-0.2 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded flex items-center gap-0.5 font-extrabold whitespace-nowrap animate-pulse">
                                <Clock className="w-2.5 h-2.5" /> Pending
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="text-slate-350 select-text break-words">
                          {sub.content}
                        </div>

                        {sub.file_url && (
                          <div className="text-[10px] font-mono text-indigo-400 hover:text-pink-400 transition-colors flex items-center gap-1 truncate select-text">
                            <ExternalLink className="w-3 h-3 shrink-0" />
                            <a href={sub.file_url} target="_blank" rel="noopener noreferrer">
                              {sub.file_url}
                            </a>
                          </div>
                        )}

                        {/* Admin approval/reject utilities */}
                        {isAdmin && sub.status === "pending" && (
                          <div className="flex justify-end gap-2 pt-2 border-t border-slate-900/60 select-none">
                            <button
                              type="button"
                              onClick={() => handleRejectSubmission(sub)}
                              className="px-2.5 py-1 rounded-lg bg-rose-500/10 border border-rose-550/20 text-rose-400 hover:bg-rose-550/20 transition-all font-mono text-[9px] flex items-center gap-1 cursor-pointer"
                            >
                              <X className="w-3 h-3" />
                              REJECT
                            </button>
                            <button
                              type="button"
                              onClick={() => handleApproveSubmission(sub)}
                              className="px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-555/20 text-emerald-400 hover:bg-emerald-555/20 transition-all font-mono text-[9px] flex items-center gap-1 cursor-pointer"
                            >
                              <Check className="w-3 h-3" />
                              APPROVE
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

          </div>
        ) : (
          <div className="bg-[#0B1220]/50 border border-slate-900 p-12 text-center text-slate-500 text-xs">
            Select a high school challenge task from the active register.
          </div>
        )}
      </section>

      {/* =========================================================
          RIGHT SIDE: Submit solution module & Leaderboard
          ========================================================= */}
      <section className="lg:col-span-4 space-y-6" id="challenges-right-sidebar">
        
        {/* SUBMIT SOLUTION COMPONET */}
        {selectedChallenge && (
          <div className="bg-[#0B1220] border border-slate-900/80 rounded-2xl p-5 space-y-4" id="submit-proposal-card">
            <h4 className="text-[10px] font-mono font-bold tracking-wider text-slate-300 uppercase flex items-center gap-1.5 border-b border-slate-900 pb-2.5">
              <Send className="w-3.5 h-3.5 text-pink-500" />
              Submit Draft Solution
            </h4>

            {mySubmissionsForSelected.some(s => s.status === "approved") ? (
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center space-y-1.5 select-none text-emerald-400 text-xs font-semibold">
                <CheckCircle className="w-6 h-6 mx-auto animate-bounce" />
                <p>Task Successfully Solved!</p>
                <p className="text-[10px] font-mono text-slate-400">Bonus points added to your score.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmitWork} className="space-y-3.5 text-xs">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono text-slate-400 font-bold block uppercase">
                    Your Solution Script / logic
                  </label>
                  <textarea
                    required
                    value={subContent}
                    onChange={(e) => setSubContent(e.target.value)}
                    placeholder="Enter short code, outline your layout flex properties, explain your SQL indexing, or type your answer draft here..."
                    rows={4}
                    className="w-full bg-slate-950/80 border border-slate-900 hover:border-slate-800 focus:border-pink-500/45 p-3 rounded-xl text-slate-300 text-xs outline-none transition-colors select-text leading-relaxed font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono text-slate-400 font-bold block uppercase">
                    Optional Reference Link / CodePen
                  </label>
                  <input
                    type="url"
                    value={subFileUrl}
                    onChange={(e) => setSubFileUrl(e.target.value)}
                    placeholder="https://codepen.io/my-bento-grid..."
                    className="w-full bg-slate-950/80 border border-slate-900 hover:border-slate-850 focus:border-pink-500/40 p-2.5 rounded-xl text-slate-300 text-xs outline-none transition-all font-mono"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-2.5 bg-pink-500 hover:bg-pink-600 active:bg-pink-700 disabled:bg-slate-800 text-xs font-sans tracking-wide text-white disabled:text-slate-500 rounded-xl transition-all font-bold shadow-md shadow-pink-950/20 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  {isSubmitting ? (
                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white" />
                  ) : (
                    <Send className="w-3.5 h-3.5" />
                  )}
                  <span>SUBMIT REVISION SOLUTION</span>
                </button>
              </form>
            )}
          </div>
        )}

        {/* TOP MEMBERS CHALLENGE STATS PODIUM */}
        <div className="bg-[#0B1220] border border-slate-900/80 rounded-2xl p-5 space-y-4 select-none">
          <div className="flex items-center justify-between border-b border-slate-900 pb-2.5">
            <h4 className="text-[10px] font-mono font-bold tracking-wider text-slate-300 uppercase flex items-center gap-1.5">
              <Trophy className="w-3.5 h-3.5 text-amber-500" />
              CHALLENGES LEADERBOARD
            </h4>
            <span className="text-[8px] font-mono bg-pink-500/10 text-pink-400 px-1.5 py-0.5 rounded font-bold uppercase select-none tracking-wider">
              TOP SCHOLARS
            </span>
          </div>

          <div className="space-y-2.5 text-xs">
            {leaderboard.slice(0, 5).map((stat, idx) => {
              const bgColors = [
                "bg-amber-500/10 border-amber-500/20 text-amber-300",
                "bg-slate-300/10 border-slate-300/20 text-slate-300",
                "bg-yellow-700/15 border-yellow-700/20 text-yellow-600",
                "bg-slate-900 border-none text-slate-400"
              ];
              const badgeStyle = bgColors[idx] || bgColors[3];

              return (
                <div 
                  key={stat.user_id} 
                  className="flex items-center justify-between p-2 rounded-xl bg-slate-950/40 border border-slate-900/50"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className={`w-5 h-5 rounded-md font-mono text-[9px] font-extrabold flex items-center justify-center border shrink-0 ${badgeStyle}`}>
                      {idx + 1}
                    </span>
                    <span className="font-sans font-bold text-slate-250 truncate max-w-[120px]">
                      {stat.user_name}
                    </span>
                  </div>
                  <div className="font-mono text-right shrink-0">
                    <span className="text-pink-405 font-bold uppercase tracking-wider block text-[10px]">
                      {stat.total_points} PTS
                    </span>
                    <span className="text-[8px] text-slate-500 block">
                      {stat.completed_challenges} problems solved
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </section>

      {/* =========================================================
          ADMIN CREATE MODAL DIALOG PRESETS
          ========================================================= */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 select-none animate-fadeIn">
          <div className="bg-[#0B1220] border border-slate-900 p-6 rounded-2xl w-full max-w-lg space-y-4 shadow-2xl relative">
            <button
              onClick={() => setShowCreateModal(false)}
              className="absolute right-4 top-4 w-7 h-7 rounded-lg bg-slate-950 border border-slate-850 hover:bg-slate-900 text-slate-450 hover:text-white transition-colors flex items-center justify-center cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2 border-b border-slate-900 pb-3">
              <Shield className="w-5 h-5 text-pink-500" />
              <div>
                <h3 className="font-sans font-bold text-sm text-slate-100 uppercase tracking-tight">
                  Publish New Active Syllabus Challenge
                </h3>
                <p className="text-[10px] font-mono text-slate-400">ADMIN CONTROL CENTER KEYWORDS</p>
              </div>
            </div>

            <form onSubmit={handleCreateChallenge} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono text-slate-400 font-bold uppercase">
                  Challenge Title
                </label>
                <input
                  required
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. ⚡ The CSS Flexbox Alignment Challenge"
                  className="w-full bg-slate-950 border border-slate-900 focus:border-pink-550/35 p-2.5 rounded-xl text-slate-200 outline-none transition-all font-sans font-bold"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-mono text-slate-400 font-bold uppercase">
                  Detailed Specifications
                </label>
                <textarea
                  required
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Outline step-by-step conditions, requirements, expected output format, and core tips for classmate scholars..."
                  rows={4}
                  className="w-full bg-slate-950 border border-slate-900 focus:border-pink-550/35 p-3 rounded-xl text-slate-350 outline-none transition-all font-sans leading-relaxed"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono text-slate-400 font-bold uppercase">
                    Reward (points/XP)
                  </label>
                  <input
                    required
                    type="number"
                    min={10}
                    max={500}
                    value={newPoints}
                    onChange={(e) => setNewPoints(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-900 p-2.5 rounded-xl text-slate-200 outline-none font-mono"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono text-slate-400 font-bold uppercase">
                    Duration (Hours)
                  </label>
                  <input
                    required
                    type="number"
                    min={1}
                    value={newDurationHours}
                    onChange={(e) => setNewDurationHours(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-900 p-2.5 rounded-xl text-slate-200 outline-none font-mono"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-pink-500 hover:bg-pink-600 text-xs text-white rounded-xl font-bold transition-all shadow-lg flex items-center justify-center gap-1 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>PUBLISH ACTIVE TASK</span>
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
