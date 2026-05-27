import { useEffect, useState, useRef } from "react";
import { supabase } from "../lib/supabaseClient";
import { MessageSquare, Send, Sparkles, Check, CheckCheck, Smile, Bell } from "lucide-react";

export default function LiveChat({ userProfile }: any) {
  const [messages, setMessages] = useState<any[]>([]);
  const [text, setText] = useState("");
  const [authUserId, setAuthUserId] = useState<string | null>(null);
  const [typingUsers, setTypingUsers] = useState<any[]>([]);
  const [reactions, setReactions] = useState<any[]>([]);
  const [toast, setToast] = useState<{ title: string; content: string } | null>(null);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<any>(null);

  // Read current logged in user ID to align local state
  const getCurrentUserId = () => {
    return userProfile?.id || authUserId;
  };

  useEffect(() => {
    fetchMessages();

    // Fetch the real underlying Supabase auth user if available
    supabase.auth.getUser().then(({ data }) => {
      if (data?.user) {
        setAuthUserId(data.user.id);
      }
    });

    // Subscribe to live chat messages
    const chatChannel = supabase
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

    // Subscribe to live typing statuses
    const typingChannel = supabase
      .channel("typing-status-channel")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "typing_status",
        },
        () => {
          fetchTypingUsers();
        }
      )
      .subscribe();

    // Subscribe to live reaction changes
    const reactionChannel = supabase
      .channel("reactions-channel")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "message_reactions",
        },
        () => {
          fetchReactions();
        }
      )
      .subscribe();

    // Subscribe to real-time notification triggers
    const notificationChannel = supabase
      .channel("notifications-channel")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
        },
        (payload) => {
          const newNotif = payload.new;
          const currentUserId = getCurrentUserId();
          
          // Show announcement if user_id is null, or specifically targeting the active user
          if (newNotif && (!newNotif.user_id || newNotif.user_id === currentUserId)) {
            setToast({
              title: newNotif.title || "New Club Notice",
              content: newNotif.content || "An update occurred in standard high club."
            });

            // Automatically dismiss toast after 5 seconds
            setTimeout(() => {
              setToast(null);
            }, 5000);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(chatChannel);
      supabase.removeChannel(typingChannel);
      supabase.removeChannel(reactionChannel);
      supabase.removeChannel(notificationChannel);
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  // Sync reactions whenever messages are fetched/updated
  useEffect(() => {
    fetchReactions();
  }, [messages]);

  // Handle auto-scroll to bottom of message container
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

    const loadedMessages = data || [];
    setMessages(loadedMessages);

    // Run parallel task to mark newly fetched unseen messages as seen
    markMessagesAsSeen(loadedMessages);
  }

  async function fetchReactions() {
    try {
      const messageIds = messages.map((m) => m.id).filter(Boolean);
      if (messageIds.length === 0) return;

      const { data } = await supabase
        .from("message_reactions")
        .select("*")
        .in("message_id", messageIds);

      setReactions(data || []);
    } catch (e) {
      console.warn("Failed to fetch message reactions:", e);
    }
  }

  async function fetchTypingUsers() {
    try {
      const tenSecondsAgo = new Date(Date.now() - 10 * 1000).toISOString();
      const { data } = await supabase
        .from("typing_status")
        .select("*")
        .eq("is_typing", true)
        .gte("updated_at", tenSecondsAgo);

      const currentUserId = getCurrentUserId();
      
      const filtered = (data || []).filter((tu: any) => {
        const itemUserId = tu.user_id || tu.id;
        return itemUserId && itemUserId !== currentUserId;
      });

      setTypingUsers(filtered);
    } catch (e) {
      console.warn("Failed to fetch typing users:", e);
    }
  }

  async function markMessagesAsSeen(loadedMessages: any[]) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const currentUserId = userProfile?.id || authUserId || user?.id;
      if (!currentUserId || loadedMessages.length === 0) return;

      const unseen = loadedMessages.filter(
        (m) => m.id && m.sender_id !== currentUserId && (!m.seen_by || !Array.isArray(m.seen_by) || !m.seen_by.includes(currentUserId))
      );

      if (unseen.length === 0) return;

      for (const m of unseen) {
        const currentSeenBy = Array.isArray(m.seen_by) ? m.seen_by : [];
        if (!currentSeenBy.includes(currentUserId)) {
          const nextSeenBy = [...currentSeenBy, currentUserId];
          await supabase
            .from("club_messages")
            .update({ seen_by: nextSeenBy })
            .eq("id", m.id);
        }
      }
    } catch (e) {
      console.warn("Failed to mark messages as seen:", e);
    }
  }

  async function updateMyTypingStatus(isTyping: boolean) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const activeUserId = userProfile?.id || authUserId || user?.id;
      
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(activeUserId || "");
      if (!isUuid || !activeUserId) return;

      const payload = {
        username: userProfile?.name || userProfile?.username || "Companion",
        is_typing: isTyping,
        updated_at: new Date().toISOString(),
      };

      // Try schema version A: with 'id'
      const { error: errA } = await supabase
        .from("typing_status")
        .upsert([{ ...payload, id: activeUserId }]);

      if (errA) {
        // Fallback schema version B: with 'user_id'
        await supabase
          .from("typing_status")
          .upsert([{ ...payload, user_id: activeUserId }]);
      }
    } catch (e) {
      console.warn("Failed to update typing status:", e);
    }
  }

  const handleTextChange = (val: string) => {
    setText(val);
    
    // Broadcast active typing status immediately
    updateMyTypingStatus(true);

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      updateMyTypingStatus(false);
    }, 2500);
  };

  async function sendMessage() {
    if (!text.trim()) return;

    // Clear typing indicator status immediately on submit
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    updateMyTypingStatus(false);

    // Fetch the real underlying Supabase auth user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const payload: any = {
      content: text,
      message: text, // Safe helper fallback for any transitional schema version
      sender_id: user.id,
      username: userProfile?.username || userProfile?.name || user.email || "Companion",
      avatar_url: userProfile?.avatarUrl || userProfile?.avatar_url || "",
      role: userProfile?.role || "member",
      seen_by: [user.id]
    };

    const { error } = await supabase.from("club_messages").insert([payload]);
    if (error) {
      console.log(error);
    }

    setText("");
  }

  async function toggleReaction(messageId: string, emoji: string) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const currentUserId = userProfile?.id || authUserId || user?.id;
      if (!currentUserId) return;

      const existing = reactions.find(
        (r) =>
          r.message_id === messageId &&
          (r.user_id === currentUserId || r.id === currentUserId) &&
          r.emoji === emoji
      );

      if (existing) {
        // Remove reaction
        const { error: delErr } = await supabase
          .from("message_reactions")
          .delete()
          .eq("id", existing.id);

        if (delErr) {
          // Alternative fallback wipe strategy
          await supabase
            .from("message_reactions")
            .delete()
            .eq("message_id", messageId)
            .eq("emoji", emoji);
        }
      } else {
        // Add reaction
        const payload = {
          message_id: messageId,
          user_id: currentUserId,
          emoji,
        };
        await supabase.from("message_reactions").insert([payload]);
      }

      fetchReactions();
    } catch (e) {
      console.warn("Reaction toggle error:", e);
    }
  }

  const currentUserId = getCurrentUserId();

  return (
    <div className="flex flex-col h-[550px] bg-slate-900/40 border border-slate-800/80 rounded-2xl overflow-hidden font-sans relative">
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
        className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-950/25 scrollbar-thin scrollbar-thumb-slate-800"
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
            const isUserM = msg.username === userProfile?.name || msg.username === userProfile?.username;
            const messageBody = msg.message || msg.content || "";
            const msgReactions = reactions.filter((r) => r.message_id === msg.id);

            return (
              <div
                key={msg.id || index}
                className={`flex flex-col max-w-[85%] group ${
                  isUserM ? "ml-auto items-end" : "mr-auto items-start"
                }`}
              >
                {/* Username Header Container */}
                <div className="flex items-center gap-1 text-[9px] font-mono text-slate-500 mb-0.5 uppercase tracking-wider">
                  <span>{msg.username || "Peer Scholar"}</span>
                </div>

                {/* Bubble Frame with relative layouts */}
                <div className="relative">
                  <div
                    className={`p-3 rounded-2xl text-xs leading-relaxed select-text ${
                      isUserM
                        ? "bg-gradient-to-r from-pink-500 to-indigo-600 text-slate-100 rounded-tr-none shadow-md shadow-pink-900/10"
                        : "bg-slate-900/90 border border-slate-800 text-slate-200 rounded-tl-none"
                    }`}
                  >
                    {messageBody}
                  </div>

                  {/* Desktop Hover Quick Reactions Box */}
                  <div
                    className={`absolute z-10 top-0 mt-1 select-none flex items-center gap-1 p-1 bg-slate-900 border border-slate-800 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-150 ${
                      isUserM ? "right-full mr-2" : "left-full ml-2"
                    }`}
                  >
                    {["👍", "🔥", "❤️", "🙌", "😮"].map((emoji) => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => toggleReaction(msg.id, emoji)}
                        className="text-xs w-5 h-5 flex items-center justify-center hover:scale-125 transition-transform"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Display reactions tray under bubble */}
                {msgReactions.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {Object.entries(
                      msgReactions.reduce((acc: any, r: any) => {
                        acc[r.emoji] = (acc[r.emoji] || 0) + 1;
                        return acc;
                      }, {})
                    ).map(([emoji, count]: any) => {
                      const hasReacted = msgReactions.some(
                        (r) => r.emoji === emoji && (r.user_id === currentUserId || r.id === currentUserId)
                      );
                      return (
                        <button
                          key={emoji}
                          type="button"
                          onClick={() => toggleReaction(msg.id, emoji)}
                          className={`flex items-center gap-1.5 text-[9px] px-2 py-0.5 rounded-full border transition-all ${
                            hasReacted
                              ? "bg-pink-500/15 border-pink-500/30 text-pink-400 font-bold"
                              : "bg-slate-900/90 border-slate-850 hover:border-slate-700 text-slate-400"
                          }`}
                        >
                          <span>{emoji}</span>
                          <span>{count}</span>
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Seen status tracker */}
                {isUserM && msg.id && (
                  <div className="flex items-center gap-1 text-[8px] text-slate-500 font-mono mt-0.5 select-none">
                    {msg.seen_by && Array.isArray(msg.seen_by) && msg.seen_by.some((id: string) => id !== currentUserId) ? (
                      <>
                        <CheckCheck className="w-2.5 h-2.5 text-pink-400 shrink-0" strokeWidth={3} />
                        <span>Seen</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-2.5 h-2.5 text-slate-600 shrink-0" />
                        <span>Sent</span>
                      </>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Typing status bar above the writing panel */}
      {typingUsers.length > 0 && (
        <div className="px-4 py-1.5 text-[10px] text-pink-400 font-mono flex items-center gap-1.5 bg-slate-950/40 border-t border-slate-800/50">
          <div className="flex gap-1">
            <span className="w-1.5 h-1.5 bg-pink-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
            <span className="w-1.5 h-1.5 bg-pink-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
            <span className="w-1.5 h-1.5 bg-pink-500 rounded-full animate-bounce" />
          </div>
          <span>
            {typingUsers.map((tu) => tu.username).join(", ")}{" "}
            {typingUsers.length === 1 ? "is" : "are"} typing...
          </span>
        </div>
      )}

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
          onChange={(e) => handleTextChange(e.target.value)}
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

      {/* Floating Real-time In-app Notification Alert Toast */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-[999] p-4 bg-slate-900/95 backdrop-blur-md border border-slate-800 hover:border-pink-500/30 rounded-2xl shadow-xl flex items-start gap-3 w-80 transition-all duration-300 transform translate-y-0 scale-100 animate-fadeIn">
          <div className="w-8 h-8 rounded-full bg-pink-500/10 border border-pink-500/20 flex items-center justify-center shrink-0">
            <Bell className="w-4 h-4 text-pink-400" />
          </div>
          <div className="min-w-0 flex-1">
            <h5 className="text-[11px] font-bold text-slate-100 truncate flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-pink-500 inline-block animate-ping" />
              {toast.title}
            </h5>
            <p className="text-[10px] text-slate-400 leading-relaxed mt-0.5">{toast.content}</p>
          </div>
          <button
            type="button"
            onClick={() => setToast(null)}
            className="text-[10px] text-slate-500 hover:text-slate-300 font-mono shrink-0 select-none pb-1"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}
