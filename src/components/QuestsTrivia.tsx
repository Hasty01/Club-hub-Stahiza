import React, { useState } from "react";
import { Quest, StudentProfile } from "../types";
import { INITIAL_QUESTS } from "../data";
import { Award, Check, X, ArrowRight, BookOpen, RotateCcw, HelpCircle, Trophy } from "lucide-react";

interface QuestsProps {
  userProfile: StudentProfile;
  onGrantXp: (amount: number, reason: string) => void;
  onUnlockBadge: (badge: string) => void;
}

export default function QuestsTrivia({ userProfile, onGrantXp, onUnlockBadge }: QuestsProps) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOptIndex, setSelectedOptIndex] = useState<number | null>(null);
  const [hasChecked, setHasChecked] = useState(false);
  const [score, setScore] = useState(0);
  const [completed, setCompleted] = useState(false);

  const activeQuest = INITIAL_QUESTS[currentIdx];

  const handleSelectOption = (optIdx: number) => {
    if (hasChecked) return;
    setSelectedOptIndex(optIdx);
  };

  const verifyChoice = () => {
    if (selectedOptIndex === null || hasChecked) return;
    setHasChecked(true);

    const isCorrect = selectedOptIndex === activeQuest.correctAnswerIndex;
    if (isCorrect) {
      setScore(prev => prev + 1);
      onGrantXp(activeQuest.xpReward, `Solved Trivia Quest: ${activeQuest.topic}`);
      
      // Unlock badge conditions based on solved counts / categories
      if (score + 1 >= 5) {
        onUnlockBadge("Trivia Master");
      }
    }
  };

  const handleNext = () => {
    setSelectedOptIndex(null);
    setHasChecked(false);

    if (currentIdx + 1 < INITIAL_QUESTS.length) {
      setCurrentIdx(prev => prev + 1);
    } else {
      setCompleted(true);
      onUnlockBadge("Curriculum Scholar");
    }
  };

  const resetTrivia = () => {
    setCurrentIdx(0);
    setSelectedOptIndex(null);
    setHasChecked(false);
    setScore(0);
    setCompleted(false);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl p-6">
      {!completed ? (
        <div className="space-y-6">
          {/* Progress Header */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-400" />
              <div>
                <h3 className="font-sans font-semibold text-slate-100 text-sm">Syllabus Training Quests</h3>
                <p className="text-[11px] font-mono text-slate-400">UNEB O-Level Core Revision Framework</p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-xs font-mono text-slate-400">Question {currentIdx + 1} of {INITIAL_QUESTS.length}</span>
              <div className="w-32 bg-slate-950 h-1.5 rounded-full mt-1.5 overflow-hidden">
                <div 
                  className="bg-indigo-600 h-full rounded-full transition-all duration-300"
                  style={{ width: `${((currentIdx + 1) / INITIAL_QUESTS.length) * 100}%` }}
                />
              </div>
            </div>
          </div>

          {/* Question layout details */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-medium bg-slate-950 text-indigo-400 border border-indigo-900/40">
                TOPIC: {activeQuest.topic}
              </span>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                activeQuest.difficulty === "Easy" ? "bg-emerald-500/10 text-emerald-400" :
                activeQuest.difficulty === "Medium" ? "bg-amber-500/10 text-amber-400" :
                "bg-rose-500/10 text-rose-400"
              }`}>
                {activeQuest.difficulty} Difficulty
              </span>
            </div>

            <h4 className="font-sans text-slate-200 font-medium text-sm sm:text-base leading-relaxed">
              {activeQuest.question}
            </h4>

            {/* Answer Options Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
              {activeQuest.options.map((opt, oIdx) => {
                let btnStyle = "bg-slate-950 border-slate-800/80 hover:bg-slate-800 text-slate-300";
                
                if (selectedOptIndex === oIdx) {
                  btnStyle = "bg-indigo-600/15 border-indigo-500 text-indigo-300";
                }
                
                if (hasChecked) {
                  if (oIdx === activeQuest.correctAnswerIndex) {
                    btnStyle = "bg-emerald-500/15 border-emerald-500 text-emerald-400 font-medium";
                  } else if (selectedOptIndex === oIdx) {
                    btnStyle = "bg-rose-500/15 border-rose-500 text-rose-400";
                  } else {
                    btnStyle = "bg-slate-950/45 border-slate-800/45 text-slate-500 cursor-not-allowed";
                  }
                }

                return (
                  <button
                    key={oIdx}
                    type="button"
                    disabled={hasChecked}
                    onClick={() => handleSelectOption(oIdx)}
                    className={`w-full text-left p-3.5 rounded-xl border text-xs sm:text-sm transition-all focus:outline-none flex justify-between items-center ${btnStyle}`}
                  >
                    <span>{opt}</span>
                    {hasChecked && oIdx === activeQuest.correctAnswerIndex && (
                      <Check className="w-4 h-4 text-emerald-400 shrink-0 ml-2" />
                    )}
                    {hasChecked && selectedOptIndex === oIdx && oIdx !== activeQuest.correctAnswerIndex && (
                      <X className="w-4 h-4 text-rose-400 shrink-0 ml-2" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Action Trigger Pad */}
          <div className="flex items-center justify-between border-t border-slate-800/60 pt-4 mt-6">
            <div className="text-xs font-mono text-slate-500">
              Quest Reward: <span className="text-amber-400 font-medium">+{activeQuest.xpReward} XP</span>
            </div>

            <div className="flex gap-2">
              {!hasChecked ? (
                <button
                  type="button"
                  onClick={verifyChoice}
                  disabled={selectedOptIndex === null}
                  className="bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 text-slate-100 disabled:text-slate-500 text-xs font-sans px-5 py-2 rounded-xl transition-all font-semibold shadow-md shadow-indigo-900/10"
                >
                  Confirm Answer
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleNext}
                  className="bg-indigo-600 hover:bg-indigo-500 text-slate-100 text-xs font-sans px-5 py-2 rounded-xl transition-all font-semibold flex items-center gap-1.5"
                >
                  <span>{currentIdx + 1 === INITIAL_QUESTS.length ? "Finish Quests" : "Next Quest"}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Revision Explanation card */}
          {hasChecked && (
            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 mt-4 text-xs leading-relaxed text-slate-400 animate-fadeIn">
              <span className="font-semibold text-indigo-400 block mb-1">MEMBER REVISION EXPLANATION:</span>
              <p>{activeQuest.explanation}</p>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-8 space-y-6">
          <div className="w-16 h-16 bg-amber-500/15 border-amber-500 border border-dashed rounded-full flex items-center justify-center mx-auto text-amber-400 animate-bounce">
            <Award className="w-7 h-7" />
          </div>

          <div className="space-y-2">
            <h3 className="font-sans text-xl font-bold text-slate-100">Revision Quests Completed!</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Outstanding commitment, scholar! You successfully solved the STAHIZZA ICT Syllabus set.
            </p>
          </div>

          <div className="bg-slate-950 max-w-md mx-auto p-4 rounded-xl border border-slate-800 grid grid-cols-2 gap-4">
            <div>
              <span className="text-[10px] font-mono uppercase text-slate-500">Total Score</span>
              <p className="text-2xl font-bold text-slate-200 mt-1">{score} / {INITIAL_QUESTS.length}</p>
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase text-slate-500">Unlocks Achieved</span>
              <p className="text-xs font-semibold text-amber-400 mt-2">✨ O-level Scholar Badge</p>
            </div>
          </div>

          <button
            type="button"
            onClick={resetTrivia}
            className="inline-flex items-center gap-2 bg-slate-950 border border-slate-800 hover:bg-slate-800 text-xs font-mono text-slate-300 px-4 py-2 rounded-lg transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Start Practice Again</span>
          </button>
        </div>
      )}
    </div>
  );
}
