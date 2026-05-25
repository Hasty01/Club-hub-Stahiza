import React, { useState } from "react";
import { Milestone, BookOpen, Compass, Award, CheckCircle2, Play, Sparkles } from "lucide-react";
import { StudentProfile } from "../types";

interface Step {
  id: string;
  order: number;
  title: string;
  duration: string;
  summary: string;
  triviaTest: {
    question: string;
    options: string[];
    correctIdx: number;
  };
}

interface RoadmapViewProps {
  userProfile: StudentProfile;
  onGrantXp: (amount: number, reason: string) => void;
}

export default function RoadmapView({ userProfile, onGrantXp }: RoadmapViewProps) {
  const [activeTrack, setActiveTrack] = useState<"python" | "javascript">("python");
  const [solvedStepIds, setSolvedStepIds] = useState<Record<string, boolean>>({});
  const [activeQuizStep, setActiveQuizStep] = useState<Step | null>(null);
  const [selectedAns, setSelectedAns] = useState<number | null>(null);
  const [hasCheckedAns, setHasCheckedAns] = useState(false);

  const pythonSteps: Step[] = [
    {
      id: "py-1",
      order: 1,
      title: "Introduction to Python and Setup",
      duration: "Week 1",
      summary: "Understand interpreter logic, execute print('Hello World'), learn comments and code flow schemas.",
      triviaTest: {
        question: "Which function displays custom string content onto standard computer terminal outputs in Python?",
        options: ["display()", "echo()", "print()", "write()"],
        correctIdx: 2
      }
    },
    {
      id: "py-2",
      order: 2,
      title: "Variables and Data Types",
      duration: "Week 2",
      summary: "Master integer, float, boolean, and string indicators. Perform simple arithmetic logic.",
      triviaTest: {
        question: "What output does the statement type(4.5) report in Python shell execution?",
        options: ["<class 'int'>", "<class 'float'>", "<class 'double'>", "<class 'str'>"],
        correctIdx: 1
      }
    },
    {
      id: "py-3",
      order: 3,
      title: "Control Flow & Decisions",
      duration: "Week 3",
      summary: "Implement logical branches using standard if, elif, and else statements.",
      triviaTest: {
        question: "How does Python define scopes/blocks of statements underneath conditionals instead of using curly braces {}?",
        options: ["Parentheses ()", "Indentation (standard spaces/tabs)", "Semicolons ;", "Square brackets []"],
        correctIdx: 1
      }
    }
  ];

  const jsSteps: Step[] = [
    {
      id: "js-1",
      order: 1,
      title: "JavaScript Basics and DOM Links",
      duration: "Week 1",
      summary: "Understand client-side scripting, write var/let/const parameters, connect script.js inside HTML.",
      triviaTest: {
        question: "How do you declare a block-scoped variable whose value can be reassigned in JavaScript?",
        options: ["const", "let", "var", "define"],
        correctIdx: 1
      }
    },
    {
      id: "js-2",
      order: 2,
      title: "Interactive DOM Event Listeners",
      duration: "Week 2",
      summary: "Listen to user click gestures, capture textbox input values, and alter background styles instantly.",
      triviaTest: {
        question: "Which of the following method chains returns a reference to an HTML node possessing ID 'submit-btn'?",
        options: ["document.getClass('submit-btn')", "document.getElementById('submit-btn')", "document.findId('#submit-btn')", "window.select('submit-btn')"],
        correctIdx: 1
      }
    }
  ];

  const steps = activeTrack === "python" ? pythonSteps : jsSteps;

  const handleStartQuiz = (step: Step) => {
    setActiveQuizStep(step);
    setSelectedAns(null);
    setHasCheckedAns(false);
  };

  const handleVerifyQuiz = () => {
    if (!activeQuizStep || selectedAns === null) return;
    setHasCheckedAns(true);

    if (selectedAns === activeQuizStep.triviaTest.correctIdx) {
      onGrantXp(40, `Finished Learning Path Target: ${activeQuizStep.title}`);
      setSolvedStepIds(prev => ({ ...prev, [activeQuizStep.id]: true }));
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Compass className="w-5 h-5 text-indigo-400" />
            <h3 className="font-sans font-semibold text-slate-100 text-sm">Learning Roadmaps</h3>
          </div>
          <p className="text-[11px] text-slate-400 font-mono">Structured milestones guiding beginner programming lessons. Complete quizzes to verify level proficiency.</p>
        </div>
      </div>

      {/* Track Selection tabs */}
      <div className="flex gap-2.5 border-b border-slate-800 pb-2.5">
        <button
          onClick={() => {
            setActiveTrack("python");
            setActiveQuizStep(null);
          }}
          className={`px-4 py-2 rounded-xl text-xs font-mono font-semibold tracking-wide transition-all ${
            activeTrack === "python"
              ? "bg-indigo-600 border border-indigo-500 text-slate-100 shadow-md"
              : "bg-slate-950 border border-slate-900 text-slate-400 hover:text-slate-200"
          }`}
        >
          🐍 Python Master Track
        </button>

        <button
          onClick={() => {
            setActiveTrack("javascript");
            setActiveQuizStep(null);
          }}
          className={`px-4 py-2 rounded-xl text-xs font-mono font-semibold tracking-wide transition-all ${
            activeTrack === "javascript"
              ? "bg-indigo-600 border border-indigo-500 text-slate-100 shadow-md"
              : "bg-slate-950 border border-slate-900 text-slate-400 hover:text-slate-200"
          }`}
        >
          🌐 JavaScript Web Track
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Timeline representation */}
        <div className="lg:col-span-7 space-y-6 select-none relative pl-5 border-l-2 border-slate-800/80 ml-3 py-2">
          {steps.map((step) => {
            const isSolved = !!solvedStepIds[step.id];
            return (
              <div key={step.id} className="relative space-y-2 select-none">
                {/* Visual marker */}
                <span className={`absolute -left-[30px] top-1 w-5 h-5 rounded-full flex items-center justify-center border transition-all ${
                  isSolved
                    ? "bg-emerald-500 border-emerald-400 text-slate-100 shadow-lg"
                    : "bg-slate-950 border-slate-800 text-slate-500 text-[10px] font-mono font-bold"
                }`}>
                  {isSolved ? "✓" : step.order}
                </span>

                <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2 hover:border-slate-700 transition-all">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-200">{step.title}</h4>
                    <span className="text-[9px] font-mono text-indigo-400 bg-indigo-505/10 px-2 py-0.5 rounded border border-indigo-505/20">
                      {step.duration}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 font-light leading-relaxed">{step.summary}</p>
                  
                  <div className="flex justify-between items-center pt-2 border-t border-slate-950">
                    <span className="text-[10px] font-mono text-slate-500">
                      {isSolved ? "✓ Proficiency Approved" : "Assessment Reward: +40 XP"}
                    </span>
                    <button
                      onClick={() => handleStartQuiz(step)}
                      className="px-3 py-1.5 bg-slate-950 border border-slate-805 hover:border-indigo-500 hover:text-indigo-400 text-[10px] font-mono text-slate-400 rounded-lg transition-all flex items-center gap-1"
                    >
                      <Play className="w-2.5 h-2.5 text-indigo-400 fill-indigo-400/20" />
                      <span>{isSolved ? "Retake Assessment" : "Start Assessment"}</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Assessment question panels */}
        <div className="lg:col-span-5">
          {activeQuizStep ? (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 animate-fadeIn">
              <span className="text-[9px] font-mono font-bold uppercase py-0.5 px-2.5 rounded bg-indigo-650/15 text-indigo-400 border border-indigo-505/20">
                ACTIVE ASSESSMENT MODULE
              </span>

              <h4 className="text-xs font-bold text-slate-200">{activeQuizStep.title} Quiz</h4>
              <p className="text-xs leading-relaxed text-slate-300 font-sans">{activeQuizStep.triviaTest.question}</p>

              <div className="space-y-2 pt-2 select-none">
                {activeQuizStep.triviaTest.options.map((opt, oIdx) => {
                  let optStyle = "bg-slate-950 border-slate-800 text-slate-300";
                  if (selectedAns === oIdx) {
                    optStyle = "bg-indigo-600/15 border-indigo-500 text-indigo-300";
                  }
                  if (hasCheckedAns) {
                    if (oIdx === activeQuizStep.triviaTest.correctIdx) {
                      optStyle = "bg-emerald-500/15 border-emerald-505 text-emerald-400 font-medium";
                    } else if (selectedAns === oIdx) {
                      optStyle = "bg-rose-500/15 border-rose-505 text-rose-405";
                    } else {
                      optStyle = "bg-slate-950/40 border-slate-800/40 text-slate-500 cursor-not-allowed";
                    }
                  }

                  return (
                    <button
                      key={oIdx}
                      disabled={hasCheckedAns}
                      onClick={() => setSelectedAns(oIdx)}
                      className={`w-full text-left p-3 rounded-xl border text-xs transition-all flex justify-between items-center outline-none ${optStyle}`}
                    >
                      <span>{opt}</span>
                    </button>
                  );
                })}
              </div>

              <div className="pt-2 border-t border-slate-800/80 flex justify-between items-center">
                <span className="text-[10px] font-mono text-slate-500">Reward: +40 XP</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setActiveQuizStep(null)}
                    className="px-3.5 py-1.5 bg-slate-805 hover:bg-slate-800 text-slate-300 rounded-lg text-xs"
                  >
                    Close
                  </button>
                  {!hasCheckedAns ? (
                    <button
                      onClick={handleVerifyQuiz}
                      disabled={selectedAns === null}
                      className="px-4 py-1.5 bg-indigo-500 hover:bg-indigo-600 text-slate-100 disabled:opacity-50 text-xs font-semibold rounded-lg shadow"
                    >
                      Check Answer
                    </button>
                  ) : (
                    <button
                      onClick={() => setActiveQuizStep(null)}
                      className="px-4 py-1.5 bg-indigo-500 hover:bg-indigo-650 text-slate-100 text-xs font-semibold rounded-lg shadow-md flex items-center gap-1"
                    >
                      <Sparkles className="w-3 h-3 text-slate-100" />
                      <span>{selectedAns === activeQuizStep.triviaTest.correctIdx ? "Completed!" : "Retry later"}</span>
                    </button>
                  )}
                </div>
              </div>

              {hasCheckedAns && (
                <div className={`p-3 rounded-lg text-xs border ${
                  selectedAns === activeQuizStep.triviaTest.correctIdx
                    ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                    : "bg-rose-500/10 border-rose-500/30 text-rose-300"
                }`}>
                  {selectedAns === activeQuizStep.triviaTest.correctIdx
                    ? "🙌 Well done! Solution verified successfully. +40 XP added to your core STAHIZZA rank scorecard!"
                    : "❌ Review needed. Refresh your variables and loops syntax and practice again."}
                </div>
              )}
            </div>
          ) : (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 text-center space-y-3.5">
              <Compass className="w-10 h-10 text-slate-600 mx-auto animate-pulse" />
              <div>
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-widest font-mono">No Active Assessment</h4>
                <p className="text-[11px] text-slate-500 mt-1 max-w-xs mx-auto">
                  Click the &ldquo;Start Assessment&rdquo; button bordering any track module to test your syntax proficiency live.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
