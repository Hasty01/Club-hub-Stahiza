import React, { useState, useEffect } from "react";
import { Quest, StudentProfile } from "../types";
import { Award, Check, X, ArrowRight, RotateCcw, HelpCircle, Trophy, Loader2 } from "lucide-react";
import { supabase, isSupabaseConfigured } from "../lib/supabaseClient";

const O_A_LEVEL_QUESTIONS: Quest[] = [
  {
    id: "uneb-q1",
    topic: "Introduction & History",
    difficulty: "Easy",
    question: "Which historical computing device was based on sliding beads on wires to perform arithmetic?",
    options: ["Pascaline", "Analytical Engine", "Abacus", "Napier’s Bones"],
    correctAnswerIndex: 2,
    explanation: "The abacus is one of the oldest known mechanical calculating tools, using physical beads to represent units, tens, and hundreds.",
    xpReward: 10
  },
  {
    id: "uneb-q2",
    topic: "Introduction & History",
    difficulty: "Easy",
    question: "What technology characterized first-generation computers like the ENIAC?",
    options: ["Transistors", "Integrated Circuits", "Vacuum Tubes", "Microprocessors"],
    correctAnswerIndex: 2,
    explanation: "First-generation computers (1940s–1950s) relied heavily on vacuum tubes, which generated immense heat and frequently burned out.",
    xpReward: 10
  },
  {
    id: "uneb-q3",
    topic: "Introduction & History",
    difficulty: "Easy",
    question: "A smartphone or a modern washing machine uses what category of computer?",
    options: ["Mainframe computer", "Supercomputer", "Embedded computer", "Minicomputer"],
    correctAnswerIndex: 2,
    explanation: "Embedded computers are specialized microprocessors built directly into non-computer devices to perform dedicated control functions.",
    xpReward: 10
  },
  {
    id: "uneb-q4",
    topic: "Introduction & History",
    difficulty: "Medium",
    question: "Which of the following storage capacities is the largest?",
    options: ["500 Megabytes (MB)", "2 Gigabytes (GB)", "1,500 Kilobytes (KB)", "1 Terabyte (TB)"],
    correctAnswerIndex: 3,
    explanation: "Storage hierarchies scale upwards from KB ➔ MB ➔ GB ➔ TB. 1 Terabyte equals approximately 1,000 Gigabytes.",
    xpReward: 10
  },
  {
    id: "uneb-q5",
    topic: "Hardware & Troubleshooting",
    difficulty: "Medium",
    question: "Which component performs all mathematical calculations and logical comparisons within the CPU?",
    options: ["Control Unit (CU)", "Arithmetic Logic Unit (ALU)", "Bios chip", "System Clock"],
    correctAnswerIndex: 1,
    explanation: "The CPU is divided into the CU (which directs traffic) and the ALU (which performs the actual calculation and logic processing).",
    xpReward: 10
  },
  {
    id: "uneb-q6",
    topic: "Hardware & Troubleshooting",
    difficulty: "Easy",
    question: "Which port is most commonly used to connect a modern mouse, keyboard, or flash drive to a computer?",
    options: ["Parallel port", "Serial port", "USB port", "VGA port"],
    correctAnswerIndex: 2,
    explanation: "Universal Serial Bus (USB) is the current industry standard for hot-swappable peripheral connectivity.",
    xpReward: 10
  },
  {
    id: "uneb-q7",
    topic: "Hardware & Troubleshooting",
    difficulty: "Medium",
    question: "What is the main disadvantage of using an optical mouse over a mechanical tracker mouse?",
    options: ["It has moving rubber balls that wear out fast", "It cannot function well on reflective or glass surfaces", "It requires special driver software", "It consumes too much electricity"],
    correctAnswerIndex: 1,
    explanation: "Optical mice use light sensors and cameras to track movement, which can misread or scatter on highly reflective glass or glossy surfaces.",
    xpReward: 10
  },
  {
    id: "uneb-q8",
    topic: "Hardware & Troubleshooting",
    difficulty: "Medium",
    question: "A user switches on a computer; the power light turns on and fans spin, but the monitor screen remains completely black. What is the first troubleshooting step?",
    options: ["Reinstall the Operating System", "Check if the video signal cable (VGA/HDMI) is securely plugged in", "Replace the hard drive", "Format the C drive"],
    correctAnswerIndex: 1,
    explanation: "Always check physical connectivity rules first. A loose display cable stops the video signal from reaching the screen even if the machine has booted.",
    xpReward: 10
  },
  {
    id: "uneb-q9",
    topic: "System & Application Software",
    difficulty: "Easy",
    question: "Which of the following is an example of open-source system software?",
    options: ["Microsoft Windows 11", "Linux (Ubuntu)", "Adobe Photoshop", "Microsoft Office 365"],
    correctAnswerIndex: 1,
    explanation: "Open-source software provides its source code freely to the public, allowing users to modify, share, and distribute it without licensing fees.",
    xpReward: 10
  },
  {
    id: "uneb-q10",
    topic: "System & Application Software",
    difficulty: "Medium",
    question: "What type of utility software reorganizes fragmented files on a hard drive to improve access speed?",
    options: ["Disk Defragmenter", "Antivirus Toolkit", "WinRAR Compression", "Backup utility"],
    correctAnswerIndex: 0,
    explanation: "Defragmentation gathers scattered pieces of files on a spinning hard drive and places them into contiguous blocks, reducing read-head movement.",
    xpReward: 10
  },
  {
    id: "uneb-q11",
    topic: "System & Application Software",
    difficulty: "Easy",
    question: "Which application program is best suited for managing a school budget and generating charts?",
    options: ["Word Processor", "Spreadsheet application", "Desktop Publisher", "Presentation tool"],
    correctAnswerIndex: 1,
    explanation: "Spreadsheet tools (like MS Excel) are purposely engineered for mathematical calculations, formulas, and visual data representation.",
    xpReward: 10
  },
  {
    id: "uneb-q12",
    topic: "System & Application Software",
    difficulty: "Easy",
    question: "In a word processor, what feature automatically moves a word to the next line if it exceeds the right margin?",
    options: ["AutoCorrect", "Word Wrap", "Mail Merge", "Page Break"],
    correctAnswerIndex: 1,
    explanation: "Word wrap keeps text flow smooth and uninterrupted without forcing the typist to hit the Enter key at the end of every physical line.",
    xpReward: 10
  },
  {
    id: "uneb-q13",
    topic: "Data Communication & Networks",
    difficulty: "Medium",
    question: "Which network topology connects all client devices to a single central device like a switch or hub?",
    options: ["Bus topology", "Ring topology", "Star topology", "Mesh topology"],
    correctAnswerIndex: 2,
    explanation: "Star networks are popular because if one cable breaks, only that specific computer loses connection, leaving the rest of the network functional.",
    xpReward: 10
  },
  {
    id: "uneb-q14",
    topic: "Data Communication & Networks",
    difficulty: "Medium",
    question: "What device is required to connect a local school computer network to the wider Internet?",
    options: ["Router", "Network Interface Card (NIC)", "Unshielded Twisted Pair (UTP) cable", "Hub"],
    correctAnswerIndex: 0,
    explanation: "A router routes data packets across different networks, bridging your private local area network (LAN) with public external networks.",
    xpReward: 10
  },
  {
    id: "uneb-q15",
    topic: "Data Communication & Networks",
    difficulty: "Hard",
    question: "What does the term 'Bandwidth' refer to in data communication?",
    options: ["The physical length of a network cable", "The data transmission capacity of a communication channel", "The cost of buying internet bundles", "The security password strength"],
    correctAnswerIndex: 1,
    explanation: "Bandwidth measures how much data can move from one point to another along a channel within a set timeframe (usually measured in Mbps).",
    xpReward: 10
  },
  {
    id: "uneb-q16",
    topic: "Web, Security & Social Impact",
    difficulty: "Easy",
    question: "What does the prefix 'https://' indicate in a website's URL bar?",
    options: ["The website is hosted in Uganda", "The data transmitted between your browser and the server is encrypted and secure", "The site contains free downloadable software", "The page is old and out of date"],
    correctAnswerIndex: 1,
    explanation: "The 'S' stands for Secure (Hypertext Protocol Secure), meaning data like passwords or pins are encrypted in transit.",
    xpReward: 10
  },
  {
    id: "uneb-q17",
    topic: "Web, Security & Social Impact",
    difficulty: "Medium",
    question: "A student receives an email that looks exactly like a bank notification, asking them to click a link and verify their password. What type of cyber attack is this?",
    options: ["Computer Virus", "Phishing", "Hacking", "Denial of Service (DoS)"],
    correctAnswerIndex: 1,
    explanation: "Phishing uses deceptive social-engineering messages designed to trick individuals into giving away sensitive credentials.",
    xpReward: 10
  },
  {
    id: "uneb-q18",
    topic: "Web, Security & Social Impact",
    difficulty: "Hard",
    question: "Which network security barrier monitors and filters incoming and outgoing traffic based on pre-defined security rules?",
    options: ["Firewall", "Anti-spyware", "Defragmenter", "Encryption key"],
    correctAnswerIndex: 0,
    explanation: "Firewalls act as an electronic security gate between a trusted internal network and untrusted external traffic.",
    xpReward: 10
  },
  {
    id: "uneb-q19",
    topic: "Web, Security & Social Impact",
    difficulty: "Easy",
    question: "What is the best environmental practice for disposing of old CRT monitors and dead computer batteries?",
    options: ["Burning them in the school incinerator", "Handing them to certified e-waste recycling centers", "Burying them in a pit behind the computer lab", "Mixing them with regular paper waste"],
    correctAnswerIndex: 1,
    explanation: "Electronics contain toxic heavy metals like lead and mercury. Burning or burying them causes chemical leakage into air and groundwater.",
    xpReward: 10
  },
  {
    id: "uneb-q20",
    topic: "Web, Security & Social Impact",
    difficulty: "Medium",
    question: "Which of the following is a direct health hazard caused by prolonged use of computers with poor sitting posture?",
    options: ["Computer Vision Syndrome", "Repetitive Strain Injury (RSI)", "Computer virus infection", "Data degradation"],
    correctAnswerIndex: 1,
    explanation: "Poor ergonomics, awkward typing angles, and slouching lead to musculoskeletal stress, resulting in chronic issues like RSI or back pain.",
    xpReward: 10
  }
];

interface QuestsProps {
  userProfile: StudentProfile;
  onGrantXp: (amount: number, reason: string) => void;
  onUnlockBadge: (badge: string) => void;
}

export default function QuestsTrivia({ userProfile, onGrantXp, onUnlockBadge }: QuestsProps) {
  const [quests, setQuests] = useState<Quest[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOptIndex, setSelectedOptIndex] = useState<number | null>(null);
  const [hasChecked, setHasChecked] = useState(false);
  const [score, setScore] = useState(0);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    async function loadQuests() {
      try {
        if (isSupabaseConfigured) {
          // Fetch strictly from live Supabase quests table
          const { data, error } = await supabase
            .from("quests")
            .select("*")
            .order("id", { ascending: true });

          if (!error && data && data.length > 0) {
            setQuests(
              data.map((q: any) => ({
                id: q.id,
                topic: q.topic,
                difficulty: q.difficulty || "Medium",
                question: q.question,
                options: q.options || [],
                correctAnswerIndex: q.correct_answer_index,
                explanation: q.explanation || "No explanation provided.",
                xpReward: q.xp_reward || 10,
              }))
            );
          } else {
            // Seed the Supabase database with these 20 practice questions if it's currently empty
            for (const q of O_A_LEVEL_QUESTIONS) {
              await supabase.from("quests").insert([{
                id: q.id,
                topic: q.topic,
                difficulty: q.difficulty,
                question: q.question,
                options: q.options,
                correct_answer_index: q.correctAnswerIndex,
                explanation: q.explanation,
                xp_reward: q.xpReward
              }]);
            }
            // Pull again after planting
            const { data: reData } = await supabase
              .from("quests")
              .select("*")
              .order("id", { ascending: true });
            
            if (reData && reData.length > 0) {
              setQuests(
                reData.map((q: any) => ({
                  id: q.id,
                  topic: q.topic,
                  difficulty: q.difficulty || "Medium",
                  question: q.question,
                  options: q.options || [],
                  correctAnswerIndex: q.correct_answer_index,
                  explanation: q.explanation || "No explanation provided.",
                  xpReward: q.xp_reward || 10,
                }))
              );
            } else {
              setQuests(O_A_LEVEL_QUESTIONS);
            }
          }
        } else {
          // Local storage state mode fallback if Supabase not configured
          const cached = localStorage.getItem("stahizza_local_quests");
          if (cached) {
            setQuests(JSON.parse(cached));
          } else {
            setQuests(O_A_LEVEL_QUESTIONS);
            localStorage.setItem("stahizza_local_quests", JSON.stringify(O_A_LEVEL_QUESTIONS));
          }
        }
      } catch (err) {
        console.error("Failed to fetch quests from Supabase:", err);
        setQuests(O_A_LEVEL_QUESTIONS);
      } finally {
        setLoading(false);
      }
    }
    loadQuests();
  }, []);

  const activeQuest = quests[currentIdx];

  const handleSelectOption = (optIdx: number) => {
    if (hasChecked) return;
    setSelectedOptIndex(optIdx);
  };

  const verifyChoice = () => {
    if (selectedOptIndex === null || hasChecked || !activeQuest) return;
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

    if (currentIdx + 1 < quests.length) {
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

  if (loading) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center flex flex-col items-center justify-center gap-2">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
        <p className="text-sm font-mono text-slate-400">Loading syllabus quests from database...</p>
      </div>
    );
  }

  if (quests.length === 0) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center flex flex-col items-center justify-center gap-3">
        <HelpCircle className="w-8 h-8 text-indigo-400 animate-pulse" />
        <div>
          <p className="text-sm font-sans text-slate-200 font-medium">No trivia quests available in the database yet.</p>
          <p className="text-xs font-mono text-slate-500 mt-1">Populate the 'quests' table in Supabase to sync them here.</p>
        </div>
      </div>
    );
  }

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
              <span className="text-xs font-mono text-slate-400">Question {currentIdx + 1} of {quests.length}</span>
              <div className="w-32 bg-slate-950 h-1.5 rounded-full mt-1.5 overflow-hidden">
                <div 
                  className="bg-indigo-600 h-full rounded-full transition-all duration-300"
                  style={{ width: `${((currentIdx + 1) / quests.length) * 100}%` }}
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
                  <span>{currentIdx + 1 === quests.length ? "Finish Quests" : "Next Quest"}</span>
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
              <p className="text-2xl font-bold text-slate-200 mt-1">{score} / {quests.length}</p>
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
