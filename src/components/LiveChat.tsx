import { useEffect, useState, useRef } from "react";
import { supabase } from "../lib/supabaseClient";
import { MessageSquare, Send, Sparkles } from "lucide-react";

export default function LiveChat({ userProfile }: any) {
  const [messages, setMessages] = useState<any[]>([]);
  const [text, setText] = useState("");
  const [authUserId, setAuthUserId] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchMessages();

    // Fetch the real underlying Supabase auth user if available
    supabase.auth.getUser().then(({ data }) => {
      if (data?.user) {
        setAuthUserId(data.user.id);
      }
    });

    const channel = supabase
      .channel("live-chat")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "club_messages",
        },
        () => {
          fetchMessages();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [messages]);

  async function fetchMessages() {
    const { data } = await supabase
      .from("club_messages")
      .select("*")
      .order("created_at", {
        ascending: true,
      });

    // Handle both the structured realtime chat table or general chat fallback if structure varies
    setMessages(data || []);
  }

  async function sendMessage() {
    if (!text.trim()) return;

    // Fetch the real underlying Supabase auth user
    const { data: { user } } = await supabase.auth.getUser();
    
    // Direct active session matching, then mapped local profile parameter
    const rawProfileId = userProfile?.id || authUserId || user?.id;
    
    // Strict UUID validation checklist to prevent Postgres uuid format cast errors
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(rawProfileId || "");
    const resolvedProfileId = isUuid ? rawProfileId : null;

    const payload: any = {
      profile_id: resolvedProfileId,
      sender_id: user?.id || resolvedProfileId,
      username: userProfile?.name || userProfile?.username || "Companion",
      avatar_url: userProfile?.avatarUrl || userProfile?.avatar_url || "https://placehold.co/100",
      message: text,
      content: text,
    };

    // If there's an issue with the custom structure, we match standard fallback logic safely
    const { error } = await supabase.from("club_messages").insert([payload]);
    if (error) {
      console.error("Failed to insert live message:", error);
    }

    setText("");
  }

  return (
    <div className="flex flex-col h-[550px] bg-slate-900/40 border border-slate-800/80 rounded-2xl overflow-hidden font-sans">
      {/* Header */}
      <div className="p-4 bg-slate-950/60 border-b border-slate-800/80 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-pink-500" />
          <h4 className="text-xs font-bold font-sans text-slate-200 uppercase tracking-wider">
            ICT CLUB LIVE BULLETIN & CHAT
          </h4>
        </div>
        <span className="flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-mono font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping" />
          Realtime Live
        </span>
      </div>

      {/* Messages Feed */}
      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-950/25 scrollbar-thin scrollbar-thumb-slate-800"
      >
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-4">
            <Sparkles className="w-8 h-8 text-indigo-500/30 mb-2 animate-pulse" />
            <p className="text-[11px] font-mono text-slate-500">
              No live chat logs yet. Be the first to broadcast a peer check-in!
            </p>
          </div>
        ) : (
          messages.map((msg, index) => {
            // Support alternate tables structured role for AI vs Human or matching columns
            const isUserM = msg.username === userProfile?.name || msg.username === userProfile?.username;
            const messageBody = msg.message || msg.content || "";
            return (
              <div
                key={msg.id || index}
                className={`flex flex-col max-w-[85%] ${
                  isUserM ? "ml-auto items-end" : "mr-auto items-start"
                }`}
              >
                <span className="text-[9px] font-mono text-slate-500 mb-0.5 uppercase tracking-wider">
                  {msg.username || "Peer Scholar"}
                </span>
                <div
                  className={`p-3 rounded-2xl text-xs leading-relaxed select-text ${
                    isUserM
                      ? "bg-gradient-to-r from-pink-500 to-indigo-600 text-slate-100 rounded-tr-none shadow-md shadow-pink-900/10"
                      : "bg-slate-900/90 border border-slate-800 text-slate-200 rounded-tl-none"
                  }`}
                >
                  {messageBody}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Input Tray */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          sendMessage();
        }}
        className="p-3 border-t border-slate-800/80 bg-slate-950/60 flex gap-2"
      >
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type live message..."
          className="flex-1 bg-slate-900/90 border border-slate-800 hover:border-slate-700 focus:border-pink-500/50 focus:ring-1 focus:ring-pink-500/50 rounded-xl text-slate-100 text-xs px-4 py-2.5 placeholder:text-slate-500 outline-none transition-all font-sans"
        />
        <button
          type="submit"
          disabled={!text.trim()}
          className="bg-gradient-to-r from-pink-500 to-indigo-600 hover:from-pink-400 hover:to-indigo-500 hover:scale-[1.02] text-white px-4 rounded-xl flex items-center justify-center transition-all shadow-md shadow-pink-900/20 disabled:opacity-50 disabled:pointer-events-none"
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
}
