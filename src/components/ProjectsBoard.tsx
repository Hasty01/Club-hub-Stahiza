import React, { useState, useEffect } from "react";
import { FolderKanban, CheckSquare, Plus, ArrowRight, Check, Trash2, Milestone, Loader2 } from "lucide-react";
import { StudentProfile } from "../types";
import { isSupabaseConfigured } from "../lib/supabaseClient";
import { fetchKanbanTasksFromSupabase, saveKanbanTaskToSupabase, updateKanbanTaskStatusInSupabase, deleteKanbanTaskFromSupabase } from "../lib/supabaseSync";

interface KanbanCard {
  id: string;
  title: string;
  description: string;
  category: "Web" | "Algorithm" | "Syllabus" | "Graphics";
  status: "Backlog" | "InProgress" | "Done";
  xpPoints: number;
}

interface ProjectsBoardProps {
  userProfile: StudentProfile;
  onGrantXp: (amount: number, reason: string) => void;
}

export default function ProjectsBoard({ userProfile, onGrantXp }: ProjectsBoardProps) {
  const [cards, setCards] = useState<KanbanCard[]>([
    { id: "kb-1", title: "Fibonacci series generator using recursion", description: "Write an HTML/JS page containing interactive fields triggering recursive algorithms to print high-bound Fibonacci lists instantly.", category: "Algorithm", status: "Backlog", xpPoints: 50 },
    { id: "kb-2", title: "Build a standard hydration tracker index", description: "Design a CSS Flex Grid bento dashboard that helps students log standard daily water consumption logs.", category: "Web", status: "InProgress", xpPoints: 60 },
    { id: "kb-3", title: "Calculate profit% in excel spreadsheet", description: "Create sample database rows, indices, write complex Formulas calculating profits and conditional values.", category: "Syllabus", status: "Done", xpPoints: 40 },
    { id: "kb-4", title: "STAHIZZA ICT Club Landing Page web master", description: "Standard welcome portal with responsive menus, hero boxes, and dynamic animations.", category: "Web", status: "Done", xpPoints: 80 }
  ]);

  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDesc, setNewTaskDesc] = useState("");
  const [newTaskCategory, setNewTaskCategory] = useState<"Web" | "Algorithm" | "Syllabus" | "Graphics">("Web");
  const [dbLoading, setDbLoading] = useState(false);

  useEffect(() => {
    async function loadTasks() {
      if (!isSupabaseConfigured) return;
      setDbLoading(true);
      const data = await fetchKanbanTasksFromSupabase();
      if (data && data.length > 0) {
        setCards(data);
      }
      setDbLoading(false);
    }
    loadTasks();
  }, []);

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    const newCard: KanbanCard = {
      id: `task-${Date.now()}`,
      title: newTaskTitle.trim(),
      description: newTaskDesc.trim() || "Independent computer studies homework assignment.",
      category: newTaskCategory,
      status: "Backlog",
      xpPoints: 30
    };

    // Optimistic Update
    setCards([...cards, newCard]);
    setNewTaskTitle("");
    setNewTaskDesc("");
    onGrantXp(15, `Created task card: ${newCard.title}`);

    if (isSupabaseConfigured) {
      await saveKanbanTaskToSupabase(newCard);
    }
  };

  const moveStatus = async (id: string, current: "Backlog" | "InProgress" | "Done") => {
    let next: "Backlog" | "InProgress" | "Done" = "Backlog";
    let rewardXp = 0;

    if (current === "Backlog") {
      next = "InProgress";
    } else if (current === "InProgress") {
      next = "Done";
      const targetCard = cards.find(c => c.id === id);
      rewardXp = targetCard ? targetCard.xpPoints : 40;
    }

    // Optimistic Update
    setCards(prev => prev.map(c => {
      if (c.id === id) {
        if (rewardXp > 0) {
          onGrantXp(rewardXp, `Completed project task: ${c.title}!`);
        }
        return { ...c, status: next };
      }
      return c;
    }));

    if (isSupabaseConfigured) {
      await updateKanbanTaskStatusInSupabase(id, next);
    }
  };

  const deleteTask = async (id: string) => {
    // Optimistic Update
    setCards(prev => prev.filter(c => c.id !== id));

    if (isSupabaseConfigured) {
      await deleteKanbanTaskFromSupabase(id);
    }
  };

  const getColCards = (status: "Backlog" | "InProgress" | "Done") => {
    return cards.filter(c => c.status === status);
  };

  return (
    <div className="space-y-6">
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <FolderKanban className="w-5 h-5 text-indigo-400" />
            <h3 className="font-sans font-semibold text-slate-100 text-sm">Project Tracking Board</h3>
          </div>
          <p className="text-[11px] text-slate-400 font-mono flex items-center gap-2">
            <span>Simulate a high-school computer masterplan software. Advance tasks to Done to earn core XP.</span>
            {dbLoading && <Loader2 className="w-3 h-3 text-pink-400 animate-spin" />}
          </p>
        </div>
      </div>

      {/* Adding Input pad form */}
      <form onSubmit={handleAddTask} className="bg-slate-950/80 border border-slate-850 p-4 rounded-xl space-y-3">
        <h4 className="text-[11px] font-bold text-slate-300 uppercase tracking-widest flex items-center gap-1.5 font-mono">
          <Milestone className="w-3.5 h-3.5 text-indigo-400" />
          <span>Add Custom Workspace Task</span>
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <input
            type="text"
            required
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            placeholder="e.g. Create standard database index..."
            className="bg-slate-900 border border-slate-800 text-xs text-slate-100 p-2.5 rounded-lg outline-none focus:border-indigo-505"
          />
          <input
            type="text"
            value={newTaskDesc}
            onChange={(e) => setNewTaskDesc(e.target.value)}
            placeholder="Description (Optional)..."
            className="bg-slate-900 border border-slate-800 text-xs text-slate-100 p-2.5 rounded-lg outline-none focus:border-indigo-505"
          />
          <div className="flex gap-2">
            <select
              value={newTaskCategory}
              onChange={(e) => setNewTaskCategory(e.target.value as any)}
              className="flex-1 bg-slate-900 border border-slate-800 text-xs text-slate-200 p-2 rounded-lg outline-none"
            >
              <option value="Web">Web Dev</option>
              <option value="Algorithm">Algorithm</option>
              <option value="Syllabus">Syllabus</option>
              <option value="Graphics">Graphics</option>
            </select>
            <button
              type="submit"
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-slate-100 rounded-lg text-xs font-semibold flex items-center gap-1 shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Add</span>
            </button>
          </div>
        </div>
      </form>

      {/* Kanban Board Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* BACKLOG COLUMN */}
        <div className="bg-[#0A111E] rounded-2xl border border-slate-850 p-4 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800 font-mono">
            <span className="text-xs font-bold text-slate-300">📁 BACKLOG ({getColCards("Backlog").length})</span>
            <span className="text-[9px] bg-slate-900 text-slate-500 px-1.5 py-0.5 rounded font-bold">Planned</span>
          </div>
          <div className="space-y-3 min-h-[300px]">
            {getColCards("Backlog").map(card => (
              <div key={card.id} className="bg-slate-950 border border-slate-850 p-3 rounded-xl space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[8px] font-mono px-2 py-0.5 bg-indigo-600/10 text-indigo-400 border border-indigo-500/10 rounded">
                    {card.category}
                  </span>
                  <span className="text-[9px] font-mono text-slate-500">+{card.xpPoints} XP</span>
                </div>
                <h5 className="text-xs font-semibold text-slate-200">{card.title}</h5>
                <p className="text-[11px] text-slate-400 leading-normal font-light">{card.description}</p>
                <div className="flex justify-between items-center pt-2 border-t border-slate-900">
                  <button onClick={() => deleteTask(card.id)} className="text-slate-600 hover:text-rose-400 transition-colors">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => moveStatus(card.id, "Backlog")}
                    className="text-[10px] bg-slate-900 border border-slate-800 hover:border-indigo-500 hover:text-indigo-400 px-2.5 py-1 text-slate-400 font-mono rounded flex items-center gap-1 transition-all"
                  >
                    <span>Start Task</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
            {getColCards("Backlog").length === 0 && (
              <p className="text-center py-8 text-[11px] font-mono text-slate-600">No pending backlog cards</p>
            )}
          </div>
        </div>

        {/* IN PROGRESS COLUMN */}
        <div className="bg-[#0A111E] rounded-2xl border border-slate-850 p-4 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800 font-mono">
            <span className="text-xs font-bold text-amber-400">⚡ IN-PROGRESS ({getColCards("InProgress").length})</span>
            <span className="text-[10px] bg-amber-500/10 text-amber-400 px-1.5 py-0.5 rounded font-bold select-none animate-pulse">Running</span>
          </div>
          <div className="space-y-3 min-h-[300px]">
            {getColCards("InProgress").map(card => (
              <div key={card.id} className="bg-slate-950 border border-amber-500/10 p-3 rounded-xl space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[8px] font-mono px-2 py-0.5 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded">
                    {card.category}
                  </span>
                  <span className="text-[9px] font-mono text-slate-500">+{card.xpPoints} XP</span>
                </div>
                <h5 className="text-xs font-semibold text-slate-200">{card.title}</h5>
                <p className="text-[11px] text-slate-400 leading-normal font-light">{card.description}</p>
                <div className="flex justify-between items-center pt-2 border-t border-slate-900">
                  <button onClick={() => deleteTask(card.id)} className="text-slate-600 hover:text-rose-400 transition-colors">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => moveStatus(card.id, "InProgress")}
                    className="text-[10px] bg-indigo-650 hover:bg-indigo-600 text-slate-100 px-2.5 py-1 font-mono rounded flex items-center gap-1 transition-all"
                  >
                    <span>Complete</span>
                    <Check className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
            {getColCards("InProgress").length === 0 && (
              <p className="text-center py-8 text-[11px] font-mono text-slate-600">No running tasks currently</p>
            )}
          </div>
        </div>

        {/* DONE COLUMN */}
        <div className="bg-[#0A111E] rounded-2xl border border-slate-850 p-4 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800 font-mono">
            <span className="text-xs font-bold text-emerald-400">✓ COMPLETED ({getColCards("Done").length})</span>
            <span className="text-[9px] bg-emerald-500/10 text-emerald-400 px-1.5 py-0.5 rounded font-bold select-none">Verified</span>
          </div>
          <div className="space-y-3 min-h-[300px]">
            {getColCards("Done").map(card => (
              <div key={card.id} className="bg-slate-950/70 border border-slate-900 p-3 rounded-xl space-y-2 opacity-80">
                <div className="flex items-center justify-between">
                  <span className="text-[8px] font-mono px-2 py-0.5 bg-emerald-500/10 text-emerald-400 rounded">
                    {card.category}
                  </span>
                  <span className="text-[9px] font-mono text-emerald-500">✓ Verified</span>
                </div>
                <h5 className="text-xs font-semibold text-slate-350 line-through decoration-slate-600">{card.title}</h5>
                <p className="text-[11px] text-slate-500 leading-normal font-light">{card.description}</p>
                <div className="flex justify-start items-center pt-1.5 text-[9px] font-mono text-emerald-400 gap-1 select-none">
                  <Check className="w-3 h-3 text-emerald-400" />
                  <span>Verified by Administrator</span>
                </div>
              </div>
            ))}
            {getColCards("Done").length === 0 && (
              <p className="text-center py-8 text-[11px] font-mono text-slate-600">No completed tasks yet</p>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
