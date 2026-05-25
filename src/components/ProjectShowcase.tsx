import React, { useState, useEffect } from "react";
import { ShowcaseProject, StudentProfile } from "../types";
import { INITIAL_PROJECTS } from "../data";
import { ExternalLink, Heart, Eye, PlusCircle, Globe, Terminal, Code, Award, Check, Loader2 } from "lucide-react";
import { isSupabaseConfigured } from "../lib/supabaseClient";
import { fetchProjectsFromSupabase, saveProjectToSupabase, incrementProjectLikesInSupabase } from "../lib/supabaseSync";

interface ProjectShowcaseProps {
  userProfile: StudentProfile;
  onGrantXp: (amount: number, reason: string) => void;
}

const PRESET_THUMBNAILS = [
  "https://images.unsplash.com/photo-1542831371-29b0f74f9713?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
  "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
  "https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3"
];

export default function ProjectShowcase({ userProfile, onGrantXp }: ProjectShowcaseProps) {
  const [projects, setProjects] = useState<ShowcaseProject[]>(INITIAL_PROJECTS);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [isSubmitOpen, setIsSubmitOpen] = useState(false);
  const [dbLoading, setDbLoading] = useState(false);
  
  // Create project form states
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [category, setCategory] = useState<"Web" | "Game" | "Algorithm" | "Design">("Web");
  const [tagsInput, setTagsInput] = useState("");
  const [codeSnip, setCodeSnip] = useState("");
  const [selectedThumIdx, setSelectedThumIdx] = useState(0);

  useEffect(() => {
    async function loadProjects() {
      if (!isSupabaseConfigured) return;
      setDbLoading(true);
      const data = await fetchProjectsFromSupabase();
      if (data && data.length > 0) {
        setProjects(data);
      }
      setDbLoading(false);
    }
    loadProjects();
  }, []);

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !desc.trim()) return;

    const tagsArr = tagsInput
      ? tagsInput.split(",").map(t => t.trim()).filter(Boolean)
      : [category, "Student Prep"];

    const newProj: ShowcaseProject = {
      id: `proj-${Date.now()}`,
      title: title.trim(),
      developer: userProfile.name,
      classLevel: userProfile.classLevel,
      description: desc.trim(),
      tags: tagsArr,
      likes: 0,
      views: 1,
      category,
      codeSnippet: codeSnip.trim() || undefined,
      thumbnailUrl: PRESET_THUMBNAILS[selectedThumIdx]
    };

    setProjects([newProj, ...projects]);
    setIsSubmitOpen(false);
    
    // Reset inputs
    setTitle("");
    setDesc("");
    setTagsInput("");
    setCodeSnip("");

    onGrantXp(50, `Submitted Practical Portfolio Project: ${title}`);

    if (isSupabaseConfigured) {
      await saveProjectToSupabase(newProj);
    }
  };

  const incrementLikes = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setProjects(prev => prev.map(p => {
      if (p.id === id) return { ...p, likes: p.likes + 1 };
      return p;
    }));
    if (isSupabaseConfigured) {
      await incrementProjectLikesInSupabase(id);
    }
  };

  // Filter conditions
  const filteredProjects = selectedCategory === "All"
    ? projects
    : projects.filter(p => p.category === selectedCategory);

  return (
    <div className="space-y-6">
      {/* Search & Submit Section */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h3 className="font-sans font-semibold text-slate-100 text-sm">Create & Showcase Laboratory</h3>
          <p className="text-[11px] text-slate-400 font-mono flex items-center gap-1.5">
            <span>Browse peer student project portfolios from computer studies classes.</span>
            {dbLoading && <Loader2 className="w-3 h-3 text-pink-400 animate-spin" />}
          </p>
        </div>

        <button
          onClick={() => setIsSubmitOpen(!isSubmitOpen)}
          className="bg-indigo-600 hover:bg-indigo-500 text-slate-100 text-xs font-sans px-4 py-2.5 rounded-xl transition-all font-semibold flex items-center gap-1.5 shadow-md shadow-indigo-950/25 shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Upload Portfolio Item</span>
        </button>
      </div>

      {/* Category Tabs filter */}
      <div className="flex gap-2 border-b border-slate-800 pb-2 overflow-x-auto scrollbar-none">
        {["All", "Web", "Game", "Algorithm", "Design"].map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-mono transition-all ${
              selectedCategory === cat
                ? "bg-indigo-600/15 border border-indigo-500 text-indigo-400"
                : "bg-slate-950 border border-slate-900 text-slate-400 hover:text-slate-200"
            }`}
          >
            {cat === "All" ? "🔍 All Projects" : cat}
          </button>
        ))}
      </div>

      {/* Project Creation Form Box */}
      {isSubmitOpen && (
        <form onSubmit={handleCreateProject} className="bg-slate-900 border border-indigo-500/30 rounded-2xl p-5 space-y-4 animate-slideDown">
          <h4 className="font-sans font-bold text-slate-200 text-xs uppercase tracking-wider">Configure Portfolio Entry</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div>
                <label className="text-[10px] uppercase font-mono text-slate-400 block mb-1">Project Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. School Library Index, Excel GPA Solver"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 text-xs font-sans text-slate-100 p-2.5 rounded-lg outline-none"
                />
              </div>

              <div>
                <label className="text-[10px] uppercase font-mono text-slate-400 block mb-1">Brief Description</label>
                <textarea
                  required
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  placeholder="Summarize features, user controls, what design concepts are integrated..."
                  rows={2}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 text-xs font-sans text-slate-100 p-2.5 rounded-lg outline-none resize-none"
                />
              </div>

              <div>
                <label className="text-[10px] uppercase font-mono text-slate-400 block mb-1">Project Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 text-xs font-sans text-slate-100 p-2.5 rounded-lg outline-none"
                >
                  <option value="Web">Web (HTML/CSS/JS Layouts)</option>
                  <option value="Game">Game (Algorithm Logic Puzzles)</option>
                  <option value="Algorithm">Algorithm (Computational Calculations)</option>
                  <option value="Design">Design (Digital Graphics/Templates)</option>
                </select>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-[10px] uppercase font-mono text-slate-400 block mb-1">Labels/Tags (comma separated)</label>
                <input
                  type="text"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  placeholder="e.g. React, Variables, UNEB Past Paper"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 text-xs font-sans text-slate-100 p-2.5 rounded-lg outline-none"
                />
              </div>

              <div>
                <label className="text-[10px] uppercase font-mono text-slate-400 block mb-1">Select Cover Visual Frame</label>
                <div className="grid grid-cols-3 gap-2">
                  {PRESET_THUMBNAILS.map((th, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => setSelectedThumIdx(index)}
                      className={`relative aspect-video rounded-lg overflow-hidden border border-slate-800 ${
                        selectedThumIdx === index ? "ring-2 ring-indigo-500" : ""
                      }`}
                    >
                      <img src={th} alt="mock design frame" className="w-full h-full object-cover" />
                      {selectedThumIdx === index && (
                        <span className="absolute inset-0 bg-indigo-600/30 flex items-center justify-center text-slate-100">
                          <Check className="w-4 h-4" />
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[10px] uppercase font-mono text-slate-400 block mb-1">Code Snippet (Optional)</label>
                <textarea
                  value={codeSnip}
                  onChange={(e) => setCodeSnip(e.target.value)}
                  placeholder="e.g. CSS rules, Excel functions, raw program structures..."
                  rows={2}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 text-xs font-mono text-slate-200 p-2.5 rounded-lg outline-none resize-none"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-800/60">
            <button
              type="button"
              onClick={() => setIsSubmitOpen(false)}
              className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs hover:bg-slate-700 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-slate-100 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Code className="w-3.5 h-3.5" />
              <span>Publish Creative (+50 XP)</span>
            </button>
          </div>
        </form>
      )}

      {/* Grid Portfolio Output */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProjects.map((proj) => (
          <div
            key={proj.id}
            className="group/card bg-slate-900 border border-slate-800 hover:border-slate-750 rounded-2xl overflow-hidden flex flex-col transition-all shadow-lg hover:shadow-xl"
          >
            {/* Visual Header Grid wrapper */}
            <div className="aspect-video relative overflow-hidden bg-slate-950">
              <img
                src={proj.thumbnailUrl}
                alt={proj.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover group-hover/card:scale-105 transition-transform duration-500"
              />
              <span className="absolute top-3 left-3 px-2 py-0.5 rounded text-[9px] font-mono font-medium tracking-wider uppercase bg-slate-950/80 text-indigo-400 border border-slate-800">
                {proj.category}
              </span>
            </div>

            {/* Content particulars */}
            <div className="p-4 flex-1 flex flex-col justify-between space-y-3.5 select-text">
              <div className="space-y-1.5">
                <h4 className="font-sans font-semibold text-slate-200 text-sm leading-tight select-text">
                  {proj.title}
                </h4>
                <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-400">
                  <span>Created by:</span>
                  <span className="text-slate-300 font-medium">{proj.developer}</span>
                  <span className="text-slate-500 font-normal">({proj.classLevel})</span>
                </div>
                <p className="text-xs text-slate-400 font-light font-sans line-clamp-3 leading-relaxed select-text">
                  {proj.description}
                </p>
              </div>

              {/* Tag Badges row */}
              <div className="flex flex-wrap gap-1.5 select-none">
                {proj.tags.map((tag, idx) => (
                  <span key={idx} className="text-[9px] font-mono px-2 py-0.5 rounded-md bg-slate-950 text-slate-400">
                    {tag}
                  </span>
                ))}
              </div>

              {/* Interactions Footer Section */}
              <div className="flex items-center justify-between border-t border-slate-850 pt-3 text-[10px] font-mono text-slate-500 select-none">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1">
                    <Eye className="w-3.5 h-3.5" />
                    <span>{proj.views}</span>
                  </span>
                  <button
                    onClick={(e) => incrementLikes(proj.id, e)}
                    className="flex items-center gap-1.5 hover:text-rose-400 transition-colors"
                  >
                    <Heart className="w-3.5 h-3.5" />
                    <span>{proj.likes}</span>
                  </button>
                </div>
                <span className="text-indigo-400 flex items-center gap-1 text-[9px]">
                  <Award className="w-3.5 h-3.5" />
                  <span>Verified Project</span>
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
