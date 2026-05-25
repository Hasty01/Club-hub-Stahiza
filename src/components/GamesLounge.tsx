import React, { useState, useEffect, useRef } from "react";
import { Gamepad2, Timer, Award, Play, RotateCcw, Zap, Sparkles, Sliders } from "lucide-react";
import { StudentProfile } from "../types";

interface GamesLoungeProps {
  userProfile: StudentProfile;
  onGrantXp: (amount: number, reason: string) => void;
}

export default function GamesLounge({ userProfile, onGrantXp }: GamesLoungeProps) {
  const [activeGame, setActiveGame] = useState<"reaction" | "math" | "guess">("reaction");

  // REACTION GAME STATES
  const [reactionState, setReactionState] = useState<"idle" | "waiting" | "click" | "result" | "early">("idle");
  const [reactionTime, setReactionTime] = useState<number | null>(null);
  const reactionTimerRef = useRef<number | null>(null);
  const reactionStartRef = useRef<number>(0);

  // QUICK MATH STATES
  const [mathState, setMathState] = useState<"idle" | "running" | "ended">("idle");
  const [mathQuest, setMathQuest] = useState({ q: "5 + 7", a: 12 });
  const [mathAnsStr, setMathAnsStr] = useState("");
  const [mathScore, setMathScore] = useState(0);
  const [mathTimeLeft, setMathTimeLeft] = useState(15);
  const mathTimerIntervalRef = useRef<number | null>(null);

  // NUMBER GUESS STATES
  const [guessTarget, setGuessTarget] = useState(25);
  const [guessVal, setGuessVal] = useState("");
  const [guessHint, setGuessHint] = useState<string | null>(null);
  const [guessAttempts, setGuessAttempts] = useState(0);

  // clean timers on unmount
  useEffect(() => {
    return () => {
      if (reactionTimerRef.current) clearTimeout(reactionTimerRef.current);
      if (mathTimerIntervalRef.current) clearInterval(mathTimerIntervalRef.current);
    };
  }, []);

  // -------------------------
  // REACTION TIME PHYSICS
  // -------------------------
  const startReaction = () => {
    setReactionState("waiting");
    setReactionTime(null);
    const delay = 1500 + Math.random() * 3000;
    
    if (reactionTimerRef.current) clearTimeout(reactionTimerRef.current);
    reactionTimerRef.current = window.setTimeout(() => {
      setReactionState("click");
      reactionStartRef.current = performance.now();
    }, delay);
  };

  const handleReactionClick = () => {
    if (reactionState === "waiting") {
      if (reactionTimerRef.current) clearTimeout(reactionTimerRef.current);
      setReactionState("early");
    } else if (reactionState === "click") {
      const elapsed = Math.round(performance.now() - reactionStartRef.current);
      setReactionTime(elapsed);
      setReactionState("result");
      
      if (elapsed <= 250) {
        onGrantXp(30, `Outstanding reaction speed: ${elapsed}ms!`);
      } else {
        onGrantXp(10, "Finished the Reaction Speed game!");
      }
    }
  };

  // -------------------------
  // QUICK MATH SPEEDRUN
  // -------------------------
  const generateMathQuest = () => {
    const types = ["+", "-", "*"];
    const t = types[Math.floor(Math.random() * types.length)];
    let n1 = 0, n2 = 0, ans = 0;

    if (t === "+") {
      n1 = Math.floor(2 + Math.random() * 25);
      n2 = Math.floor(2 + Math.random() * 25);
      ans = n1 + n2;
    } else if (t === "-") {
      n1 = Math.floor(10 + Math.random() * 30);
      n2 = Math.floor(1 + Math.random() * 10);
      ans = n1 - n2;
    } else {
      n1 = Math.floor(2 + Math.random() * 9);
      n2 = Math.floor(2 + Math.random() * 9);
      ans = n1 * n2;
    }

    setMathQuest({ q: `${n1} ${t} ${n2}`, a: ans });
  };

  const startMathGame = () => {
    setMathState("running");
    setMathScore(0);
    setMathTimeLeft(15);
    setMathAnsStr("");
    generateMathQuest();

    if (mathTimerIntervalRef.current) clearInterval(mathTimerIntervalRef.current);
    mathTimerIntervalRef.current = window.setInterval(() => {
      setMathTimeLeft(prev => {
        if (prev <= 1) {
          if (mathTimerIntervalRef.current) clearInterval(mathTimerIntervalRef.current);
          setMathState("ended");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  useEffect(() => {
    if (mathState === "ended") {
      if (mathScore >= 5) {
        onGrantXp(mathScore * 10, `Completed Math Challenge with streak: ${mathScore}!`);
      } else {
        onGrantXp(10, "Participated in Quick Math revision.");
      }
    }
  }, [mathState]);

  const handleMathSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numeric = parseInt(mathAnsStr);
    if (isNaN(numeric)) return;

    if (numeric === mathQuest.a) {
      setMathScore(prev => prev + 1);
      setMathAnsStr("");
      generateMathQuest();
    } else {
      setMathAnsStr(""); // Clear on incorrect
    }
  };

  // -------------------------
  // BINARY NUMBER GUESS
  // -------------------------
  const startGuessGame = () => {
    setGuessTarget(Math.floor(1 + Math.random() * 50));
    setGuessVal("");
    setGuessHint(null);
    setGuessAttempts(0);
  };

  const handleGuessSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseInt(guessVal);
    if (isNaN(num)) return;

    const currentAttempts = guessAttempts + 1;
    setGuessAttempts(currentAttempts);

    if (num === guessTarget) {
      setGuessHint("success");
      onGrantXp(Math.max(10, 50 - currentAttempts * 5), `Guessed the secret number ${guessTarget} in ${currentAttempts} attempts!`);
    } else if (num < guessTarget) {
      setGuessHint("Too LOW! Guess a larger integer.");
    } else {
      setGuessHint("Too HIGH! Guess a smaller integer.");
    }
    setGuessVal("");
  };

  return (
    <div className="space-y-6">
      {/* Search Header layout */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Gamepad2 className="w-5 h-5 text-indigo-400" />
            <h3 className="font-sans font-semibold text-slate-100 text-sm">Computer Science Games Lounge</h3>
          </div>
          <p className="text-[11px] text-slate-400 font-mono">Warm up your cognitive calculation systems. Achieve high scores to verify speed limits.</p>
        </div>
      </div>

      {/* Game Selector Tab Buttons */}
      <div className="flex flex-wrap gap-2.5 border-b border-slate-800 pb-2.5 select-none">
        <button
          onClick={() => { setActiveGame("reaction"); startReaction(); }}
          className={`px-4 py-2 rounded-xl text-xs font-mono font-semibold transition-all ${
            activeGame === "reaction"
              ? "bg-[#D946EF]/15 border border-[#D946EF] text-[#D946EF]"
              : "bg-slate-950 border border-slate-900 text-slate-400 hover:text-slate-200"
          }`}
        >
          ⚡ Reaction Speed Test
        </button>

        <button
          onClick={() => { setActiveGame("math"); startMathGame(); }}
          className={`px-4 py-2 rounded-xl text-xs font-mono font-semibold transition-all ${
            activeGame === "math"
              ? "bg-indigo-600/15 border border-indigo-505 text-indigo-400"
              : "bg-slate-950 border border-slate-900 text-slate-400 hover:text-slate-200"
          }`}
        >
          🧠 Quick Math Speedrun
        </button>

        <button
          onClick={() => { setActiveGame("guess"); startGuessGame(); }}
          className={`px-4 py-2 rounded-xl text-xs font-mono font-semibold transition-all ${
            activeGame === "guess"
              ? "bg-emerald-500/15 border border-emerald-500 text-emerald-400"
              : "bg-slate-950 border border-slate-900 text-slate-400 hover:text-slate-200"
          }`}
        >
          🎯 High-Low Number Guess
        </button>
      </div>

      <div className="bg-[#0A111E] border border-slate-850 rounded-2xl p-6 flex flex-col items-center justify-center min-h-[340px]">
        
        {/* REACTION TIME RENDER */}
        {activeGame === "reaction" && (
          <div className="w-full max-w-md text-center space-y-4">
            <h4 className="text-sm font-sans font-bold text-slate-200">REACTION TIME REFLEXES</h4>
            
            <div
              onClick={handleReactionClick}
              className={`w-full aspect-video rounded-2xl flex flex-col items-center justify-center cursor-pointer select-none transition-all duration-150 relative overflow-hidden p-6 ${
                reactionState === "idle" ? "bg-slate-950 border-slate-800 border" :
                reactionState === "waiting" ? "bg-rose-600/90 hover:bg-rose-600 filter drop-shadow" :
                reactionState === "click" ? "bg-emerald-500 text-slate-950 pointer-events-auto" :
                reactionState === "early" ? "bg-amber-600 border border-amber-500 text-slate-100" :
                "bg-slate-950 border border-slate-805"
              }`}
            >
              {reactionState === "idle" && (
                <div className="space-y-2">
                  <Play className="w-8 h-8 mx-auto text-indigo-400 animate-pulse" />
                  <p className="text-xs text-slate-300">Click anywhere on this canvas to initialize.</p>
                </div>
              )}

              {reactionState === "waiting" && (
                <div className="space-y-2 text-slate-100">
                  <p className="text-sm font-bold tracking-wider animate-pulse">WAIT FOR GREEN SCREEN...</p>
                  <p className="text-[10px] uppercase font-mono text-rose-200">Clicking now triggers abort!</p>
                </div>
              )}

              {reactionState === "click" && (
                <div className="space-y-2 text-slate-950 font-sans">
                  <p className="text-xl font-extrabold tracking-widest animate-bounce">CLICK NOW!!!</p>
                  <p className="text-xs font-medium">FAST AS POSSIBLE</p>
                </div>
              )}

              {reactionState === "early" && (
                <div className="space-y-2 text-slate-100">
                  <p className="text-sm font-bold">ABORT! TRIGGERED EARLY</p>
                  <p className="text-[11px] text-amber-200 font-mono">Click to re-arm sensor.</p>
                </div>
              )}

              {reactionState === "result" && (
                <div className="space-y-3">
                  <Zap className="w-8 h-8 mx-auto text-indigo-400 filter drop-shadow-[0_0_8px_rgba(14,165,233,0.4)]" />
                  <p className="text-2xl font-extrabold text-slate-150 font-sans">{reactionTime} ms</p>
                  <p className="text-[11px] text-slate-400 font-mono">
                    {reactionTime && reactionTime <= 200 ? "⚡ Elite Reflex Ranks!" :
                     reactionTime && reactionTime <= 280 ? "✨ Standard Student Reflex." :
                     "🐢 Slow compiler, compile again."}
                  </p>
                </div>
              )}
            </div>

            <button
              onClick={startReaction}
              className="px-4 py-2 bg-slate-950 border border-slate-800 text-slate-300 rounded-xl text-xs font-semibold hover:border-slate-700 hover:text-slate-100 font-mono"
            >
              Re-arm Sensor Timer
            </button>
          </div>
        )}

        {/* QUICK MATH RENDER */}
        {activeGame === "math" && (
          <div className="w-full max-w-sm text-center space-y-6">
            <div className="flex justify-between items-center text-xs font-mono select-none px-2">
              <span className="text-slate-400">Score Streak: <span className="text-indigo-400 font-bold">+{mathScore}</span></span>
              <span className="text-slate-400 flex items-center gap-1">
                <Timer className="w-3.5 h-3.5 text-rose-400" />
                Time left: <span className="text-rose-400 font-bold">{mathTimeLeft}s</span>
              </span>
            </div>

            {mathState === "idle" && (
              <div className="py-6 space-y-3 text-center">
                <Zap className="w-10 h-10 text-indigo-400 mx-auto animate-bounce" />
                <h5 className="text-xs font-bold text-slate-200 uppercase tracking-wider">Calculations Speedrun</h5>
                <p className="text-[11px] text-slate-500 leading-normal max-w-xs mx-auto">
                  Solve as many basic arithmetic operations as you can within 15 seconds. Correct answers gain XP increments.
                </p>
                <button
                  onClick={startMathGame}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-slate-100 text-xs font-semibold rounded-xl"
                >
                  Start Quiz Speedrun
                </button>
              </div>
            )}

            {mathState === "running" && (
              <form onSubmit={handleMathSubmit} className="space-y-4">
                <div className="bg-slate-950 p-6 rounded-2xl border border-slate-850">
                  <span className="text-[9px] uppercase font-mono text-slate-500 tracking-wider">OPERATION CALCULATOR</span>
                  <p className="text-2xl font-extrabold text-[#D946EF] font-sans tracking-wide mt-1.5">{mathQuest.q}</p>
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    autoFocus
                    value={mathAnsStr}
                    onChange={(e) => setMathAnsStr(e.target.value)}
                    placeholder="Type integer..."
                    className="flex-1 bg-slate-950 border border-slate-800 text-sm text-slate-100 p-3 rounded-xl outline-none text-center font-mono focus:border-[#D946EF]"
                  />
                  <button
                    type="submit"
                    className="px-5 py-3 bg-[#D946EF] hover:bg-[#C236D4] text-slate-100 font-semibold rounded-12 text-xs font-sans shrink-0 uppercase"
                  >
                    Solve
                  </button>
                </div>
              </form>
            )}

            {mathState === "ended" && (
              <div className="py-6 space-y-4">
                <Award className="w-10 h-10 text-amber-400 mx-auto animate-bounce" />
                <div>
                  <h5 className="text-xs font-bold text-slate-200 uppercase tracking-widest font-mono">Sprint Complete!</h5>
                  <p className="text-xs text-slate-450 mt-1">
                    You achieved a math calculation score streak of <span className="text-indigo-400 font-bold">{mathScore}</span> correct answers!
                  </p>
                </div>

                <button
                  onClick={startMathGame}
                  className="px-4 py-2 bg-slate-950 border border-slate-800 text-slate-300 hover:text-slate-100 rounded-lg text-xs font-mono flex items-center gap-1 mx-auto"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Start Again</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* NUMBER GUESS RENDER */}
        {activeGame === "guess" && (
          <div className="w-full max-w-sm text-center space-y-5">
            <h4 className="text-sm font-sans font-bold text-slate-200 uppercase tracking-wide">High-Low Binary Range (1 - 50)</h4>

            <form onSubmit={handleGuessSubmit} className="space-y-4">
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-900 font-mono text-xs text-slate-400">
                <span>Attempts register: <strong>{guessAttempts} guesses</strong></span>
              </div>

              <div className="flex gap-2.5">
                <input
                  type="number"
                  required
                  min="1"
                  max="50"
                  value={guessVal}
                  onChange={(e) => setGuessVal(e.target.value)}
                  placeholder="Guess integer [1 - 50]..."
                  className="flex-1 bg-slate-950 border border-slate-800 text-xs text-slate-100 p-3 rounded-xl outline-none text-center font-mono focus:border-emerald-505"
                />
                <button
                  type="submit"
                  className="px-5 py-3 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-extrabold text-xs rounded-xl shrink-0 uppercase"
                >
                  Guess
                </button>
              </div>
            </form>

            {guessHint && (
              <div className={`p-3.5 rounded-xl border text-xs leading-normal animate-fadeIn ${
                guessHint === "success"
                  ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-400"
                  : "bg-amber-500/10 border-amber-500/30 text-amber-400 font-mono"
              }`}>
                {guessHint === "success" ? (
                  <div className="space-y-2">
                    <Sparkles className="w-5 h-5 text-emerald-400 mx-auto" />
                    <p className="font-bold uppercase font-sans">CORRECT ESTIMATE!</p>
                    <p className="text-slate-300">You successfully found the target integer {guessTarget} in {guessAttempts} attempts!</p>
                    <button
                      type="button"
                      onClick={startGuessGame}
                      className="px-3.5 py-1.5 bg-slate-950 hover:bg-slate-900 text-[10px] text-slate-300 rounded font-bold uppercase mt-2 border border-slate-800"
                    >
                      Play Again
                    </button>
                  </div>
                ) : (
                  <span>📟 Response: {guessHint}</span>
                )}
              </div>
            )}

            {(!guessHint) && (
              <p className="text-[11px] text-slate-500 max-w-xs mx-auto text-center font-light leading-normal">
                Guess the secret integer from 1 to 50 using basic high/low binary checks. Try to minimize attempts count as much as possible!
              </p>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
