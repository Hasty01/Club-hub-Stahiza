import React, { useState, useEffect } from "react";
import { CodeChallenge, StudentProfile } from "../types";
import { Terminal, Bug, Play, CheckCircle, RefreshCw, BookOpen, AlertCircle, Sparkles, Loader2 } from "lucide-react";
import { fetchCodeChallengesFromSupabase } from "../lib/supabaseSync";

interface CodeSandboxProps {
  userProfile: StudentProfile;
  onGrantXp: (amount: number, reason: string) => void;
  onUnlockBadge: (badge: string) => void;
}

export default function CodeSandbox({ userProfile, onGrantXp, onUnlockBadge }: CodeSandboxProps) {
  const [challenges, setChallenges] = useState<CodeChallenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedChallengeId, setSelectedChallengeId] = useState<string>("free");
  const [code, setCode] = useState<string>(`<!-- Free Play Mode -->
<div style="padding: 24px; text-align: center; font-family: 'Inter', sans-serif;">
  <span style="font-size: 3rem;">👋</span>
  <h2 style="color: #0ea5e9; margin: 12px 0 6px;">STAHIZZA Lab Sandbox</h2>
  <p style="color: #94a3b8; font-size: 14px;">Edit this code, or select an Active Syllabus Challenge to level up your technical XP points!</p>
</div>`);
  const [currentHint, setCurrentHint] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    async function loadChallenges() {
      try {
        const data = await fetchCodeChallengesFromSupabase();
        if (data && data.length > 0) {
          setChallenges(data);
        }
      } catch (err) {
        console.error("Failed to load challenges:", err);
      } finally {
        setLoading(false);
      }
    }
    loadChallenges();
  }, []);

  // Set code when challenge changes
  useEffect(() => {
    if (selectedChallengeId === "free") {
      setCode(`<!-- Free Play Mode -->
<div style="padding: 24px; text-align: center; font-family: 'Inter', sans-serif;">
  <span style="font-size: 3rem;">👋</span>
  <h2 style="color: #0ea5e9; margin: 12px 0 6px;">STAHIZZA Lab Sandbox</h2>
  <p style="color: #94a3b8; font-size: 14px;">Edit this code, or select an Active Syllabus Challenge to level up your technical XP points!</p>
</div>`);
      setTestResult(null);
      setCurrentHint(null);
    } else {
      const challenge = challenges.find(c => c.id === selectedChallengeId);
      if (challenge) {
        setCode(challenge.initialCode);
        setTestResult(null);
        setCurrentHint(null);
      }
    }
  }, [selectedChallengeId, challenges]);

  const activeChallenge = challenges.find(c => c.id === selectedChallengeId);

  // Compile full document safely for iframe preview
  const getPreviewDocument = () => {
    // If we have plain HTML/CSS
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <script src="https://cdn.tailwindcss.com"></script>
          <style>
            body { 
              font-family: system-ui, -apple-system, sans-serif; 
              color: #f1f5f9;
              background-color: transparent;
              margin: 0;
              padding: 16px; 
            }
          </style>
        </head>
        <body>
          ${code}
        </body>
      </html>
    `;
  };

  const handleTestCode = () => {
    if (!activeChallenge) return;

    try {
      // Validate code structure via regex matching defined in challenge profiles
      const regex = new RegExp(activeChallenge.solutionRegex, "i");
      const matched = regex.test(code);

      if (matched) {
        setTestResult({
          success: true,
          message: `Incredible work Cadet! Solution successfully verified. +${activeChallenge.xpReward} XP awarded to your STAHIZZA rank indices.`
        });
        
        // Grant XP if not solved before
        if (!userProfile.solvedChallengeIds.includes(activeChallenge.id)) {
          onGrantXp(activeChallenge.xpReward, `Passed Sandbox Challenge: ${activeChallenge.title}`);
          userProfile.solvedChallengeIds.push(activeChallenge.id);
          
          // Badge unlock
          if (activeChallenge.id === "c-1") {
            onUnlockBadge("HTML Cadet");
          } else if (activeChallenge.id === "c-2") {
            onUnlockBadge("CSS Artist");
          } else if (activeChallenge.id === "c-3") {
            onUnlockBadge("Scripting Guru");
          }
        }
      } else {
        setTestResult({
          success: false,
          message: `Verification Check Failed. Please match the exact structures: ${activeChallenge.testInstructions}`
        });
      }
    } catch (err: any) {
      setTestResult({
        success: false,
        message: `Logical compiler error: ${err.message || String(err)}`
      });
    }
  };

  const triggerReset = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      if (activeChallenge) {
        setCode(activeChallenge.initialCode);
      } else {
        setCode("");
      }
      setTestResult(null);
      setIsRefreshing(false);
    }, 300);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* LEFT COLUMN: Challenges & Specifications */}
      <div className="lg:col-span-4 space-y-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <BookOpen className="w-4 h-4 text-indigo-400" />
            <span className="font-sans font-semibold text-slate-100 text-sm">Active Lab Assignments</span>
          </div>
          
          <div className="space-y-2">
            <button
              onClick={() => setSelectedChallengeId("free")}
              className={`w-full text-left p-3 rounded-lg border text-xs transition-all ${
                selectedChallengeId === "free"
                  ? "bg-indigo-600/15 border-indigo-500 text-indigo-300"
                  : "bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700"
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-medium">✨ Free Play Laboratory</span>
                <span className="text-[10px] uppercase font-mono bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded">No Limits</span>
              </div>
              <p className="text-[11px] text-slate-500">Practice writing HTML, CSS, or interactive sandbox layouts freely.</p>
            </button>

            {loading ? (
              <div className="py-6 text-center text-slate-500 font-mono text-xs flex items-center justify-center gap-1.5">
                <Loader2 className="w-3.5 h-3.5 text-indigo-400 animate-spin" />
                <span>Loading challenges...</span>
              </div>
            ) : (
              challenges.map((challenge) => {
                const isSolved = userProfile.solvedChallengeIds.includes(challenge.id);
                return (
                  <button
                    key={challenge.id}
                    onClick={() => setSelectedChallengeId(challenge.id)}
                    className={`w-full text-left p-3 rounded-lg border text-xs transition-all ${
                      selectedChallengeId === challenge.id
                        ? "bg-indigo-600/15 border-indigo-500 text-indigo-300"
                        : "bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium flex items-center gap-1.5">
                        {challenge.title}
                        {isSolved && <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
                      </span>
                      <span className={`text-[9px] uppercase font-mono px-1.5 py-0.5 rounded ${
                        challenge.difficulty === "Beginner" ? "bg-emerald-500/10 text-emerald-400" :
                        challenge.difficulty === "Intermediate" ? "bg-amber-500/10 text-amber-400" :
                        "bg-rose-500/10 text-rose-400"
                      }`}>
                        {challenge.difficulty}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 line-clamp-2">{challenge.description}</p>
                    <div className="mt-2 flex items-center justify-between text-[10px] font-mono text-slate-400 border-t border-slate-800/60 pt-1.5">
                      <span>XP Reward: +{challenge.xpReward}</span>
                      <span className="text-indigo-400/90 bg-indigo-500/10 px-1.5 py-0.5 rounded text-[9px]">{challenge.category}</span>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Selected challenge instructions card */}
        {selectedChallengeId !== "free" && activeChallenge && (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
            <h4 className="font-sans font-semibold text-slate-200 text-xs">SPECIFICATIONS</h4>
            <div className="space-y-1.5 text-xs text-slate-300">
              <p className="text-slate-400 text-[11px] leading-relaxed">
                {activeChallenge.description}
              </p>
              <div className="bg-slate-950/70 p-2.5 rounded-lg border border-slate-800 font-mono text-[10px] text-slate-400">
                <span className="text-indigo-400 font-medium">Test Conditions:</span>
                <p className="mt-1">{activeChallenge.testInstructions}</p>
              </div>
            </div>

            <div className="flex gap-2 pt-1 border-t border-slate-800/60">
              <button
                type="button"
                onClick={() => setCurrentHint(activeChallenge.hint)}
                className="text-[11px] font-mono text-indigo-400 hover:text-indigo-300 transition-colors"
              >
                💡 Need a hint?
              </button>
            </div>

            {currentHint && (
              <div className="p-3 bg-indigo-950/40 border border-indigo-900/40 rounded-lg text-xs text-indigo-200 animate-fadeIn font-sans leading-relaxed">
                <span className="font-semibold block mb-1">Mentor Support Hint:</span>
                {currentHint}
              </div>
            )}
          </div>
        )}
      </div>

      {/* RIGHT COLUMN: Code Editor (Write Space) & Real Live Preview */}
      <div className="lg:col-span-8 space-y-4">
        {/* Editor controls tabbar */}
        <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-xl flex flex-col h-[520px]">
          <div className="flex items-center justify-between px-4 py-3 bg-slate-900 border-b border-slate-800 shrink-0">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-slate-400" />
              <span className="text-xs font-mono font-medium text-slate-300">
                {selectedChallengeId === "free" ? "sandbox-main.html" : `assignment-${activeChallenge?.id}.html`}
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={triggerReset}
                disabled={isRefreshing}
                className="p-1 px-2.5 rounded-md hover:bg-slate-800 text-[10px] font-mono text-slate-400 hover:text-slate-200 transition-all flex items-center gap-1.5 border border-slate-800"
                title="Reset code window"
              >
                <RefreshCw className={`w-3 h-3 ${isRefreshing ? 'animate-spin' : ''}`} />
                <span>Reset</span>
              </button>

              {selectedChallengeId !== "free" && (
                <button
                  onClick={handleTestCode}
                  className="bg-indigo-600 hover:bg-indigo-500 text-slate-100 text-[11px] font-mono px-3 py-1 rounded-md transition-all flex items-center gap-1 shadow-md shadow-indigo-950/25"
                >
                  <Play className="w-3 h-3 text-slate-100 fill-slate-100" />
                  <span>Verify Answer</span>
                </button>
              )}
            </div>
          </div>

          <div className="flex flex-1 min-h-0 divide-x divide-slate-800">
            {/* Editor Textarea */}
            <div className="w-1/2 flex flex-col min-h-0 bg-slate-950">
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="<!-- Write your HTML / CSS / JS code here -->"
                className="flex-1 w-full bg-slate-950 text-slate-100 font-mono text-xs p-4 focus:outline-none focus:ring-0 resize-none overflow-y-auto leading-relaxed scrollbar-thin scrollbar-thumb-slate-800"
                style={{ tabSize: 2 }}
              />
            </div>

            {/* Split screen physical compiler Iframe */}
            <div className="w-1/2 flex flex-col min-h-0 bg-slate-900/40 relative">
              <div className="absolute right-3 top-2.5 z-10 px-2 py-0.5 rounded font-mono text-[9px] uppercase tracking-wider bg-slate-950/60 text-slate-400 border border-slate-800 select-none">
                Live Output Preview
              </div>
              <iframe
                title="STAHIZZA Visual Sandbox Frame"
                srcDoc={getPreviewDocument()}
                sandbox="allow-scripts"
                className="flex-1 w-full bg-slate-950/30 border-none m-0 p-0"
              />
            </div>
          </div>
        </div>

        {/* Dynamic Verification Checks Results */}
        {testResult && (
          <div className={`p-4 rounded-xl border flex items-start gap-3 animate-fadeIn ${
            testResult.success
              ? "bg-emerald-500/10 border-emerald-500/35 text-emerald-200"
              : "bg-amber-500/10 border-amber-500/35 text-amber-200"
          }`}>
            <span className={`p-1.5 rounded-lg shrink-0 ${
              testResult.success ? "bg-emerald-500/20 text-emerald-300" : "bg-amber-500/20 text-amber-300"
            }`}>
              {testResult.success ? <Sparkles className="w-4 h-4" /> : <Bug className="w-4 h-4" />}
            </span>
            <div className="text-xs">
              <h5 className="font-semibold">{testResult.success ? "VALIDATION PASSED" : "REVIEW NEEDED"}</h5>
              <p className="mt-1 leading-relaxed text-slate-300">{testResult.message}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
