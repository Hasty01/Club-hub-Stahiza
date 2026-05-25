import React, { useState, useEffect } from "react";
import { Lightbulb, Check, PlusCircle, ThumbsUp, HelpCircle, FileText, Bug, Loader2 } from "lucide-react";
import { StudentProfile } from "../types";
import { isSupabaseConfigured } from "../lib/supabaseClient";
import { fetchSuggestionsFromSupabase, saveSuggestionToSupabase, upvoteSuggestionInSupabase } from "../lib/supabaseSync";

interface Suggestion {
  id: string;
  title: string;
  description: string;
  author: string;
  category: "Feature" | "Bug" | "Syllabus";
  votes: number;
  date: string;
  status: "Pending" | "Reviewed" | "Approved";
}

interface SuggestionsHubProps {
  userProfile: StudentProfile;
  onGrantXp: (amount: number, reason: string) => void;
}

export default function SuggestionsHub({ userProfile, onGrantXp }: SuggestionsHubProps) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([
    { id: "s-1", title: "Socials Interface Integration", description: "Incorporate quick links to our high school social threads directly inside the dashboard sidebar footer so users don't open extra tabs.", author: "Sandra N.", category: "Feature", votes: 35, date: "May 24, 2026", status: "Approved" },
    { id: "s-2", title: "Email Notifications for Announcements", description: "Send automated syllabus newsletter or notice board updates directly to registered scholars accounts.", author: "Jerome M.", category: "Feature", votes: 12, date: "May 23, 2026", status: "Reviewed" },
    { id: "s-3", title: "Promotion Options & Ranks Details", description: "Add a visible modal showing what is required conceptually to advance from Cadet Cadet to Senior Fellow levels.", author: "Arthur K.", category: "Feature", votes: 23, date: "May 21, 2026", status: "Approved" },
    { id: "s-4", title: "Fix Solution Button Overflow", description: "On small screen smartphones, the 'Verify Answer' button overlaps textboxes in the sandbox window. Needs a fluid responsive layout wrapper.", author: "Atamba Joel", category: "Bug", votes: 8, date: "May 20, 2026", status: "Pending" },
    { id: "s-5", title: "Tabs in the Live Code Playground", description: "Let students open multiple HTML template drafts at once instead of resetting the single window every time.", author: "Maria N.", category: "Feature", votes: 15, date: "May 18, 2026", status: "Pending" }
  ]);

  const [filterCategory, setFilterCategory] = useState<string>("All");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<"Feature" | "Bug" | "Syllabus">("Feature");
  const [upvotedIds, setUpvotedIds] = useState<Record<string, boolean>>({});
  const [dbLoading, setDbLoading] = useState(false);

  useEffect(() => {
    async function loadSuggestions() {
      if (!isSupabaseConfigured) return;
      setDbLoading(true);
      const data = await fetchSuggestionsFromSupabase();
      if (data && data.length > 0) {
        setSuggestions(data);
      }
      setDbLoading(false);
    }
    loadSuggestions();
  }, []);

  const handleCreateSuggestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    const newSug: Suggestion = {
      id: `sug-${Date.now()}`,
      title: title.trim(),
      description: description.trim(),
      author: userProfile.name,
      category,
      votes: 1,
      date: "Just now",
      status: "Pending"
    };

    // Optimistic Update
    setSuggestions([newSug, ...suggestions]);
    setTitle("");
    setDescription("");
    setIsFormOpen(false);
    
    onGrantXp(20, "Submitted a structure suggestion to improve STAHIZZA system!");

    if (isSupabaseConfigured) {
      await saveSuggestionToSupabase(newSug);
    }
  };

  const handleUpvote = async (id: string) => {
    if (upvotedIds[id]) return; // Limit to single upvote session-wise
    
    setUpvotedIds(prev => ({ ...prev, [id]: true }));
    setSuggestions(prev => prev.map(s => {
      if (s.id === id) {
        onGrantXp(5, `Upvoted suggestion: ${s.title}`);
        return { ...s, votes: s.votes + 1 };
      }
      return s;
    }));

    if (isSupabaseConfigured) {
      await upvoteSuggestionInSupabase(id);
    }
  };

  const filtered = filterCategory === "All"
    ? suggestions
    : suggestions.filter(s => s.category === filterCategory);

  return (
    <div className="space-y-6">
      {/* Search Header layout */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Lightbulb className="w-5 h-5 text-indigo-400" />
            <h3 className="font-sans font-semibold text-slate-100 text-sm">Suggestions & Bugs</h3>
          </div>
          <p className="text-[11px] text-slate-400 font-mono flex items-center gap-2">
            <span>Submit and vote on student-driven proposals to advance the ICT Club Hub platform.</span>
            {dbLoading && <Loader2 className="w-3 h-3 text-pink-400 animate-spin" />}
          </p>
        </div>

        <button
          onClick={() => setIsFormOpen(!isFormOpen)}
          className="bg-indigo-600 hover:bg-indigo-500 text-slate-100 text-xs font-sans px-4 py-2.5 rounded-xl transition-all font-semibold flex items-center gap-1.5 shadow-md shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          <span>New Proposal</span>
        </button>
      </div>

      {/* Insert Suggestion Form */}
      {isFormOpen && (
        <form onSubmit={handleCreateSuggestion} className="bg-slate-900 border border-indigo-500/30 rounded-xl p-4 space-y-4 animate-slideDown">
          <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wide">Configure Ticket Proposal</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] uppercase font-mono text-slate-400 block mb-1">Title Proposal</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Integrate sound effect indicators, O-level past paper answers"
                className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 text-xs text-slate-150 p-2.5 rounded-lg outline-none font-sans text-slate-100"
              />
            </div>

            <div>
              <label className="text-[10px] uppercase font-mono text-slate-400 block mb-1">Select Classification</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 text-xs text-slate-200 p-2.5 rounded-lg outline-none font-sans"
              >
                <option value="Feature">Feature Request (Propose layouts/modes)</option>
                <option value="Bug">System Bug (Report broken alignment/components)</option>
                <option value="Syllabus">Syllabus Request (Identify missing chapters/revision notes)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-[10px] uppercase font-mono text-slate-400 block mb-1">Detailed description</label>
            <textarea
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What improvement would you like to see? Provide features or visual logic details clearly..."
              rows={3}
              className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 text-xs text-slate-200 p-3 rounded-lg outline-none resize-none font-sans"
            />
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsFormOpen(false)}
              className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg text-xs hover:bg-slate-700 font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-slate-100 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Submit Ticket (+20 XP)</span>
            </button>
          </div>
        </form>
      )}

      {/* Filter tab buttons */}
      <div className="flex gap-2 border-b border-slate-800 pb-2 overflow-x-auto scrollbar-none">
        {["All", "Feature", "Bug", "Syllabus"].map((cat) => (
          <button
            key={cat}
            onClick={() => setFilterCategory(cat)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-mono transition-all ${
              filterCategory === cat
                ? "bg-indigo-600/15 border border-indigo-500 text-indigo-400"
                : "bg-slate-950 border border-slate-900 text-slate-400 hover:text-slate-200"
            }`}
          >
            {cat === "All" ? "🔍 All Tickets" : cat}
          </button>
        ))}
      </div>

      {/* Suggestions List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((sug) => {
          const upvoted = !!upvotedIds[sug.id];
          return (
            <div
              key={sug.id}
              className="bg-slate-900 border border-slate-800 hover:border-slate-750 p-4.5 rounded-xl space-y-3.5 transition-all flex flex-col justify-between"
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className={`text-[9px] font-mono px-2 py-0.5 rounded-md ${
                    sug.category === "Bug" ? "bg-rose-500/10 text-rose-400 border border-rose-500/20" :
                    sug.category === "Feature" ? "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20" :
                    "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                  }`}>
                    {sug.category}
                  </span>

                  <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded ${
                    sug.status === "Approved" ? "bg-emerald-500/15 text-emerald-400" :
                    sug.status === "Reviewed" ? "bg-indigo-600/15 text-indigo-400" :
                    "bg-slate-950 text-slate-500"
                  }`}>
                    • {sug.status}
                  </span>
                </div>

                <h4 className="font-sans font-bold text-slate-200 text-sm">{sug.title}</h4>
                <p className="text-xs text-slate-400 font-light font-sans leading-relaxed">{sug.description}</p>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-850 text-[10px] font-mono select-none">
                <span className="text-slate-500">By {sug.author} on {sug.date}</span>
                <button
                  onClick={() => handleUpvote(sug.id)}
                  disabled={upvoted}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-lg border transition-all ${
                    upvoted
                      ? "bg-slate-950 border-indigo-500/30 text-indigo-400"
                      : "bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700"
                  }`}
                >
                  <ThumbsUp className={`w-3.5 h-3.5 ${upvoted ? "text-indigo-400 fill-indigo-400/10" : "text-slate-500"}`} />
                  <span>+{sug.votes} upvotes</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
