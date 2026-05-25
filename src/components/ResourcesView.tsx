import React, { useState } from "react";
import { BookOpen, Search, Download, FileText, ExternalLink, ShieldCheck, Library } from "lucide-react";
import { StudentProfile } from "../types";

interface LibraryResource {
  id: string;
  title: string;
  category: "Documentation" | "Tutorial" | "Syllabus" | "Code";
  size: string;
  format: "PDF" | "PPTX" | "ZIP" | "URL";
  author: string;
  description: string;
  clicks: number;
}

interface ResourcesViewProps {
  userProfile: StudentProfile;
  onGrantXp: (amount: number, reason: string) => void;
}

export default function ResourcesView({ userProfile, onGrantXp }: ResourcesViewProps) {
  const [resources, setResources] = useState<LibraryResource[]>([
    { id: "res-1", title: "UNEB Computer Studies Paper 2 Past Paper Answers", category: "Syllabus", size: "3.2 MB", format: "PDF", author: "Mr. Ronald Mwebesa", description: "Structured database layout queries and design criteria solution guidelines. Includes full Excel formulas step guides.", clicks: 42 },
    { id: "res-2", title: "Interactive HTML5 semantic elements master cheat sheet", category: "Documentation", size: "1.4 MB", format: "PDF", author: "Jerome Maku (S5)", description: "Cheat sheet displaying semantic nesting layouts, header-footer wrappers, article-aside margins, with Tailwind equivalents.", clicks: 25 },
    { id: "res-3", title: "Beginner CSS Flexbox bento box layout sketch tutorials", category: "Tutorial", size: "18.5 MB", format: "ZIP", author: "Nabulo Maria (S3)", description: "Visual and structural practice files. Extract index.html and style in full fluid grids to preview bento structures.", clicks: 58 },
    { id: "res-4", title: "S6 Computer Studies revision notes workbook pdf", category: "Syllabus", size: "4.8 MB", format: "PDF", author: "ICT Department Patron Board", description: "Full workbook notes for memory register calculations, operating system tasks, and networks configurations.", clicks: 19 },
    { id: "res-5", title: "Simple JavaScript DOM event listener exercises bundle", category: "Code", size: "150 KB", format: "ZIP", author: "Kyobe Arthur (S6)", description: "Raw javascript code sketches demonstrating how to capture text inputs, trigger click loops, and edit layout stylings.", clicks: 12 }
  ]);

  const [searchStr, setSearchStr] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("All");

  const incrementClick = (id: string, title: string) => {
    setResources(prev => prev.map(r => {
      if (r.id === id) {
        onGrantXp(10, `Downloaded syllabus resource: ${title}`);
        return { ...r, clicks: r.clicks + 1 };
      }
      return r;
    }));
  };

  const filtered = resources.filter(res => {
    const matchesSearch = res.title.toLowerCase().includes(searchStr.toLowerCase()) || 
                          res.description.toLowerCase().includes(searchStr.toLowerCase());
    const matchesCat = selectedFilter === "All" || res.category === selectedFilter;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="space-y-6">
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Library className="w-5 h-5 text-indigo-400" />
            <h3 className="font-sans font-semibold text-slate-100 text-sm">Digital Curricular eLibrary</h3>
          </div>
          <p className="text-[11px] text-slate-400 font-mono">Curated library holding computer workbook chapters, past papers, and visual styling assets.</p>
        </div>
      </div>

      {/* Search Input and Pill filters */}
      <div className="flex flex-col md:flex-row gap-3.5 select-none">
        <div className="flex-1 bg-slate-950 border border-slate-800 hover:border-slate-700 transition-all rounded-xl px-3.5 py-2.5 flex items-center gap-2">
          <Search className="w-4 h-4 text-slate-500 shrink-0" />
          <input
            type="text"
            value={searchStr}
            onChange={(e) => setSearchStr(e.target.value)}
            placeholder="Search documents, workbook notes, tutorials..."
            className="bg-transparent text-xs text-slate-100 outline-none w-full"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto scrollbar-none pb-1.5 md:pb-0">
          {["All", "Syllabus", "Documentation", "Tutorial", "Code"].map(filter => (
            <button
              key={filter}
              onClick={() => setSelectedFilter(filter)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-mono transition-all shrink-0 ${
                selectedFilter === filter
                  ? "bg-indigo-600/15 border border-indigo-505 text-indigo-400"
                  : "bg-slate-950 border border-slate-900 text-slate-400 hover:text-slate-200"
              }`}
            >
              {filter === "All" ? "🔍 All Resources" : filter}
            </button>
          ))}
        </div>
      </div>

      {/* Grid output */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map(res => (
          <div
            key={res.id}
            className="bg-slate-900 border border-slate-800 hover:border-slate-750 p-4 rounded-xl space-y-3 transition-all flex flex-col justify-between"
          >
            <div className="space-y-1.5">
              <div className="flex items-center justify-between font-mono text-[9px]">
                <span className="px-2 py-0.5 rounded bg-slate-950 text-slate-450 uppercase border border-slate-850">
                  {res.category}
                </span>
                <span className="text-slate-500 font-bold uppercase tracking-wider bg-indigo-600/10 text-indigo-455 px-1.5 py-0.5 rounded border border-indigo-500/10">
                  {res.format}
                </span>
              </div>

              <h4 className="text-slate-200 font-bold text-xs leading-normal select-text">{res.title}</h4>
              <p className="text-[11px] text-slate-400 font-light font-sans leading-normal select-text">{res.description}</p>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-850 text-[10px] select-none font-mono">
              <span className="text-slate-500 text-[9px]">Contributor: <strong className="text-slate-400 font-medium">{res.author}</strong></span>
              <button
                onClick={() => incrementClick(res.id, res.title)}
                className="px-3 py-1.5 bg-slate-950 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 text-[10px] text-slate-400 hover:text-indigo-400 rounded-lg flex items-center gap-1.5 transition-all"
              >
                <Download className="w-3.5 h-3.5" />
                <span>{res.clicks} views ({res.size})</span>
              </button>
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="col-span-1 md:col-span-2 text-center py-12 text-slate-500 font-mono text-xs">
            No library resources matched your criteria. Try altering your search phrases.
          </div>
        )}
      </div>
    </div>
  );
}
