import React, { useState, useRef, useEffect } from "react";
import { Message, StudentProfile } from "../types";
import { Send, Sparkles, User, Terminal, HelpCircle, Loader2 } from "lucide-react";
import { isSupabaseConfigured, supabase } from "../lib/supabaseClient";
import { fetchMessagesFromSupabase, saveMessageToSupabase } from "../lib/supabaseSync";

interface TutorChatProps {
  userProfile: StudentProfile;
  onGrantXp: (amount: number, reason: string) => void;
}

const SUGGESTED_QUESTIONS = [
  { text: "Explain Databases & ERDs", prompt: "Explain Entity Relationship Diagrams (ERD) in a primary database framework for UNEB ICT. What are primary and foreign keys?" },
  { text: "How does binary conversion work?", prompt: "Explain how to convert the decimal number 25 into binary form. Show the step-by-step division-by-2 method." },
  { text: "HTML Table templates", prompt: "Provide an elegant commented design code snippet for a 3-column, 4-row HTML table showing top ICT Club Leaders with CSS styled padding." },
  { text: "What is the Control Unit's role?", prompt: "Explain the Fetch-Decode-Execute cycle in simple terms. What are the roles of the Control Unit (CU) and RAM?" }
];

export default function TutorChat({ userProfile, onGrantXp }: TutorChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "model",
      content: `Hello **${userProfile.name}**! 👋 Welcome to the STAHIZZA ICT Learning Nodule.\n\nI am your AI assistant, specializing in the UNEB Computer Studies / ICT curriculum and modern web development. Ask me anything about Excel formulas, HTML/CSS design, databases, system software, or logic puzzles!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorStatus, setErrorStatus] = useState<string | null>(null);
  
  const bottomRef = useRef<HTMLDivElement>(null);

  // Sync historical messages & hook Supabase Realtime (Phase 5)
  useEffect(() => {
    if (!isSupabaseConfigured) return;

    async function loadChatHistory() {
      const history = await fetchMessagesFromSupabase();
      if (history && history.length > 0) {
        setMessages(history);
      }
    }
    loadChatHistory();

    const channel = supabase
      .channel("messages_room")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
        },
        (payload) => {
          const newMsg = payload.new as any;
          setMessages((prev) => {
            // Check to prevent double-insert of our local optimistic message
            const exists = prev.some(
              (m) => m.content === newMsg.content && m.timestamp === newMsg.timestamp
            );
            if (exists) return prev;
            return [
              ...prev,
              {
                role: newMsg.role as "user" | "model",
                content: newMsg.content,
                timestamp: newMsg.timestamp,
              },
            ];
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleSendMessage = async (rawText: string) => {
    if (!rawText.trim() || isLoading) return;

    setErrorStatus(null);
    const userMessageText = rawText.trim();
    // Prefix with student's name for collaborative visibility
    const finalContent = `**[${userProfile.name}]**: ${userMessageText}`;
    const localTimestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setInputValue("");

    const newLocalMessage: Message = {
      role: "user",
      content: finalContent,
      timestamp: localTimestamp
    };

    const newMessages: Message[] = [
      ...messages,
      newLocalMessage
    ];

    // Optimistically update local view
    setMessages(newMessages);
    setIsLoading(true);

    if (isSupabaseConfigured) {
      await saveMessageToSupabase({
        role: "user",
        content: finalContent,
        timestamp: localTimestamp
      });
    }

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: newMessages.map(m => ({
            role: m.role,
            content: m.content
          }))
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to contact chat model.");
      }

      const data = await response.json();
      const modelTimestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      const modelMessage = {
        role: "model" as const,
        content: data.content,
        timestamp: modelTimestamp
      };

      setMessages(prev => [
        ...prev,
        modelMessage
      ]);

      if (isSupabaseConfigured) {
        await saveMessageToSupabase({
          role: "model",
          content: data.content,
          timestamp: modelTimestamp
        });
      }

      // Grant a small amount of XP for engaging the AI Tutor (limit reward frequency conceptually)
      if (Math.random() > 0.4) {
        onGrantXp(15, "Engaging with local STAHIZZA AI Learning Nodule!");
      }

    } catch (err: any) {
      console.error("AI Communication error:", err);
      setErrorStatus(err.message || "An unexpected network error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[650px] bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
      {/* Target Node Header */}
      <div className="flex items-center justify-between p-4 bg-slate-950 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600/30 border border-indigo-400/40 flex items-center justify-center animate-pulse">
            <Sparkles className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <h3 className="font-sans font-semibold text-slate-100 flex items-center gap-2">
              STAHIZZA AI Learning Nodule
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                ● Connected
              </span>
            </h3>
            <p className="text-[11px] font-mono text-slate-400">Model: Gemini 3.5 Flash Super-Link</p>
          </div>
        </div>
        <div className="text-[11px] font-mono text-slate-400 bg-slate-800/50 px-3 py-1.5 rounded-lg border border-slate-800">
          Curriculum: UNEB ICT O/A Level
        </div>
      </div>

      {/* Message Output Board */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-slate-950 to-slate-900 scrollbar-thin scrollbar-thumb-slate-800">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex gap-3 max-w-[85%] ${
              msg.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
            }`}
          >
            {/* Avatar block */}
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${
              msg.role === "user"
                ? "bg-indigo-600/20 border-indigo-500/30 text-indigo-400"
                : "bg-slate-800 border-slate-700 text-indigo-300"
            }`}>
              {msg.role === "user" ? <User className="w-4 h-4" /> : <Terminal className="w-4 h-4" />}
            </div>

            {/* Bubble contents */}
            <div className="flex flex-col space-y-1">
              <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap select-text ${
                msg.role === "user"
                  ? "bg-indigo-600 text-slate-100 rounded-tr-none shadow-md shadow-indigo-900/10"
                  : "bg-slate-800/95 text-slate-200 border border-slate-700/60 rounded-tl-none"
              }`}>
                {/* Custom renderer for very simple Markdown highlights */}
                {msg.content.split("\n").map((line, lineI) => {
                  // Transform simple HTML/CSS template code blocks highlight
                  if (line.trim().startsWith("```")) {
                    return null; // Skip code fence indicators visually
                  }
                  
                  // Format lines: checks for bold annotations
                  let renderedText: React.ReactNode = line;
                  if (line.includes("**")) {
                    const parts = line.split("**");
                    renderedText = parts.map((part, index) => 
                      index % 2 === 1 ? <strong key={index} className="text-indigo-300 font-semibold">{part}</strong> : part
                    );
                  }
                  
                  // Format bullet points beautifully
                  if (line.trim().startsWith("- ") || line.trim().startsWith("* ")) {
                    return (
                      <div key={lineI} className="pl-4 relative py-0.5">
                        <span className="absolute left-0 text-indigo-400">•</span>
                        {renderedText}
                      </div>
                    );
                  }

                  return <p key={lineI} className={line.trim() === "" ? "h-2" : ""}>{renderedText}</p>;
                })}
              </div>
              <span className={`text-[10px] text-slate-500 font-mono ${msg.role === "user" ? "text-right" : "text-left"}`}>
                {msg.timestamp}
              </span>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-3 mr-auto max-w-[80%] items-center">
            <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 text-indigo-300 flex items-center justify-center shrink-0">
              <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
            </div>
            <div className="px-4 py-3 rounded-2xl text-xs font-mono bg-slate-800/50 border border-slate-800 text-slate-400 uppercase tracking-wider animate-pulse">
              Compiling expert thoughts...
            </div>
          </div>
        )}

        {errorStatus && (
          <div className="mr-auto w-full max-w-xl p-4 rounded-xl bg-red-500/10 border border-red-500/35 text-red-200 text-xs font-sans flex items-start gap-2">
            <span className="bg-red-500/20 px-1.5 py-0.5 rounded font-mono text-[9px] uppercase tracking-wider h-fit mt-1 shrink-0">Err</span>
            <div>
              <p className="font-semibold text-red-300">Connection Failed</p>
              <p className="text-red-400/90 leading-relaxed">{errorStatus}</p>
              <p className="mt-1 text-slate-400">Tip: Check that you have saved a valid `GEMINI_API_KEY` in the Secrets panel.</p>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Suggested Hot Questions */}
      <div className="p-3 bg-slate-950 border-t border-slate-900">
        <div className="flex items-center gap-1.5 text-[11px] font-mono font-medium text-slate-400 mb-2">
          <HelpCircle className="w-3.5 h-3.5 text-indigo-400" />
          <span>Syllabus Hot Keys / Click to ask:</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {SUGGESTED_QUESTIONS.map((q, idx) => (
            <button
              key={idx}
              type="button"
              disabled={isLoading}
              onClick={() => handleSendMessage(q.prompt)}
              className="text-xs px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-indigo-300 hover:border-indigo-500/40 hover:bg-slate-800/80 transition-all text-left truncate max-w-full disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {q.text}
            </button>
          ))}
        </div>
      </div>

      {/* Input controls form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage(inputValue);
        }}
        className="p-3 bg-slate-950 border-t border-slate-800 flex gap-2"
      >
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Ask a question (e.g., 'What is standard RAM speed?', 'Show HTML list syntax')..."
          disabled={isLoading}
          className="flex-1 bg-slate-900/90 border border-slate-800 hover:border-slate-700 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl text-slate-100 text-xs px-4 py-3 placeholder:text-slate-500 transition-all font-sans outline-none disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={!inputValue.trim() || isLoading}
          className="px-4 py-3 bg-indigo-600 hover:bg-indigo-500 text-slate-100 rounded-xl flex items-center justify-center transition-all shadow-md shadow-indigo-900/20 disabled:opacity-50 disabled:bg-slate-800"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
