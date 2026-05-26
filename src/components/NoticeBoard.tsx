import React, { useState, useEffect } from "react";
import { Notice, StudentProfile } from "../types";
import { INITIAL_NOTICES } from "../data";
import { MessageSquare, Heart, Pin, Send, PlusCircle, Megaphone, HelpCircle, Loader2 } from "lucide-react";
import { supabase, isSupabaseConfigured } from "../lib/supabaseClient";
import { fetchNoticesFromSupabase, saveNoticeToSupabase, incrementNoticeLikesInSupabase } from "../lib/supabaseSync";

interface NoticeBoardProps {
  userProfile: StudentProfile;
  onGrantXp: (amount: number, reason: string) => void;
}

export default function NoticeBoard({ userProfile, onGrantXp }: NoticeBoardProps) {
  const [notices, setNotices] = useState<Notice[]>(isSupabaseConfigured ? [] : INITIAL_NOTICES);
  const [newNoticeText, setNewNoticeText] = useState("");
  const [submissionRole, setSubmissionRole] = useState("Student"); // "Student", "Patron", "President"
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [dbLoading, setDbLoading] = useState(false);

  // Sync notice post role dynamically with Simulated system role
  useEffect(() => {
    if (userProfile.role === "president") {
      setSubmissionRole("President");
    } else if (userProfile.role === "cabinet") {
      setSubmissionRole("Cabinet Member");
    } else {
      setSubmissionRole("Student");
    }
  }, [userProfile.role]);

  // Fetch from Supabase and subscribe to realtime updates of club_feed
  useEffect(() => {
    async function loadNotices() {
      if (!isSupabaseConfigured) return;
      setDbLoading(true);
      const data = await fetchNoticesFromSupabase();
      if (data && data.length > 0) {
        setNotices(data);
      }
      setDbLoading(false);
    }

    loadNotices();

    if (!isSupabaseConfigured) return;

    // Realtime postgres changes subscription
    const channel = supabase
      .channel("club-feed-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "club_feed" },
        (payload) => {
          if (payload.eventType === "INSERT") {
            const newNotice: Notice = {
              id: payload.new.id,
              author: payload.new.author,
              role: payload.new.role,
              content: payload.new.content,
              likes: payload.new.likes || 0,
              timestamp: payload.new.timestamp || "Just now",
              isPinned: payload.new.is_pinned,
            };
            setNotices((prev) => {
              // Guard against duplicates: see real-time-and-multi-user skill
              if (prev.some((n) => n.id === newNotice.id)) return prev;
              const merged = [newNotice, ...prev];
              // Keep pinned ones at top
              return merged.sort((a, b) => (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0));
            });
          } else if (payload.eventType === "UPDATE") {
            setNotices((prev) =>
              prev.map((n) =>
                n.id === payload.new.id
                  ? {
                      ...n,
                      likes: payload.new.likes ?? n.likes,
                      content: payload.new.content ?? n.content,
                      isPinned: payload.new.is_pinned ?? n.isPinned,
                    }
                  : n
              )
            );
          } else if (payload.eventType === "DELETE") {
            setNotices((prev) => prev.filter((n) => n.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleCreateNotice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoticeText.trim()) return;

    const newPost: Notice = {
      id: `notice-${Date.now()}`,
      author: userProfile.name,
      role: submissionRole === "Student" ? `S${userProfile.classLevel.replace(/\D/g, "") || "3"} Student` : submissionRole,
      content: newNoticeText.trim(),
      likes: 0,
      timestamp: "Just now",
      isPinned: submissionRole === "President" || submissionRole === "Patron"
    };

    // Optimistic Update
    setNotices([newPost, ...notices]);
    setNewNoticeText("");
    setIsFormOpen(false);

    onGrantXp(20, "Published a resource notice on the STAHIZZA board!");

    // Persistence to Supabase
    if (isSupabaseConfigured) {
      await saveNoticeToSupabase(newPost);
    }
  };

  const handleLikePost = async (id: string) => {
    // Optimistic update
    setNotices(prev => prev.map(post => {
      if (post.id === id) {
        return { ...post, likes: post.likes + 1 };
      }
      return post;
    }));

    if (isSupabaseConfigured) {
      await incrementNoticeLikesInSupabase(id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Noticeboard Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Megaphone className="w-5 h-5 text-indigo-400" />
            <h3 className="font-sans font-semibold text-slate-100 text-sm">Laboratories & Lounge Bulletin</h3>
          </div>
          <p className="text-[11px] text-slate-400 font-mono flex items-center gap-2">
            <span>Peer-to-peer programming conversations and official announcements.</span>
            {dbLoading && <Loader2 className="w-3 h-3 text-pink-400 animate-spin" />}
          </p>
        </div>

        <button
          onClick={() => setIsFormOpen(!isFormOpen)}
          className="bg-indigo-600 hover:bg-indigo-500 text-slate-100 text-xs font-sans px-4 py-2.5 rounded-xl transition-all font-semibold flex items-center gap-1.5 shadow-md shadow-indigo-950/25"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Publish Dynamic Notice</span>
        </button>
      </div>

      {/* Insert Notice Form */}
      {isFormOpen && (
        <form onSubmit={handleCreateNotice} className="bg-slate-900/90 border border-indigo-500/30 rounded-xl p-4 space-y-4 animate-slideDown">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] uppercase font-mono text-slate-400 block mb-1">Author Identity</label>
              <input
                type="text"
                disabled
                value={`${userProfile.name} (Joined Profile)`}
                className="w-full bg-slate-950 dark:border-slate-800 rounded-md p-2 text-xs text-slate-400"
              />
            </div>

            <div>
              <label className="text-[10px] uppercase font-mono text-slate-400 block mb-1">Publish Representative Role</label>
              <select
                value={submissionRole}
                onChange={(e) => setSubmissionRole(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-md p-2 text-xs text-slate-300 outline-none focus:border-indigo-500"
              >
                {userProfile.role === "president" && (
                  <>
                    <option value="President">Club President Role (Auto Pinned 👑)</option>
                    <option value="Student">Student (Class Level Representative)</option>
                  </>
                )}
                {userProfile.role === "cabinet" && (
                  <>
                    <option value="Cabinet Member">Cabinet Administrator (🛡️)</option>
                    <option value="Student">Student (Class Level Representative)</option>
                  </>
                )}
                {userProfile.role === "member" && (
                  <option value="Student">Student (Class Level Representative 🌱)</option>
                )}
              </select>
            </div>
          </div>

          <div>
            <label className="text-[10px] uppercase font-mono text-slate-400 block mb-1">Notice Description</label>
            <textarea
              value={newNoticeText}
              onChange={(e) => setNewNoticeText(e.target.value)}
              placeholder="What would you like to share? Seek debugging support, ask syllabus trivia, or write reminders..."
              rows={3}
              className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-lg p-3 text-xs text-slate-200 placeholder:text-slate-600 resize-none outline-none font-sans"
            />
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsFormOpen(false)}
              className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs hover:bg-slate-700 font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!newNoticeText.trim()}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 text-slate-100 disabled:text-slate-500 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Share Post (+20 XP)</span>
            </button>
          </div>
        </form>
      )}

      {/* Feed List Output */}
      {dbLoading ? (
        <div id="notice-skeletons-container" className="space-y-3.5">
          {[1, 2, 3].map((i) => (
            <div
              key={`notice-skeleton-${i}`}
              id={`notice-skeleton-${i}`}
              className="bg-slate-900 border border-slate-800/80 rounded-xl p-4 flex gap-3 animate-pulse"
            >
              <div id={`notice-skeleton-avatar-${i}`} className="w-9 h-9 rounded-lg bg-slate-800 shrink-0" />
              <div id={`notice-skeleton-text-block-${i}`} className="space-y-2.5 flex-1 pt-1">
                <div id={`notice-skeleton-header-${i}`} className="flex items-center gap-2">
                  <div className="h-3.5 w-24 bg-slate-800 rounded-md" />
                  <div className="h-4 w-16 bg-slate-850 rounded-md" />
                </div>
                <div id={`notice-skeleton-body-${i}`} className="space-y-2 pt-1">
                  <div className="h-3 w-full bg-slate-800 rounded" />
                  <div className="h-3 w-[85%] bg-slate-800 rounded" />
                </div>
                <div id={`notice-skeleton-footer-${i}`} className="flex items-center gap-4 pt-2.5">
                  <div className="h-3 w-12 bg-slate-850 rounded" />
                  <div className="h-3 w-16 bg-slate-850 rounded" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-3.5">
          {notices.map((notice) => (
            <div
              key={notice.id}
              className={`border rounded-xl p-4 transition-all relative group ${
                notice.isPinned
                  ? "bg-slate-900 border-indigo-700/50"
                  : "bg-slate-900 border-slate-800/80 hover:border-slate-700"
              }`}
            >
              {/* Pin Badge in context */}
              {notice.isPinned && (
                <span className="absolute top-4 right-4 flex items-center gap-1 bg-indigo-600/10 text-indigo-400 border border-indigo-500/10 px-2 py-0.5 rounded text-[9px] font-mono select-none">
                  <Pin className="w-3 h-3 text-indigo-400 fill-indigo-400/10" />
                  <span>PINNED BULLETIN</span>
                </span>
              )}

              <div className="flex gap-3">
                <div className="w-9 h-9 rounded-lg bg-indigo-600/15 border border-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-sm uppercase">
                  {notice.author.substring(0, 2)}
                </div>

                <div className="space-y-1.5 flex-1 select-text">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                    <span className="text-xs font-semibold text-slate-200">{notice.author}</span>
                    <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-slate-950 text-slate-400 w-fit">
                      {notice.role}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed font-sans font-light select-text">
                    {notice.content}
                  </p>

                  {/* Card footer interaction bar */}
                  <div className="flex items-center gap-4 text-[10px] font-mono text-slate-500 pt-2 select-none">
                    <span>{notice.timestamp}</span>
                    <button
                      onClick={() => handleLikePost(notice.id)}
                      className="flex items-center gap-1.5 hover:text-rose-400 transition-colors group/btn"
                    >
                      <Heart className="w-3.5 h-3.5 text-slate-500 group-hover/btn:text-rose-400 transition-colors" />
                      <span>{notice.likes} Likes</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
