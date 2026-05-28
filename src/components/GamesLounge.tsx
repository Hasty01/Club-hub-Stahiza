import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Gamepad2, Timer, Award, Play, RotateCcw, Zap, Sparkles, Sliders,
  Trophy, Terminal, Shield, Activity, Check, X, ChevronRight, Wifi,
  Layers, SlidersHorizontal, Eye, Settings, AlertTriangle, Clock,
  Keyboard, Code, GitBranch, HardDrive, Database, Network, Hash
} from "lucide-react";
import { StudentProfile } from "../types";

interface GamesLoungeProps {
  userProfile: StudentProfile;
  onGrantXp: (amount: number, reason: string) => void;
}

// Compact Game Metadata list
const CS_GAMES = [
  { id: "reaction", name: "⚡ Reaction Speed", category: "Reflex", difficulty: "Easy", icon: "Zap" },
  { id: "math", name: "🧠 Quick Math Speedrun", category: "Logic", difficulty: "Easy", icon: "Activity" },
  { id: "guess", name: "🎯 High-Low Guess", category: "Algorithms", difficulty: "Easy", icon: "Trophy" },
  { id: "typing", name: "⌨️ Typing Speed Sprint", category: "Code Skills", difficulty: "Medium", icon: "Keyboard" },
  { id: "binaryBlitz", name: "🧮 Binary & Hex Blitz", category: "Data Encoding", difficulty: "Medium", icon: "Sliders" },
  { id: "booleanLogic", name: "🔌 Logic Gates Puzzle", category: "Hardware", difficulty: "Medium", icon: "Shield" },
  { id: "cssRacer", name: "🏎️ CSS Flexbox Racer", category: "Web Design", difficulty: "Easy", icon: "SlidersHorizontal" },
  { id: "bigOSort", name: "📈 Big-O Complexity Sort", category: "Computer Science Theory", difficulty: "Hard", icon: "Terminal" },
  { id: "apiRoulette", name: "🌐 API Status Roulette", category: "Networking", difficulty: "Easy", icon: "Wifi" },
  { id: "arraySniper", name: "🎯 Array Index Sniper", category: "Data Structures", difficulty: "Easy", icon: "Hash" },
  { id: "stackHeap", name: "🥞 Stack vs Heap Allocator", category: "System Architecture", difficulty: "Hard", icon: "Layers" },
  { id: "gitConflict", name: "🔀 Git Merge Conflict Resolver", category: "Dev Tools", difficulty: "Medium", icon: "GitBranch" }
];

export default function GamesLounge({ userProfile, onGrantXp }: GamesLoungeProps) {
  const [activeGame, setActiveGame] = useState<string>("reaction");

  // Shared statistics state
  const [personalHiScore, setPersonalHiScore] = useState<Record<string, number>>(() => {
    const cached = localStorage.getItem("stahiza_cs_game_scores");
    return cached ? JSON.parse(cached) : {};
  });

  const updateScore = (gameId: string, value: number) => {
    const prev = personalHiScore[gameId] || 0;
    if (value > prev) {
      const next = { ...personalHiScore, [gameId]: value };
      setPersonalHiScore(next);
      localStorage.setItem("stahiza_cs_game_scores", JSON.stringify(next));
    }
  };

  // ==========================================
  // GAME STATES & TIMERS
  // ==========================================
  // 1. REACTION SPEED
  const [reactionState, setReactionState] = useState<"idle" | "waiting" | "click" | "result" | "early">("idle");
  const [reactionTime, setReactionTime] = useState<number | null>(null);
  const reactionTimerRef = useRef<number | null>(null);
  const reactionStartRef = useRef<number>(0);

  // 2. QUICK MATH SPEEDRUN
  const [mathState, setMathState] = useState<"idle" | "playing" | "ended">("idle");
  const [mathQuest, setMathQuest] = useState({ q: "2 + 2", a: 4 });
  const [mathAns, setMathAns] = useState("");
  const [mathScore, setMathScore] = useState(0);
  const [mathTimer, setMathTimer] = useState(15);
  const mathTimerRef = useRef<number | null>(null);

  // 3. HIGH-LOW GUESS
  const [guessTarget, setGuessTarget] = useState(25);
  const [guessVal, setGuessVal] = useState("");
  const [guessHint, setGuessHint] = useState<string | null>(null);
  const [guessAttempts, setGuessAttempts] = useState(0);

  // 4. TYPING SPEED SPRINT
  const [typingMode, setTypingMode] = useState<"text" | "code">("code");
  const [typingPrompt, setTypingPrompt] = useState("");
  const [typingInput, setTypingInput] = useState("");
  const [typingScore, setTypingScore] = useState(0);
  const [typingTimer, setTypingTimer] = useState(20);
  const [typingIsPlaying, setTypingIsPlaying] = useState(false);
  const typingTimerRef = useRef<number | null>(null);

  // 5. BINARY BLITZ
  const [binaryTarget, setBinaryTarget] = useState(42);
  const [binaryBits, setBinaryBits] = useState<number[]>([0, 0, 0, 0, 0, 0, 0, 0]);
  const [binaryScore, setBinaryScore] = useState(0);
  const [binaryTimer, setBinaryTimer] = useState(20);
  const [binaryIsPlaying, setBinaryIsPlaying] = useState(false);
  const binaryTimerRef = useRef<number | null>(null);

  // 6. BOOLEAN LOGIC GATES PUZZLE
  const [logicA, setLogicA] = useState(true);
  const [logicB, setLogicB] = useState(false);
  const [logicGate, setLogicGate] = useState<"AND" | "OR" | "XOR" | "NAND" | "NOR">("AND");
  const [logicScore, setLogicScore] = useState(0);
  const [logicTimer, setLogicTimer] = useState(15);
  const [logicIsPlaying, setLogicIsPlaying] = useState(false);
  const logicTimerRef = useRef<number | null>(null);

  // 7. CSS FLEXBOX RACER
  const [cssJustify, setCssJustify] = useState<string>("flex-start");
  const [cssAlign, setCssAlign] = useState<string>("flex-start");
  const [cssGoalJustify, setCssGoalJustify] = useState<string>("center");
  const [cssGoalAlign, setCssGoalAlign] = useState<string>("center");
  const [cssScore, setCssScore] = useState(0);

  // 8. BIG-O COMPLEXITY SORT
  const [bigOList, setBigOList] = useState<string[]>([]);
  const [bigOFeedback, setBigOFeedback] = useState<string | null>(null);
  const [bigOScore, setBigOScore] = useState(0);

  // 9. API STATUS CODE ROULETTE
  const [apiScenario, setApiScenario] = useState({ text: "Page not found", code: 404 });
  const [apiScore, setApiScore] = useState(0);
  const [apiTimer, setApiTimer] = useState(15);
  const [apiIsPlaying, setApiIsPlaying] = useState(false);
  const apiTimerRef = useRef<number | null>(null);

  // 10. ARRAY INDEX SNIPER
  const [arrayCode, setArrayCode] = useState("let items = ['JS', 'HTML', 'CSS', 'Python']");
  const [arrayQuestion, setArrayQuestion] = useState("What is the zero-indexed value of items[2]?");
  const [arrayAnswer, setArrayAnswer] = useState("CSS");
  const [arrayOptions, setArrayOptions] = useState<string[]>([]);
  const [arrayScore, setArrayScore] = useState(0);

  // 11. STACK VS HEAP ALLOCATOR
  const [stackHeapCurrent, setStackHeapCurrent] = useState({ text: "int count = 42;", type: "stack" });
  const [stackHeapScore, setStackHeapScore] = useState(0);
  const [stackHeapTimer, setStackHeapTimer] = useState(15);
  const [stackHeapIsPlaying, setStackHeapIsPlaying] = useState(false);
  const stackHeapTimerRef = useRef<number | null>(null);

  // 12. GIT MERGE CONFLICT RESOLVER
  const [gitStatus, setGitStatus] = useState<"idle" | "playing" | "correct" | "incorrect">("idle");
  const [gitScenario, setGitScenario] = useState<{ code: string[]; target: string; options: string[]; answerIndex: number }>({
    code: ["<<<<<<< HEAD", "const version = 'v1.4';", "=======", "const version = 'v1.5';", ">>>>>>> main"],
    target: "We want to enforce the latest v1.5 release production parameter.",
    options: ["Keep HEAD Change (v1.4)", "Accept Incoming Change (v1.5)", "Accept Both"],
    answerIndex: 1
  });
  const [gitScore, setGitScore] = useState(0);

  // Clear timers on dismantle
  useEffect(() => {
    return () => {
      stopAllTimers();
    };
  }, []);

  const stopAllTimers = () => {
    if (reactionTimerRef.current) clearTimeout(reactionTimerRef.current);
    if (mathTimerRef.current) clearInterval(mathTimerRef.current);
    if (typingTimerRef.current) clearInterval(typingTimerRef.current);
    if (binaryTimerRef.current) clearInterval(binaryTimerRef.current);
    if (logicTimerRef.current) clearInterval(logicTimerRef.current);
    if (apiTimerRef.current) clearInterval(apiTimerRef.current);
    if (stackHeapTimerRef.current) clearInterval(stackHeapTimerRef.current);
  };

  // Change Active Game Trigger
  const handleGameSelect = (gameId: string) => {
    stopAllTimers();
    setActiveGame(gameId);
    
    // Auto initialize chosen game parameters
    if (gameId === "reaction") resetReaction();
    else if (gameId === "math") resetMath();
    else if (gameId === "guess") resetGuess();
    else if (gameId === "typing") resetTyping();
    else if (gameId === "binaryBlitz") resetBinaryBlitz();
    else if (gameId === "booleanLogic") resetBooleanLogic();
    else if (gameId === "cssRacer") resetCssRacer();
    else if (gameId === "bigOSort") resetBigOSort();
    else if (gameId === "apiRoulette") resetApiRoulette();
    else if (gameId === "arraySniper") resetArraySniper();
    else if (gameId === "stackHeap") resetStackHeap();
    else if (gameId === "gitConflict") resetGitConflict();
  };

  // ==========================================
  // GAME LOGIC IMPLEMENTATIONS
  // ==========================================

  // 1. REACTION SPEED
  const resetReaction = () => {
    setReactionState("idle");
    setReactionTime(null);
    if (reactionTimerRef.current) clearTimeout(reactionTimerRef.current);
  };

  const startReaction = () => {
    setReactionState("waiting");
    setReactionTime(null);
    const delay = 1500 + Math.random() * 2500;
    if (reactionTimerRef.current) clearTimeout(reactionTimerRef.current);
    reactionTimerRef.current = window.setTimeout(() => {
      setReactionState("click");
      reactionStartRef.current = performance.now();
    }, delay);
  };

  const clickReaction = () => {
    if (reactionState === "waiting") {
      if (reactionTimerRef.current) clearTimeout(reactionTimerRef.current);
      setReactionState("early");
    } else if (reactionState === "click") {
      const ms = Math.round(performance.now() - reactionStartRef.current);
      setReactionTime(ms);
      setReactionState("result");
      updateScore("reaction", ms);
      if (ms < 250) {
        onGrantXp(25, `Superb CSS CPU Reflex Speed of ${ms}ms!`);
      } else {
        onGrantXp(10, `Completed reaction Speedcheck at ${ms}ms.`);
      }
    }
  };

  // 2. QUICK MATH
  const resetMath = () => {
    setMathState("idle");
    setMathScore(0);
    setMathAns("");
  };

  const generateMathQuest = () => {
    const ops = ["+", "-", "*"];
    const op = ops[Math.floor(Math.random() * ops.length)];
    let n1 = 0, n2 = 0, ans = 0;
    if (op === "+") {
      n1 = Math.floor(3 + Math.random() * 25);
      n2 = Math.floor(3 + Math.random() * 25);
      ans = n1 + n2;
    } else if (op === "-") {
      n1 = Math.floor(15 + Math.random() * 30);
      n2 = Math.floor(1 + Math.random() * 14);
      ans = n1 - n2;
    } else {
      n1 = Math.floor(2 + Math.random() * 9);
      n2 = Math.floor(2 + Math.random() * 8);
      ans = n1 * n2;
    }
    setMathQuest({ q: `${n1} ${op} ${n2}`, a: ans });
  };

  const startMath = () => {
    setMathState("playing");
    setMathScore(0);
    setMathTimer(15);
    setMathAns("");
    generateMathQuest();
    if (mathTimerRef.current) clearInterval(mathTimerRef.current);
    mathTimerRef.current = window.setInterval(() => {
      setMathTimer(prev => {
        if (prev <= 1) {
          clearInterval(mathTimerRef.current!);
          setMathState("ended");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const submitMath = (e: React.FormEvent) => {
    e.preventDefault();
    if (parseInt(mathAns) === mathQuest.a) {
      const nextScore = mathScore + 1;
      setMathScore(nextScore);
      updateScore("math", nextScore);
      setMathAns("");
      generateMathQuest();
      onGrantXp(5, "Quick Math correct calculation!");
    } else {
      setMathAns("");
    }
  };

  // 3. HIGH-LOW BINARY GUESS
  const resetGuess = () => {
    setGuessTarget(Math.floor(1 + Math.random() * 100));
    setGuessVal("");
    setGuessHint(null);
    setGuessAttempts(0);
  };

  const submitGuess = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseInt(guessVal);
    if (isNaN(val)) return;
    const nextAttempts = guessAttempts + 1;
    setGuessAttempts(nextAttempts);
    if (val === guessTarget) {
      setGuessHint("success");
      updateScore("guess", nextAttempts);
      onGrantXp(Math.max(10, 60 - nextAttempts * 5), `Found the secret binary target ${guessTarget} in ${nextAttempts} guesses.`);
    } else if (val < guessTarget) {
      setGuessHint(`📟 Response: Higher! Input ${val} is too low for the register.`);
    } else {
      setGuessHint(`📟 Response: Lower! Input ${val} is overflow bounds.`);
    }
    setGuessVal("");
  };

  // 4. TYPING SPEED SPRINT
  const plainPrompts = [
    "let buffer = new ArrayBuffer(1024);",
    "const handleUpdate = () => { return state; }",
    "if (status === 200 && data.valid) { resolveUnit(); }",
    "import { GoogleGenAI } from '@google/genai';",
    "const response = await fetch('/api/cyber/port');",
    "git commit -am 'Hotfix: resolve stack memory leak'"
  ];

  const resetTyping = () => {
    setTypingPrompt(plainPrompts[Math.floor(Math.random() * plainPrompts.length)]);
    setTypingInput("");
    setTypingScore(0);
    setTypingTimer(20);
    setTypingIsPlaying(false);
  };

  const startTyping = () => {
    setTypingIsPlaying(true);
    setTypingScore(0);
    setTypingTimer(20);
    setTypingInput("");
    setTypingPrompt(plainPrompts[Math.floor(Math.random() * plainPrompts.length)]);
    if (typingTimerRef.current) clearInterval(typingTimerRef.current);
    typingTimerRef.current = window.setInterval(() => {
      setTypingTimer(prev => {
        if (prev <= 1) {
          clearInterval(typingTimerRef.current!);
          setTypingIsPlaying(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  useEffect(() => {
    if (typingIsPlaying && typingInput === typingPrompt) {
      // Completed current line!
      const nextScore = typingScore + 1;
      setTypingScore(nextScore);
      updateScore("typing", nextScore);
      onGrantXp(15, `Completed typing speed sprint block flawlessly: ${typingPrompt.slice(0, 15)}...`);
      setTypingInput("");
      setTypingPrompt(plainPrompts[Math.floor(Math.random() * plainPrompts.length)]);
    }
  }, [typingInput]);

  // 5. BINARY BLITZ
  const resetBinaryBlitz = () => {
    setBinaryTarget(Math.floor(1 + Math.random() * 254));
    setBinaryBits([0, 0, 0, 0, 0, 0, 0, 0]);
    setBinaryScore(0);
    setBinaryTimer(20);
    setBinaryIsPlaying(false);
  };

  const startBinaryBlitz = () => {
    setBinaryIsPlaying(true);
    setBinaryScore(0);
    setBinaryTimer(20);
    setBinaryBits([0, 0, 0, 0, 0, 0, 0, 0]);
    // Choose integer values
    setBinaryTarget(Math.floor(1 + Math.random() * 254));
    if (binaryTimerRef.current) clearInterval(binaryTimerRef.current);
    binaryTimerRef.current = window.setInterval(() => {
      setBinaryTimer(prev => {
        if (prev <= 1) {
          clearInterval(binaryTimerRef.current!);
          setBinaryIsPlaying(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const toggleBit = (idx: number) => {
    if (!binaryIsPlaying) return;
    const nextArr = [...binaryBits];
    nextArr[idx] = nextArr[idx] === 0 ? 1 : 0;
    setBinaryBits(nextArr);

    // Compute live total decimal
    const computedVal = nextArr.reduce((acc, curr, i) => acc + curr * Math.pow(2, 7 - i), 0);
    if (computedVal === binaryTarget) {
      const nextScore = binaryScore + 1;
      setBinaryScore(nextScore);
      updateScore("binaryBlitz", nextScore);
      onGrantXp(20, `Successfully flipped interactive 8-bit registers to compute ${binaryTarget}!`);
      // Target Next Integer
      setBinaryTarget(Math.floor(1 + Math.random() * 254));
      setBinaryBits([0, 0, 0, 0, 0, 0, 0, 0]);
    }
  };

  // 6. BOOLEAN LOGIC GATES PUZZLE
  const gates = ["AND", "OR", "XOR", "NAND", "NOR"];
  
  const resetBooleanLogic = () => {
    setLogicScore(0);
    setLogicTimer(15);
    setLogicIsPlaying(false);
  };

  const generateLogicGate = () => {
    setLogicA(Math.random() > 0.5);
    setLogicB(Math.random() > 0.5);
    setLogicGate(gates[Math.floor(Math.random() * gates.length)] as any);
  };

  const startBooleanLogic = () => {
    setLogicIsPlaying(true);
    setLogicScore(0);
    setLogicTimer(15);
    generateLogicGate();
    if (logicTimerRef.current) clearInterval(logicTimerRef.current);
    logicTimerRef.current = window.setInterval(() => {
      setLogicTimer(prev => {
        if (prev <= 1) {
          clearInterval(logicTimerRef.current!);
          setLogicIsPlaying(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const evaluateGate = (a: boolean, b: boolean, gate: string): boolean => {
    if (gate === "AND") return a && b;
    if (gate === "OR") return a || b;
    if (gate === "XOR") return a !== b;
    if (gate === "NAND") return !(a && b);
    if (gate === "NOR") return !(a || b);
    return false;
  };

  const submitLogic = (userValue: boolean) => {
    if (!logicIsPlaying) return;
    const realResult = evaluateGate(logicA, logicB, logicGate);
    if (userValue === realResult) {
      const nextScore = logicScore + 1;
      setLogicScore(nextScore);
      updateScore("booleanLogic", nextScore);
      onGrantXp(10, `Solved logic matrix gate output check.`);
      generateLogicGate();
    } else {
      generateLogicGate(); // Cycle anyway on wrong answer
    }
  };

  // 7. CSS FLEXBOX RACER
  const justifyOptions = ["flex-start", "center", "flex-end"];
  const alignOptions = ["flex-start", "center", "flex-end"];

  const resetCssRacer = () => {
    setCssScore(0);
    setCssJustify("flex-start");
    setCssAlign("flex-start");
    generateCssGoal();
  };

  const generateCssGoal = () => {
    const goalsJ = justifyOptions[Math.floor(Math.random() * justifyOptions.length)];
    const goalsA = alignOptions[Math.floor(Math.random() * alignOptions.length)];
    // Make sure we don't start already matching
    if (goalsJ === cssJustify && goalsA === cssAlign) {
      generateCssGoal();
    } else {
      setCssGoalJustify(goalsJ);
      setCssGoalAlign(goalsA);
    }
  };

  useEffect(() => {
    if (cssJustify === cssGoalJustify && cssAlign === cssGoalAlign) {
      const nextScore = cssScore + 1;
      setCssScore(nextScore);
      updateScore("cssRacer", nextScore);
      onGrantXp(15, `Aligned space element to ${cssGoalJustify} & ${cssGoalAlign}!`);
      // Generate Next Alignment Task
      generateCssGoal();
    }
  }, [cssJustify, cssAlign]);

  // 8. BIG-O COMPLEXITY SORT
  const bigOComplexityData = ["O(1)", "O(log n)", "O(n)", "O(n log n)", "O(n²)", "O(2ⁿ)"];

  const resetBigOSort = () => {
    setBigOFeedback(null);
    setBigOScore(0);
    // Shuffle
    const shuffled = [...bigOComplexityData].sort(() => Math.random() - 0.5);
    setBigOList(shuffled);
  };

  const moveBigOItem = (index: number, direction: "up" | "down") => {
    const nextArr = [...bigOList];
    if (direction === "up" && index > 0) {
      const tmp = nextArr[index - 1];
      nextArr[index - 1] = nextArr[index];
      nextArr[index] = tmp;
    } else if (direction === "down" && index < nextArr.length - 1) {
      const tmp = nextArr[index + 1];
      nextArr[index + 1] = nextArr[index];
      nextArr[index] = tmp;
    }
    setBigOList(nextArr);
  };

  const verifyBigOOrder = () => {
    // Check if deep match
    const isCorrect = bigOList.every((val, idx) => val === bigOComplexityData[idx]);
    if (isCorrect) {
      setBigOFeedback("SUCCESS! Correct Big-O sorting order established.");
      const nextScore = bigOScore + 1;
      setBigOScore(nextScore);
      updateScore("bigOSort", nextScore);
      onGrantXp(30, "Mastered Algorithm Theory Big-O complexity time sequence.");
    } else {
      setBigOFeedback("WRONG ORDER! Remember: O(1) < O(log n) < O(n) < O(n log n) < O(n²)");
    }
  };

  // 9. API STATUS CODE ROULETTE
  const listScenarios = [
    { text: "Dynamic query fulfilled and HTML code delivered.", code: 200 },
    { text: "Server has encountered an unhandled syntax exception.", code: 500 },
    { text: "Student database node is prohibited to general guests.", code: 403 },
    { text: "You requested a file path that is completely discarded.", code: 404 },
    { text: "Personal Auth token is missing from client header request.", code: 401 },
    { text: "Gateway timeout waiting for cloud database response.", code: 504 }
  ];

  const resetApiRoulette = () => {
    setApiScore(50);
    setApiIsPlaying(false);
  };

  const nextApiScenario = () => {
    setApiScenario(listScenarios[Math.floor(Math.random() * listScenarios.length)]);
  };

  const startApiRoulette = () => {
    setApiIsPlaying(true);
    setApiScore(0);
    setApiTimer(15);
    nextApiScenario();
    if (apiTimerRef.current) clearInterval(apiTimerRef.current);
    apiTimerRef.current = window.setInterval(() => {
      setApiTimer(prev => {
        if (prev <= 1) {
          clearInterval(apiTimerRef.current!);
          setApiIsPlaying(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const clickApiCode = (code: number) => {
    if (!apiIsPlaying) return;
    if (code === apiScenario.code) {
      const nextScore = apiScore + 1;
      setApiScore(nextScore);
      updateScore("apiRoulette", nextScore);
      onGrantXp(10, `Diagnosed API Route event successfully matching ${code}.`);
      nextApiScenario();
    } else {
      nextApiScenario();
    }
  };

  // 10. ARRAY INDEX SNIPER
  const listArrayQuests = [
    { code: "let users = ['Arthur', 'Sandra', 'Joel', 'Maria'];", q: "What is the index coordinate of 'Joel'?", a: "2", o: ["0", "1", "2", "3"] },
    { code: "let stack = ['Push', 'Pop', 'Peek'];", q: "What is stack[0] value?", a: "Push", o: ["Push", "Pop", "Peek", "undefined"] },
    { code: "let ports = [22, 80, 443];", q: "What is the evaluated output of ports.length?", a: "3", o: ["2", "3", "4", "0"] },
    { code: "let buffer = [1, 0, 1, 1];", q: "What is buffer[4] index return?", a: "undefined", o: ["0", "1", "undefined", "null"] }
  ];

  const resetArraySniper = () => {
    setArrayScore(0);
    generateArraySniper();
  };

  const generateArraySniper = () => {
    const qNode = listArrayQuests[Math.floor(Math.random() * listArrayQuests.length)];
    setArrayCode(qNode.code);
    setArrayQuestion(qNode.q);
    setArrayAnswer(qNode.a);
    setArrayOptions(qNode.o);
  };

  const clickArrayOption = (opt: string) => {
    if (opt === arrayAnswer) {
      const nextScore = arrayScore + 1;
      setArrayScore(nextScore);
      updateScore("arraySniper", nextScore);
      onGrantXp(10, "Calibrating array indexing zero limits.");
      generateArraySniper();
    } else {
      generateArraySniper();
    }
  };

  // 11. STACK VS HEAP ALLOCATOR
  const allocData = [
    { text: "int limit = 1500;", type: "stack" },
    { text: "char symbol = 'e';", type: "stack" },
    { text: "new StudentProfile();", type: "heap" },
    { text: "malloc(4096 * sizeof(float));", type: "heap" },
    { text: "bool isCorrect = false;", type: "stack" },
    { text: "new DatabaseConnectionPool();", type: "heap" }
  ];

  const resetStackHeap = () => {
    setStackHeapScore(0);
    setStackHeapIsPlaying(false);
  };

  const startStackHeap = () => {
    setStackHeapIsPlaying(true);
    setStackHeapScore(0);
    setStackHeapTimer(15);
    setStackHeapCurrent(allocData[Math.floor(Math.random() * allocData.length)]);
    if (stackHeapTimerRef.current) clearInterval(stackHeapTimerRef.current);
    stackHeapTimerRef.current = window.setInterval(() => {
      setStackHeapTimer(prev => {
        if (prev <= 1) {
          clearInterval(stackHeapTimerRef.current!);
          setStackHeapIsPlaying(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleAllocate = (chosen: "stack" | "heap") => {
    if (!stackHeapIsPlaying) return;
    if (chosen === stackHeapCurrent.type) {
      const nextScore = stackHeapScore + 1;
      setStackHeapScore(nextScore);
      updateScore("stackHeap", nextScore);
      onGrantXp(15, `Successfully mapped '${stackHeapCurrent.text}' memory allocation.`);
      setStackHeapCurrent(allocData[Math.floor(Math.random() * allocData.length)]);
    } else {
      setStackHeapCurrent(allocData[Math.floor(Math.random() * allocData.length)]);
    }
  };

  // 12. GIT MERGE CONFLICT RESOLVER
  const gitScenarios = [
    {
      code: ["<<<<<<< HEAD", "const theme = 'cosmic-dark';", "=======", "const theme = 'cyber-sunset';", ">>>>>>> main"],
      target: "We are mandated to enforce the 'cyber-sunset' style preset on all headers.",
      options: ["Accept HEAD Change", "Accept main Incoming (cyber-sunset)", "Combine Both"],
      answerIndex: 1
    },
    {
      code: ["<<<<<<< HEAD", "let usersCount = 100;", "=======", "let usersCount = parseInt(db.users);", ">>>>>>> main"],
      target: "We want real dynamic parameters instead of hardcoded offline integers.",
      options: ["Keep Current Default (100)", "Accept Dynamic Parse", "Accept Both"],
      answerIndex: 1
    }
  ];

  const resetGitConflict = () => {
    setGitScore(0);
    setGitStatus("idle");
    setGitScenario(gitScenarios[Math.floor(Math.random() * gitScenarios.length)]);
  };

  const handleGitChoice = (idx: number) => {
    if (idx === gitScenario.answerIndex) {
      setGitStatus("correct");
      const nextScore = gitScore + 1;
      setGitScore(nextScore);
      updateScore("gitConflict", nextScore);
      onGrantXp(20, "Resolved merge conflict parameters flawless commit checkout.");
    } else {
      setGitStatus("incorrect");
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 leading-relaxed select-text font-sans">
      
      {/* LEFT COLUMN: RETRO CABINET SELECTOR */}
      <div className="lg:col-span-4 space-y-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center gap-3">
          <Gamepad2 className="w-8 h-8 text-pink-500 shrink-0" />
          <div>
            <h3 className="font-extrabold text-xs text-slate-100 uppercase tracking-tight">STAHIZZA Games Lounge</h3>
            <p className="text-[10px] text-slate-400 font-mono">Select computer concepts to verify active performance records.</p>
          </div>
        </div>

        <div className="bg-slate-950/80 border border-slate-900 rounded-2xl p-3.5 space-y-2.5 max-h-[580px] overflow-y-auto scrollbar-thin">
          <span className="text-[9px] font-mono font-bold text-slate-500 uppercase tracking-widest pl-1">ARCADE CABINET CARDS</span>
          <div className="space-y-1.5">
            {CS_GAMES.map((game) => {
              const isActive = activeGame === game.id;
              const hi = personalHiScore[game.id] || 0;
              return (
                <button
                  key={game.id}
                  onClick={() => handleGameSelect(game.id)}
                  className={`w-full text-left p-3 rounded-xl border flex items-center justify-between transition-all cursor-pointer ${
                    isActive 
                      ? "bg-pink-500/10 border-pink-500/40 text-pink-300"
                      : "bg-[#0b1220]/60 border-[#1c2a42]/30 hover:bg-[#111A2E]/70 text-slate-350"
                  }`}
                >
                  <div className="min-w-0 pr-2">
                    <h4 className="text-xs font-bold truncate">{game.name}</h4>
                    <p className="text-[9px] text-slate-500 font-mono mt-0.5">{game.category} • {game.difficulty}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-[8px] font-mono text-slate-405 block">HI-SCORE</span>
                    <span className="text-[10px] font-mono font-black text-indigo-400">{hi}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: ACTIVE INTERACTIVE CONSOLE RENDER */}
      <div className="lg:col-span-8">
        <div className="bg-slate-900 border border-slate-850 rounded-3xl p-5 sm:p-7 min-h-[500px] flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-pink-500/[0.02] blur-[80px] pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-36 h-36 bg-indigo-500/[0.02] blur-[60px] pointer-events-none" />
          
          <div className="space-y-6 z-10 w-full">
            {/* Console HUD */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-850 pb-4 select-none">
              <div className="space-y-1">
                <span className="px-2 py-0.5 rounded text-[8px] font-mono tracking-widest bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-bold uppercase">
                  MONOSPACE EMUL_NET
                </span>
                <h2 className="text-sm font-black text-slate-100 uppercase tracking-tight">
                  {CS_GAMES.find(g => g.id === activeGame)?.name}
                </h2>
              </div>
              <div className="flex items-center gap-3 font-mono text-[10px] bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-850">
                <span className="text-slate-400">Personal Best: <strong className="text-pink-400">{personalHiScore[activeGame] || 0}</strong></span>
              </div>
            </div>

            {/* Dynamic Console screens */}
            <div className="flex flex-col items-center justify-center min-h-[300px]">

              {/* 1. REACTION SPEED */}
              {activeGame === "reaction" && (
                <div className="w-full max-w-md text-center space-y-5 animate-pulse-slow">
                  <div
                    onClick={clickReaction}
                    className={`w-full aspect-video rounded-2xl flex flex-col items-center justify-center cursor-pointer select-none transition-all duration-150 p-6 ${
                      reactionState === "idle" ? "bg-slate-950 border border-slate-850" :
                      reactionState === "waiting" ? "bg-rose-500/20 hover:bg-rose-500/30 border-2 border-rose-500/80 filter drop-shadow animate-pulse" :
                      reactionState === "click" ? "bg-emerald-500 text-slate-950 font-black pointer-events-auto" :
                      reactionState === "early" ? "bg-amber-600 outline-none text-slate-100" :
                      "bg-slate-950 border border-slate-850"
                    }`}
                  >
                    {reactionState === "idle" && (
                      <div className="space-y-2 select-none">
                        <Play className="w-10 h-10 mx-auto text-indigo-400 animate-bounce" />
                        <p className="text-xs font-mono text-slate-300">Click anywhere on this warning sign to ARM sensor ticker.</p>
                      </div>
                    )}
                    {reactionState === "waiting" && (
                      <div className="space-y-2">
                        <p className="text-xs font-mono animate-pulse tracking-widest text-rose-300 font-extrabold">WAITING FOR SOLID GREEN...</p>
                        <p className="text-[10px] text-rose-455">Early touch terminates iteration logic!</p>
                      </div>
                    )}
                    {reactionState === "click" && (
                      <div className="space-y-1.5">
                        <p className="text-xl tracking-widest font-black uppercase">TAP FAST NOW !!!</p>
                        <p className="text-xs font-bold leading-none">REFLEX RESPONSE SENSOR</p>
                      </div>
                    )}
                    {reactionState === "early" && (
                      <div className="space-y-1">
                        <p className="text-xs font-bold uppercase text-amber-100">OVERFLOW DETECTED: TIMED OUT EARLY</p>
                        <p className="text-[10px] text-amber-200">Re-click anywhere to trigger reboot loops.</p>
                      </div>
                    )}
                    {reactionState === "result" && (
                      <div className="space-y-2">
                        <Zap className="w-8 h-8 text-indigo-400 mx-auto animate-pulse" />
                        <h4 className="text-2xl font-mono font-extrabold text-white">{reactionTime} ms</h4>
                        <p className="text-[10px] text-slate-400 font-mono">
                          {reactionTime && reactionTime <= 220 ? "🚀 Elite assembly compiler reflexes!" : "🐢 Standard human context thread speed."}
                        </p>
                      </div>
                    )}
                  </div>
                  <button
                    onClick={startReaction}
                    className="px-4 py-2 bg-slate-950 border border-slate-800 text-slate-300 rounded-xl text-xs font-mono font-bold hover:text-slate-150 transition-colors"
                  >
                    Arm Sensor Core Ticker
                  </button>
                </div>
              )}

              {/* 2. QUICK MATH SPEEDRUN */}
              {activeGame === "math" && (
                <div className="w-full max-w-sm space-y-6 text-center">
                  <div className="flex justify-between items-center text-xs font-mono">
                    <span className="text-slate-400">Score Streak: <strong className="text-indigo-400 font-black">+{mathScore}</strong></span>
                    <span className="text-rose-400 font-bold flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" /> {mathTimer}s remaining
                    </span>
                  </div>

                  {mathState === "idle" && (
                    <div className="py-6 space-y-3.5">
                      <Activity className="w-10 h-10 text-indigo-400 mx-auto animate-pulse" />
                      <p className="text-xs text-slate-400">Execute as many calculation tasks as possible in 15 seconds limit.</p>
                      <button
                        onClick={startMath}
                        className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-505 text-white font-bold text-xs rounded-xl"
                      >
                        Start Compilation
                      </button>
                    </div>
                  )}

                  {mathState === "playing" && (
                    <form onSubmit={submitMath} className="space-y-4">
                      <div className="bg-slate-950 p-6 rounded-2xl border border-slate-850">
                        <span className="text-[9px] uppercase font-mono text-slate-500 font-bold tracking-widest block">ARITHMETIC EXPR</span>
                        <p className="text-2xl font-black text-pink-400 font-mono mt-1">{mathQuest.q}</p>
                      </div>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          required
                          value={mathAns}
                          onChange={(e) => setMathAns(e.target.value)}
                          placeholder="Answer..."
                          className="flex-1 bg-slate-950 border border-slate-800 text-center font-mono text-sm p-2.5 rounded-xl text-white outline-none focus:border-pink-500"
                        />
                        <button
                          type="submit"
                          className="px-5 py-2.5 bg-pink-500 text-white font-bold rounded-xl text-xs uppercase"
                        >
                          SOLVE
                        </button>
                      </div>
                    </form>
                  )}

                  {mathState === "ended" && (
                    <div className="py-6 space-y-3.5">
                      <Award className="w-10 h-10 text-amber-500 mx-auto animate-bounce" />
                      <p className="text-xs text-slate-300">Sprint closed! You established correct answer thread streak: <strong className="text-pink-400">+{mathScore}</strong></p>
                      <button
                        onClick={startMath}
                        className="px-4 py-2 bg-slate-950 border border-slate-800 text-slate-300 text-xs font-mono rounded-lg hover:text-white"
                      >
                        Start New Thread
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* 3. HIGH-LOW GUESS */}
              {activeGame === "guess" && (
                <div className="w-full max-w-sm text-center space-y-5">
                  <div className="bg-slate-950 py-3 px-4 rounded-xl border border-slate-850 text-xs text-slate-400 font-mono">
                    <span>Range: 1 - 100 • Guesses logged: <strong className="text-[#D946EF]">{guessAttempts}</strong></span>
                  </div>

                  <form onSubmit={submitGuess} className="flex gap-2">
                    <input
                      type="number"
                      required
                      min="1"
                      max="100"
                      value={guessVal}
                      onChange={(e) => setGuessVal(e.target.value)}
                      placeholder="Guess [1-100]..."
                      className="flex-1 bg-slate-950 border border-slate-800 text-center font-mono text-xs rounded-xl p-3 outline-none focus:border-indigo-500 text-white"
                    />
                    <button
                      type="submit"
                      className="px-5 py-3 bg-indigo-600 text-white text-xs font-bold rounded-xl uppercase"
                    >
                      CHECK
                    </button>
                  </form>

                  {guessHint === "success" ? (
                    <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl space-y-3">
                      <Sparkles className="w-6 h-6 text-emerald-400 mx-auto" />
                      <p className="text-xs text-slate-300">Successfully isolated integer <strong className="text-emerald-400">{guessTarget}</strong> in {guessAttempts} binary subdivisions!</p>
                      <button
                        onClick={resetGuess}
                        className="px-3.5 py-1.5 bg-slate-950 hover:bg-slate-900 border border-slate-850 rounded text-[10px] font-mono text-slate-300 uppercase"
                      >
                        Find Selector Target
                      </button>
                    </div>
                  ) : guessHint ? (
                    <div className="p-3.5 bg-slate-950/60 border border-slate-850 rounded-xl text-xs text-amber-400 font-mono">
                      {guessHint}
                    </div>
                  ) : (
                    <p className="text-[10px] text-slate-500 leading-normal font-mono max-w-xs mx-auto">
                      Guess the random address integer. High low alerts verify algorithmic binary performance bounds.
                    </p>
                  )}
                </div>
              )}

              {/* 4. TYPING SPRINT */}
              {activeGame === "typing" && (
                <div className="w-full max-w-md text-center space-y-5">
                  <div className="flex justify-between text-xs font-mono px-2 text-slate-400">
                    <span>Lines Typing Score: <strong className="text-[#D946EF]">{typingScore}</strong></span>
                    <span className="text-rose-400 font-medium">Time left: {typingTimer}s</span>
                  </div>

                  {!typingIsPlaying ? (
                    <div className="space-y-4">
                      <Keyboard className="w-10 h-10 text-[#D946EF] mx-auto animate-pulse" />
                      <p className="text-xs text-slate-400 font-mono">Type precise script syntax blocks. Correct line matches trigger score multiplier parameters.</p>
                      <button
                        onClick={startTyping}
                        className="px-5 py-2.5 bg-[#D946EF] hover:bg-[#C236D4] text-white font-bold text-xs rounded-xl"
                      >
                        Activate Typing Interface
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4 text-left">
                      <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 font-mono text-xs text-slate-350 select-none">
                        <span className="text-[8px] font-sans font-bold uppercase text-slate-500 tracking-wider block mb-1">PROMPT STRING</span>
                        <p className="text-slate-200 select-all">{typingPrompt}</p>
                      </div>

                      <input
                        type="text"
                        autoFocus
                        value={typingInput}
                        onChange={(e) => setTypingInput(e.target.value)}
                        placeholder="Type exactly as shown above..."
                        className="w-full bg-slate-950 border border-slate-850 p-3 rounded-xl font-mono text-xs text-indigo-400 outline-none focus:border-pink-500"
                      />
                    </div>
                  )}
                </div>
              )}

              {/* 5. BINARY BLITZ */}
              {activeGame === "binaryBlitz" && (
                <div className="w-full max-w-md text-center space-y-5">
                  <div className="flex justify-between text-xs font-mono px-2 text-slate-400">
                    <span>Decimal Goal: <strong className="text-pink-400 text-sm font-extrabold">{binaryTarget}</strong></span>
                    <span className="text-rose-400">{binaryTimer}s left</span>
                  </div>

                  {!binaryIsPlaying ? (
                    <div className="space-y-4">
                      <Sliders className="w-10 h-10 text-pink-500 mx-auto animate-pulse" />
                      <p className="text-xs text-slate-400 font-mono">Flip interactive 8-bit registers representing [128, 64, 32, 16, 8, 4, 2, 1] to construct target decimal coordinates.</p>
                      <button
                        onClick={startBinaryBlitz}
                        className="px-5 py-2.5 bg-pink-500 hover:bg-pink-650 text-white font-bold text-[#0b1220] text-xs rounded-xl"
                      >
                        Deploy Binary Controller
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {/* Grid representation standard 8 switches */}
                      <div className="grid grid-cols-8 gap-2">
                        {binaryBits.map((bit, idx) => {
                          const weight = Math.pow(2, 7 - idx);
                          return (
                            <button
                              key={idx}
                              onClick={() => toggleBit(idx)}
                              className={`aspect-square rounded-xl border flex flex-col justify-between p-2 select-none transition-all cursor-pointer ${
                                bit === 1
                                  ? "bg-indigo-650/40 border-pink-500 text-pink-450"
                                  : "bg-slate-950 border-slate-800 text-slate-500"
                              }`}
                            >
                              <span className="text-[8px] font-mono block opacity-60">2^{7-idx}</span>
                              <span className="font-mono text-sm font-black block my-1">{bit}</span>
                              <span className="text-[7px] font-mono block select-none bg-slate-900 px-0.5 rounded text-slate-400">#{weight}</span>
                            </button>
                          );
                        })}
                      </div>

                      <div className="p-3 bg-slate-950 rounded-xl border border-slate-850 font-mono text-xs text-slate-350">
                        Live computed byte decimal: <strong className="text-indigo-400 text-sm">{binaryBits.reduce((acc, curr, i) => acc + curr * Math.pow(2, 7 - i), 0)}</strong>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* 6. BOOLEAN LOGIC */}
              {activeGame === "booleanLogic" && (
                <div className="w-full max-w-sm text-center space-y-5">
                  <div className="flex justify-between text-xs font-mono px-2 text-slate-400">
                    <span>Solved Gates: <strong className="text-emerald-400">+{logicScore}</strong></span>
                    <span className="text-rose-400">{logicTimer}s remaining</span>
                  </div>

                  {!logicIsPlaying ? (
                    <div className="space-y-4">
                      <Shield className="w-10 h-10 text-emerald-400 mx-auto animate-pulse" />
                      <p className="text-xs text-slate-400 font-mono">Diagnose logical signals flowing down complex AND/OR/XOR operations.</p>
                      <button
                        onClick={startBooleanLogic}
                        className="px-5 py-2.5 bg-emerald-500 text-[#0b1220] font-bold text-xs rounded-xl"
                      >
                        Start Quiz Ticker
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {/* Schema Logic Visual */}
                      <div className="p-6 bg-slate-950 rounded-2xl border border-slate-850 flex items-center justify-center gap-4 text-xs font-mono select-none">
                        <div className="space-y-2 text-right">
                          <span className={`px-2 py-1 rounded block ${logicA ? "bg-emerald-500/10 text-emerald-400" : "bg-slate-900 text-slate-500"}`}>A: {logicA ? "1" : "0"}</span>
                          <span className={`px-2 py-1 rounded block ${logicB ? "bg-emerald-500/10 text-emerald-400" : "bg-slate-900 text-slate-500"}`}>B: {logicB ? "1" : "0"}</span>
                        </div>
                        <div className="text-slate-400">➡️</div>
                        <div className="bg-indigo-650/20 border border-pink-500 p-4 rounded-xl text-center">
                          <span className="text-[8px] tracking-wider block text-pink-400 font-bold uppercase">GATE LOGIC</span>
                          <span className="text-base font-black text-slate-205">{logicGate}</span>
                        </div>
                        <div className="text-slate-400">➡️</div>
                        <div className="p-3 bg-slate-900 text-slate-450 rounded font-bold">X ?</div>
                      </div>

                      <div className="grid grid-cols-2 gap-3 select-none">
                        <button
                          onClick={() => submitLogic(true)}
                          className="py-3 bg-emerald-500 text-[#0b1220] font-black text-xs font-mono rounded-xl hover:bg-emerald-405 active:scale-95 transition-transform"
                        >
                          TRUE (1)
                        </button>
                        <button
                          onClick={() => submitLogic(false)}
                          className="py-3 bg-rose-500 text-white font-black text-xs font-mono rounded-xl hover:bg-rose-555 active:scale-95 transition-transform"
                        >
                          FALSE (0)
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* 7. CSS FLEXBOX RACER */}
              {activeGame === "cssRacer" && (
                <div className="w-full max-w-md space-y-6">
                  <div className="flex justify-between items-center text-xs font-mono px-2 text-slate-400 select-none">
                    <span>Align Achievements: <strong className="text-[#D946EF]">+{cssScore}</strong></span>
                    <span className="text-amber-400">Match Goal alignment metrics!</span>
                  </div>

                  {/* Visual Render space container */}
                  <div className="aspect-video bg-slate-950 border border-slate-855 rounded-2xl relative p-5">
                    {/* Goal sector */}
                    <div 
                      className="absolute inset-5 bg-[#0b1220]/20 border-2 border-dashed border-amber-600/30 rounded-xl flex"
                      style={{ justifyContent: cssGoalJustify, alignItems: cssGoalAlign }}
                    >
                      <div className="w-10 h-10 border border-amber-400/40 bg-amber-500/10 rounded-full flex items-center justify-center text-[10px] text-amber-300 font-mono font-bold select-none">
                        GOAL
                      </div>
                    </div>

                    {/* Ship / capsule element */}
                    <div 
                      className="absolute inset-5 flex transition-all duration-300"
                      style={{ justifyContent: cssJustify, alignItems: cssAlign }}
                    >
                      <div className="w-10 h-10 rounded-full bg-pink-500/15 border-2 border-pink-500 flex items-center justify-center text-lg shadow-lg animate-pulse">
                        🚀
                      </div>
                    </div>
                  </div>

                  {/* Shorthand code input selection */}
                  <div className="p-4 bg-slate-950 border border-slate-850 rounded-xl space-y-4">
                    <pre className="text-[10px] font-mono text-slate-405 flex flex-col gap-1">
                      <span>.spaceship-rack &#123;</span>
                      <span className="text-slate-350">  display: flex;</span>
                      <span className="text-[#D946EF]">  justify-content: <strong className="text-indigo-400 font-extrabold">{cssJustify}</strong>;</span>
                      <span className="text-[#D946EF]">  align-items: <strong className="text-indigo-400 font-extrabold">{cssAlign}</strong>;</span>
                      <span>&#125;</span>
                    </pre>

                    <div className="grid grid-cols-2 gap-4 pt-2">
                      <div className="space-y-1 text-left">
                        <span className="text-[8px] font-mono uppercase text-slate-500 block">JUSTIFY PROPERTIES</span>
                        <div className="flex flex-col gap-1">
                          {justifyOptions.map((opt) => (
                            <button
                              key={opt}
                              onClick={() => setCssJustify(opt)}
                              className={`px-2 py-1 rounded text-[10px] font-mono text-left cursor-pointer ${
                                cssJustify === opt ? "bg-indigo-500/20 text-indigo-300 border border-indigo-400/30" : "bg-slate-900 border border-transparent text-slate-400 hover:text-white"
                              }`}
                            >
                              {opt}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-1 text-left">
                        <span className="text-[8px] font-mono uppercase text-slate-500 block">ALIGN PROPERTIES</span>
                        <div className="flex flex-col gap-1">
                          {alignOptions.map((opt) => (
                            <button
                              key={opt}
                              onClick={() => setCssAlign(opt)}
                              className={`px-2 py-1 rounded text-[10px] font-mono text-left cursor-pointer ${
                                cssAlign === opt ? "bg-indigo-500/20 text-indigo-300 border border-indigo-400/30" : "bg-slate-900 border border-transparent text-slate-400 hover:text-white"
                              }`}
                            >
                              {opt}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 8. BIG-O COMPLEXITY SORT */}
              {activeGame === "bigOSort" && (
                <div className="w-full max-w-sm space-y-5">
                  <div className="text-xs text-left text-slate-400 bg-slate-950 p-3.5 border border-slate-855 rounded-xl font-mono">
                    Sort complexities from **fastest** at top to **slowest** execution time at bottom.
                  </div>

                  <div className="space-y-1.5 select-none">
                    {bigOList.map((item, idx) => (
                      <div key={item} className="flex items-center justify-between p-2.5 bg-slate-950 rounded-xl border border-slate-850 font-mono text-xs">
                        <span className="text-[#D946EF] font-bold">Position #{idx + 1}: <strong className="text-white ml-2">{item}</strong></span>
                        <div className="flex gap-1 shrink-0">
                          <button
                            onClick={() => moveBigOItem(idx, "up")}
                            disabled={idx === 0}
                            className="w-6 h-6 rounded bg-slate-900 hover:bg-slate-800 disabled:opacity-30 border border-slate-800 text-slate-205 font-bold cursor-pointer"
                          >
                            ▲
                          </button>
                          <button
                            onClick={() => moveBigOItem(idx, "down")}
                            disabled={idx === bigOList.length - 1}
                            className="w-6 h-6 rounded bg-slate-900 hover:bg-slate-800 disabled:opacity-30 border border-slate-800 text-slate-205 font-bold cursor-pointer"
                          >
                            ▼
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={verifyBigOOrder}
                    className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-555 text-white font-bold text-xs rounded-xl"
                  >
                    Verify Complexity Order
                  </button>

                  {bigOFeedback && (
                    <div className={`p-3 rounded-xl border text-xs font-mono ${bigOFeedback.includes("SUCCESS") ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" : "bg-rose-500/10 border-rose-500/20 text-rose-455"}`}>
                      {bigOFeedback}
                    </div>
                  )}
                </div>
              )}

              {/* 9. API STATUS ROUTE */}
              {activeGame === "apiRoulette" && (
                <div className="w-full max-w-sm space-y-6 text-center">
                  <div className="flex justify-between items-center text-xs font-mono px-2 text-slate-400 select-none">
                    <span>Matches: <strong className="text-indigo-400">+{apiScore}</strong></span>
                    <span className="text-rose-400">{apiTimer}s remaining</span>
                  </div>

                  {!apiIsPlaying ? (
                    <div className="space-y-4">
                      <Wifi className="w-10 h-10 text-indigo-405 mx-auto animate-pulse" />
                      <p className="text-xs text-slate-400 font-mono">Map web response transaction descriptions to their standard HTTP output status cards.</p>
                      <button
                        onClick={startApiRoulette}
                        className="px-5 py-2.5 bg-indigo-600 text-white font-bold text-xs rounded-xl"
                      >
                        Start API Route Node
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-5 text-left">
                      <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 font-mono text-xs select-none">
                        <span className="text-[8px] text-slate-500 block uppercase font-sans font-bold mb-1">TRANSACTION DIAGNOSTIC</span>
                        <p className="text-slate-220 text-[11px] leading-relaxed">{apiScenario.text}</p>
                      </div>

                      <div className="grid grid-cols-3 gap-2">
                        {[200, 401, 403, 404, 500, 504].map((item) => (
                          <button
                            key={item}
                            onClick={() => clickApiCode(item)}
                            className="p-3 bg-slate-950 hover:bg-indigo-600/10 border border-slate-850 rounded-xl font-mono text-xs font-bold text-slate-100 hover:border-indigo-505 transition-all text-center select-none cursor-pointer"
                          >
                            {item}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* 10. ARRAY INDEX SNIPER */}
              {activeGame === "arraySniper" && (
                <div className="w-full max-w-sm space-y-5">
                  <div className="flex justify-between text-xs font-mono px-2 text-slate-400">
                    <span>Index Targets Sniped: <strong className="text-pink-400">+{arrayScore}</strong></span>
                    <span className="text-slate-500">Zero indices calculation</span>
                  </div>

                  <div className="p-4 bg-slate-950 rounded-2xl border border-slate-850 font-mono text-xs text-slate-350 space-y-3 select-none">
                    <pre className="text-indigo-404">{arrayCode}</pre>
                    <p className="text-slate-100 font-bold border-t border-slate-900 pt-2">{arrayQuestion}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5 select-none">
                    {arrayOptions.map((opt) => (
                      <button
                        key={opt}
                        onClick={() => clickArrayOption(opt)}
                        className="py-2.5 bg-slate-950 border border-slate-850 rounded-xl font-mono text-xs text-slate-205 hover:bg-slate-900 hover:border-slate-800 cursor-pointer"
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* 11. STACK VS HEAP ALLOCATOR */}
              {activeGame === "stackHeap" && (
                <div className="w-full max-w-sm text-center space-y-5">
                  <div className="flex justify-between text-xs font-mono px-2 text-slate-400">
                    <span>Allocated score: <strong className="text-emerald-450">+{stackHeapScore}</strong></span>
                    <span className="text-rose-450">{stackHeapTimer}s remaining</span>
                  </div>

                  {!stackHeapIsPlaying ? (
                    <div className="space-y-4">
                      <Layers className="w-10 h-10 text-emerald-450 mx-auto animate-pulse" />
                      <p className="text-xs text-slate-400 font-mono">Flick code declarations into physical Stack (fast value context) or Heap (dynamic reference pools).</p>
                      <button
                        onClick={startStackHeap}
                        className="px-5 py-2.5 bg-emerald-500 text-[#0b1220] font-bold text-xs rounded-xl"
                      >
                        Arm Compiler Memory Alloc
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-5">
                      <div className="p-6 bg-slate-950 border border-slate-850 rounded-2xl font-mono text-xs">
                        <span className="text-[8px] text-slate-500 block uppercase mb-1">C++ PROGRAM SYMBOL</span>
                        <p className="text-pink-400 font-bold text-sm tracking-wide">{stackHeapCurrent.text}</p>
                      </div>

                      <div className="grid grid-cols-2 gap-3 font-mono text-xs">
                        <button
                          onClick={() => handleAllocate("stack")}
                          className="py-3 bg-[#0B1220] border-2 border-indigo-500 text-indigo-400 hover:bg-indigo-500/10 rounded-xl font-bold cursor-pointer"
                        >
                          STACK
                        </button>
                        <button
                          onClick={() => handleAllocate("heap")}
                          className="py-3 bg-[#0B1220] border-2 border-pink-500 text-pink-450 hover:bg-pink-500/10 rounded-xl font-bold cursor-pointer"
                        >
                          HEAP (DYNAMIC)
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* 12. GIT MERGE CONFLICT RESOLVER */}
              {activeGame === "gitConflict" && (
                <div className="w-full max-w-md space-y-5">
                  <div className="flex justify-between items-center text-xs font-mono px-2 text-slate-450">
                    <span>Integrations Resolved: <strong className="text-pink-450">+{gitScore}</strong></span>
                    <span className="text-[#D946EF]">Merge scenarios</span>
                  </div>

                  <div className="space-y-3.5 text-left font-sans text-xs select-none">
                    <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-850 font-mono text-[10px] leading-relaxed text-slate-350">
                      {gitScenario.code.map((line, i) => (
                        <p key={i} className={line.startsWith("<<<<") || line.startsWith("====") || line.startsWith(">>>>") ? "text-slate-555 font-bold" : "text-emerald-400"}>
                          {line}
                        </p>
                      ))}
                    </div>

                    <div className="p-3 bg-indigo-950/20 border border-[#D946EF]/20 rounded-xl text-slate-300 font-medium">
                      🎯 Target Objective: <span className="text-white font-bold">{gitScenario.target}</span>
                    </div>

                    <div className="space-y-1.5 pt-1">
                      {gitScenario.options.map((opt, oIdx) => (
                        <button
                          key={oIdx}
                          onClick={() => handleGitChoice(oIdx)}
                          className="w-full text-left p-2.5 bg-[#0B1220] border border-slate-850 hover:border-indigo-400 rounded-xl font-mono text-[11px] font-bold text-slate-100 flex items-center justify-between cursor-pointer"
                        >
                          <span>{opt}</span>
                          <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                        </button>
                      ))}
                    </div>
                  </div>

                  {gitStatus === "correct" && (
                    <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-xs font-mono text-emerald-400 text-center animate-fadeIn">
                      🎉 SUCCESS! Merge conflict safely decoupled. Taping next task...
                      <button onClick={resetGitConflict} className="mt-2 block mx-auto px-2 py-1 bg-slate-950 text-slate-300 border border-slate-850 rounded">Next Commit</button>
                    </div>
                  )}

                  {gitStatus === "incorrect" && (
                    <div className="p-3 bg-rose-500/10 border border-rose-555/20 rounded-xl text-xs font-mono text-rose-455 text-center animate-fadeIn">
                      ⚠️ CRASH! Code compiler syntax broke build on checkout. Try again!
                      <button onClick={resetGitConflict} className="mt-2 block mx-auto px-2 py-1 bg-slate-955 text-slate-300 border border-slate-850 rounded">Try Scenario again</button>
                    </div>
                  )}
                </div>
              )}

            </div>
          </div>

          {/* Help box */}
          <div className="pt-4 border-t border-slate-850 text-slate-500 text-[10px] sm:text-[11px] font-mono flex items-center gap-1.5 select-none mt-6">
            <Settings className="w-3.5 h-3.5 text-slate-400 animate-spin" />
            <span>Interactive computer science simulations synchronize XP dynamically to your STAHIZZA profile scoreboards.</span>
          </div>
        </div>
      </div>
      
    </div>
  );
}
