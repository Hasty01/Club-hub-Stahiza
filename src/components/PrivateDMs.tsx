import { useEffect, useState, useRef } from "react";
import { supabase } from "../lib/supabaseClient";
import { 
  User, 
  Send, 
  Lock, 
  Search, 
  Image, 
  Smile, 
  Check, 
  CheckCheck, 
  Sparkles, 
  ArrowLeft, 
  Paperclip,
  X,
  Compass,
  Zap,
  BookOpen
} from "lucide-react";

interface Profile {
  id: string;
  name: string;
  username: string;
  avatarUrl: string;
  classLevel: string;
  role: string;
  email: string;
}

interface DmMessage {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  file_url?: string;
  file_type?: string;
  seen_by: string[];
  created_at: string;
}

interface OnlineUser {
  id: string;
  username: string;
  last_seen: string;
}

export default function PrivateDMs({ userProfile }: { userProfile: any }) {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRecipient, setSelectedRecipient] = useState<Profile | null>(null);
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [messages, setMessages] = useState<DmMessage[]>([]);
  const [text, setText] = useState("");
  
  // Custom File Attachments attachment state
  const [attachmentUrl, setAttachmentUrl] = useState("");
  const [attachmentType, setAttachmentType] = useState<"image" | "file">("image");
  const [showAttachPopover, setShowAttachPopover] = useState(false);
  const [attachedCount, setAttachedCount] = useState(0);

  // Keyboard Emoji input picker
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  // States
  const [authUserId, setAuthUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [reactions, setReactions] = useState<any[]>([]);
  const [activePickerMessageId, setActivePickerMessageId] = useState<string | null>(null);
  const [recipientTyping, setRecipientTyping] = useState(false);
  const typingTimeoutRef = useRef<any>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const subscriptionRef = useRef<any>(null);

  const getMyUserId = () => {
    return userProfile?.id || authUserId;
  };

  const getMyUserName = () => {
    return userProfile?.name || userProfile?.username || "Companion";
  };

  // 1. Initial Load & Auth Sync
  useEffect(() => {
    // Sync current authenticated user
    supabase.auth.getUser().then(({ data }) => {
      if (data?.user) {
        setAuthUserId(data.user.id);
      }
    });

    fetchProfiles();
    fetchOnlineUsers();

    // Periodically update online indicators
    const presenceTimer = setInterval(fetchOnlineUsers, 10000);

    // Subscribe to online user shifts in real-time
    const presenceChannel = supabase
      .channel("p2p-online-presence-sync")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "online_users" },
        () => {
          fetchOnlineUsers();
        }
      )
      .subscribe();

    return () => {
      clearInterval(presenceTimer);
      supabase.removeChannel(presenceChannel);
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  // 2. Auto-scroll chat on incoming messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // 3. Keep real-time subscription alive for standard DMs, reactions, and typing indicator status
  useEffect(() => {
    if (!activeConvId) {
      setMessages([]);
      setReactions([]);
      setRecipientTyping(false);
      return;
    }

    fetchDmMessages(activeConvId);

    // Unsubscribe from prior active conversation channel
    if (subscriptionRef.current) {
      supabase.removeChannel(subscriptionRef.current);
    }

    // Subscribe to immediate incoming direct messages specific to this DM Tunnel
    const channelName = `dm-msg-${activeConvId}`;
    const channel = supabase
      .channel(channelName)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "dm_messages",
          filter: `conversation_id=eq.${activeConvId}`,
        },
        () => {
          fetchDmMessages(activeConvId);
        }
      )
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
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "typing_status",
        },
        () => {
          checkRecipientTyping();
        }
      )
      .subscribe();

    subscriptionRef.current = channel;

    // Periodically sync recipient typing status
    const pollInterval = setInterval(() => {
      checkRecipientTyping();
    }, 4000);

    return () => {
      if (subscriptionRef.current) {
        supabase.removeChannel(subscriptionRef.current);
      }
      clearInterval(pollInterval);
    };
  }, [activeConvId, selectedRecipient]);

  // Fetch registered club members
  async function fetchProfiles() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("full_name", { ascending: true });

      if (error) throw error;

      if (data) {
        const mapped: Profile[] = data.map((p: any) => ({
          id: p.id,
          name: p.full_name || p.username || "Unknown Scholar",
          username: p.username || "",
          avatarUrl: p.avatar_url || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80",
          classLevel: p.class_level || "Member",
          role: p.role || "member",
          email: p.email || "",
        }));
        setProfiles(mapped);
      }
    } catch (e) {
      console.error("Failed to fetch registered peer profiles from Supabase.", e);
      setProfiles([]);
    } finally {
      setLoading(false);
    }
  }

  // Fetch online snapshots
  async function fetchOnlineUsers() {
    try {
      const { data } = await supabase
        .from("online_users")
        .select("id, username, last_seen");
      if (data) {
        setOnlineUsers(data);
      }
    } catch (e) {
      console.warn("Could not retrieve presence updates:", e);
    }
  }

  // Fetch messages inside a conversation securely
  async function fetchDmMessages(convId: string) {
    try {
      setLoadingMessages(true);
      const { data, error } = await supabase
        .from("dm_messages")
        .select("*")
        .eq("conversation_id", convId)
        .order("created_at", { ascending: true });

      if (error) throw error;

      if (data) {
        setMessages(data);
        markDmMessagesAsSeen(convId, data);
      }
    } catch (e) {
      console.error("Unable to fetch DM messages from Supabase", e);
    } finally {
      setLoadingMessages(false);
    }
  }

  // Mark all unread messages as seen
  async function markDmMessagesAsSeen(convId: string, loadedMsgs: DmMessage[]) {
    try {
      const myId = getMyUserId();
      if (!myId) return;

      const unread = loadedMsgs.filter(
        (m) => m.sender_id !== myId && (!m.seen_by || !Array.isArray(m.seen_by) || !m.seen_by.includes(myId))
      );

      if (unread.length === 0) return;

      for (const m of unread) {
        const nextSeen = Array.isArray(m.seen_by) ? [...m.seen_by, myId] : [myId];
        await supabase
          .from("dm_messages")
          .update({ seen_by: nextSeen })
          .eq("id", m.id);
      }
    } catch (e) {
      console.warn("Seen sync issue:", e);
    }
  }

  // Fetch reactions associated with loaded messages
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

  // Sync reactions whenever messages change
  useEffect(() => {
    fetchReactions();
  }, [messages]);

  // Toggle emoji reaction state
  async function toggleReaction(messageId: string, emoji: string) {
    try {
      const myId = getMyUserId();
      if (!myId) return;

      const existing = reactions.find(
        (r) =>
          r.message_id === messageId &&
          (r.user_id === myId || r.id === myId) &&
          r.emoji === emoji
      );

      if (existing) {
        // Remove reaction
        const { error: delErr } = await supabase
          .from("message_reactions")
          .delete()
          .eq("id", existing.id);

        if (delErr) {
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
          user_id: myId,
          emoji,
        };
        await supabase.from("message_reactions").insert([payload]);
      }

      fetchReactions();
    } catch (e) {
      console.warn("Reaction toggle error:", e);
    }
  }

  // Check if currently selected peer is typing
  async function checkRecipientTyping() {
    if (!selectedRecipient) {
      setRecipientTyping(false);
      return;
    }
    try {
      const tenSecondsAgo = new Date(Date.now() - 10 * 1000).toISOString();
      const { data } = await supabase
        .from("typing_status")
        .select("*")
        .or(`id.eq.${selectedRecipient.id},user_id.eq.${selectedRecipient.id}`)
        .eq("is_typing", true)
        .gte("updated_at", tenSecondsAgo);

      setRecipientTyping(data && data.length > 0);
    } catch (e) {
      console.warn("Failed to retrieve recipient typing status:", e);
    }
  }

  // Broadcast current user's typing indicator status
  async function updateMyTypingStatus(isTyping: boolean) {
    try {
      const activeUserId = getMyUserId();
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(activeUserId || "");
      if (!isUuid || !activeUserId) return;

      const payload = {
        username: getMyUserName(),
        is_typing: isTyping,
        updated_at: new Date().toISOString(),
      };

      const { error: errA } = await supabase
        .from("typing_status")
        .upsert([{ ...payload, id: activeUserId }]);

      if (errA) {
        await supabase
          .from("typing_status")
          .upsert([{ ...payload, user_id: activeUserId }]);
      }
    } catch (e) {
      console.warn("Failed to update typing status:", e);
    }
  }

  // Handler for text input change that triggers typing status
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

  // Set up conversation with selected recipient (using sorting client-side robust fallback)
  async function handleSelectRecipient(recipient: Profile) {
    const myId = getMyUserId();
    if (!myId) {
      alert("Please authenticate or log in to launch a direct message conversation.");
      return;
    }

    if (myId === recipient.id) {
      alert("This is a direct-message tunnel. Please select another classmate scholar.");
      return;
    }

    setSelectedRecipient(recipient);
    setActiveConvId(null);
    setMessages([]);

    try {
      // Step A: Attempt RPC function
      const { data: convIdResponse, error: rpcError } = await supabase.rpc(
        "create_conversation",
        { p_user1: myId, p_user2: recipient.id }
      );

      if (!rpcError && convIdResponse) {
        setActiveConvId(convIdResponse);
        return;
      }

      // Step B: Bulletproof fallback using client-side order matching
      const u1 = myId < recipient.id ? myId : recipient.id;
      const u2 = myId < recipient.id ? recipient.id : myId;

      const { data: existing, error: selectErr } = await supabase
        .from("conversations")
        .select("id")
        .eq("user1_id", u1)
        .eq("user2_id", u2)
        .maybeSingle();

      if (existing?.id) {
        setActiveConvId(existing.id);
      } else {
        // Build new conversation
        const { data: inserted, error: insertErr } = await supabase
          .from("conversations")
          .insert([{ user1_id: u1, user2_id: u2 }])
          .select("id")
          .maybeSingle();

        if (inserted?.id) {
          setActiveConvId(inserted.id);
        } else {
          console.error("Table 'conversations' might not be created or accessible yet on database.");
        }
      }
    } catch (err) {
      console.error("Critical error setting up conversation channel", err);
    }
  }

  // Send Direct Message
  async function handleSendDm() {
    if (!text.trim() && !attachmentUrl.trim()) return;
    if (!activeConvId) return;

    const myId = getMyUserId();
    if (!myId) return;

    // Clear typing status instantly
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    updateMyTypingStatus(false);

    const msgContent = text;
    const currentAttachmentUrl = attachmentUrl;
    const currentAttachmentType = attachmentType;

    // Reset input states
    setText("");
    setAttachmentUrl("");
    setShowAttachPopover(false);
    setAttachedCount(0);

    const payload: any = {
      conversation_id: activeConvId,
      sender_id: myId,
      content: msgContent,
      seen_by: [myId],
    };

    if (currentAttachmentUrl.trim()) {
      payload.file_url = currentAttachmentUrl;
      payload.file_type = currentAttachmentType;
    }

    try {
      const { error } = await supabase.from("dm_messages").insert([payload]);
      
      if (error) {
        console.error("Failed to post message", error);
      } else {
        fetchDmMessages(activeConvId);
      }
    } catch (e) {
      console.warn("Failed sending message payload:", e);
    }
  }

  // Check if a specific profile is online
  const isProfileOnline = (profileId: string) => {
    const matched = onlineUsers.find((ou) => ou.id === profileId);
    if (!matched) return false;
    
    // Check if seen in the last 60 seconds
    const lastSeenTime = new Date(matched.last_seen).getTime();
    return Date.now() - lastSeenTime < 60 * 1000;
  };

  const myId = getMyUserId();
  const currentRecipientOnline = selectedRecipient ? isProfileOnline(selectedRecipient.id) : false;

  // Filter scholars array based on user queries
  const filteredProfiles = profiles.filter((p) => {
    if (p.id === myId) return false; // Exclude myself
    const searchString = `${p.name} ${p.username} ${p.classLevel}`.toLowerCase();
    return searchString.includes(searchQuery.toLowerCase());
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 h-[550px] bg-slate-900/10 border border-slate-800/80 rounded-2xl overflow-hidden font-sans text-xs">
      {/* 1. Classmate Contacts Column Selector */}
      <div className={`md:col-span-4 border-r border-slate-800/80 bg-slate-950/40 flex flex-col h-full ${
        selectedRecipient ? "hidden md:flex" : "flex"
      }`}>
        {/* Search header panel */}
        <div className="p-3 border-b border-slate-800/80 bg-slate-950/20">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-slate-500" />
            <input
              type="text"
              placeholder="Search club mates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-2 bg-slate-900/90 border border-slate-800/80 hover:border-slate-700/80 focus:border-pink-500/50 rounded-lg text-slate-100 placeholder:text-slate-505 outline-none transition-all font-sans text-xs"
            />
          </div>
        </div>

        {/* Scholar list Container */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1 scrollbar-thin scrollbar-thumb-slate-800">
          <div className="px-2 py-1 text-[9px] font-mono tracking-wider uppercase text-slate-500 font-bold mb-1">
            Certified Classmates ({filteredProfiles.length})
          </div>

          {filteredProfiles.length === 0 ? (
            <div className="p-8 text-center text-slate-500">
              <Compass className="w-5 h-5 mx-auto text-slate-600 mb-1 animate-pulse" />
              <p className="text-[10px] font-mono">No other club scholars matched.</p>
            </div>
          ) : (
            filteredProfiles.map((partner) => {
              const online = isProfileOnline(partner.id);
              const isSelected = selectedRecipient?.id === partner.id;

              return (
                <button
                  key={partner.id}
                  onClick={() => handleSelectRecipient(partner)}
                  className={`w-full text-left p-2.5 rounded-xl transition-all duration-150 flex items-center justify-between group ${
                    isSelected 
                      ? "bg-slate-800/90 border border-pink-500/20 shadow-md shadow-pink-950/10" 
                      : "hover:bg-slate-900 border border-transparent"
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    {/* User Avatar framework with glowing status */}
                    <div className="relative shrink-0">
                      <img
                        src={partner.avatarUrl}
                        alt={partner.name}
                        referrerPolicy="no-referrer"
                        className="w-8 h-8 rounded-full border border-slate-700/50 object-cover"
                      />
                      <span className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-slate-950 ${
                        online ? "bg-emerald-400 animate-pulse" : "bg-slate-500"
                      }`} />
                    </div>

                    <div className="min-w-0">
                      <h5 className="font-bold text-slate-200 truncate group-hover:text-pink-400 transition-colors text-xs font-sans">
                        {partner.name}
                      </h5>
                      <span className="text-[10px] font-mono text-slate-400">
                        {partner.classLevel}
                      </span>
                    </div>
                  </div>

                  <span className="shrink-0 text-[10px] text-slate-500 font-mono pr-1 font-semibold group-hover:translate-x-0.5 transition-transform">
                    {partner.role === "president" ? "👑 Admin" : partner.role === "cabinet" ? "⚡ Cabin" : "👤 Peer"}
                  </span>
                </button>
              );
            })
          )}
        </div>
        
        {/* Helper bottom card */}
        <div className="p-3 bg-slate-950/60 border-t border-slate-800/80 shrink-0 text-[10px] font-mono text-slate-400 flex items-center gap-1.5">
          <BookOpen className="w-3.5 h-3.5 text-pink-500" />
          <span>Encrypted Scholar-to-Scholar DMs</span>
        </div>
      </div>

      {/* 2. Chat Feed Panel column wrapper */}
      <div className={`md:col-span-8 flex flex-col h-full bg-slate-950/45 ${
        !selectedRecipient ? "hidden md:flex items-center justify-center p-8 bg-slate-950/30" : "flex"
      }`}>
        {selectedRecipient ? (
          <>
            {/* active peer metadata bar header */}
            <div className="p-3 bg-slate-950/60 border-b border-slate-800/80 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5 min-w-0">
                {/* Back button on mobile */}
                <button
                  type="button"
                  onClick={() => setSelectedRecipient(null)}
                  className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-pink-400 hover:bg-slate-900 shrink-0"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>

                <div className="relative">
                  <img
                    src={selectedRecipient.avatarUrl}
                    alt={selectedRecipient.name}
                    referrerPolicy="no-referrer"
                    className="w-8 h-8 rounded-full border border-slate-800 object-cover"
                  />
                  <span className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-slate-950 ${
                    currentRecipientOnline ? "bg-emerald-400 animate-pulse" : "bg-slate-500"
                  }`} />
                </div>

                <div className="min-w-0">
                  <h4 className="font-bold text-slate-100 font-sans tracking-tight leading-4 text-xs">
                    {selectedRecipient.name}
                  </h4>
                  <div className="flex items-center gap-1.5 text-[9px] font-mono text-slate-400 leading-3 mt-0.5">
                    <span>{selectedRecipient.classLevel}</span>
                    <span>•</span>
                    <span className={currentRecipientOnline ? "text-emerald-400" : "text-slate-500"}>
                      {currentRecipientOnline ? "Online Now_ " : "Offline"}
                    </span>
                  </div>
                </div>
              </div>

              <span className="px-2 py-0.5 text-[8px] font-mono bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-lg uppercase tracking-wider font-extrabold flex items-center gap-1">
                <Lock className="w-2.5 h-2.5 shrink-0" />
                Direct Link
              </span>
            </div>

            {/* main Message logs container frame */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-slate-800">
              {loadingMessages ? (
                <div className="h-full flex flex-col items-center justify-center text-center">
                  <p className="text-[10px] font-mono text-slate-500 animate-pulse">Syncing direct message vault logs...</p>
                </div>
              ) : messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-4">
                  <Sparkles className="w-6 h-6 text-pink-500/20 mb-2 animate-bounce" />
                  <p className="text-[11px] font-mono text-slate-400">
                    No logs inside this secure private tunnel yet.
                  </p>
                  <p className="text-[9px] text-slate-500 mt-1 max-w-[240px]">
                    Send a companion scholar checking request. Your message will be instantly routed.
                  </p>
                </div>
              ) : (
                messages.map((m, index) => {
                  const isUserM = m.sender_id === myId;
                  const msgReactions = reactions.filter((r) => r.message_id === m.id);
                  
                  return (
                    <div
                      key={m.id || index}
                      className={`flex flex-col max-w-[80%] group ${
                        isUserM ? "ml-auto items-end" : "mr-auto items-start"
                      }`}
                    >
                      {/* Message Bubble frame */}
                      <div className="relative">
                        <div
                          className={`p-3 rounded-2xl text-[11px] leading-relaxed select-text ${
                            isUserM
                              ? "bg-gradient-to-tr from-pink-500 to-indigo-600 text-slate-100 rounded-tr-none shadow-md shadow-pink-900/10"
                              : "bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-none"
                          }`}
                        >
                          {m.content}
 
                          {/* Render File/Image Attachment block */}
                          {m.file_url && (
                            <div className="mt-2.5 p-1.5 bg-slate-950/40 rounded-xl border border-slate-800/80 overflow-hidden">
                              {m.file_type === "image" || m.file_url.match(/\.(jpg|jpeg|png|gif|webp)/i) ? (
                                <img
                                  src={m.file_url}
                                  alt="DM attachment preview"
                                  className="rounded-lg max-h-48 object-cover max-w-full hover:scale-[1.02] transition-transform duration-150"
                                  onError={(e) => {
                                    (e.target as any).src = "https://placehold.co/300x200/slate/white?text=Attachment+Preview";
                                  }}
                                />
                              ) : (
                                <a
                                  href={m.file_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-1.5 p-1 hover:text-pink-400 font-mono text-[9px]"
                                >
                                  <Paperclip className="w-3.5 h-3.5 shrink-0 text-pink-500" />
                                  <span className="truncate max-w-[120px]">{m.file_url.split("/").pop()}</span>
                                  <span className="text-[8px] opacity-70">(Open File)</span>
                                </a>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Desktop Hover Quick Reactions Box */}
                        {m.id && (
                          <div
                            className={`absolute z-10 top-0 mt-1 select-none flex items-center gap-1 p-1 bg-slate-900 border border-slate-800 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-150 ${
                              isUserM ? "right-full mr-2" : "left-full ml-2"
                            }`}
                          >
                            {["👍", "🔥", "❤️", "🙌", "😮"].map((emoji) => (
                              <button
                                key={emoji}
                                type="button"
                                onClick={() => toggleReaction(m.id, emoji)}
                                className="text-xs w-5 h-5 flex items-center justify-center hover:scale-125 transition-transform"
                                title={emoji}
                              >
                                {emoji}
                              </button>
                            ))}
                            <button
                              type="button"
                              onClick={() => setActivePickerMessageId(activePickerMessageId === m.id ? null : m.id)}
                              className="text-slate-400 hover:text-pink-400 w-5 h-5 flex items-center justify-center hover:scale-125 transition-transform border-l border-slate-800 pl-1 ml-0.5"
                              title="More reactions..."
                            >
                              <Smile className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}

                        {/* Live Emoji Picker Popover */}
                        {activePickerMessageId === m.id && (
                          <div className={`absolute z-30 bottom-full mb-2 ${isUserM ? "right-0" : "left-0"} bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-3 w-56 animate-in fade-in slide-in-from-bottom-2 duration-150`}>
                            <div className="flex items-center justify-between mb-2 pb-1.5 border-b border-slate-800/80">
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">React with Emoji</span>
                              <button
                                onClick={() => setActivePickerMessageId(null)}
                                type="button"
                                className="text-[10px] text-slate-500 hover:text-slate-350 px-1"
                              >
                                ✕
                              </button>
                            </div>
                            <div className="grid grid-cols-6 gap-1.5 max-h-40 overflow-y-auto pr-0.5">
                              {[
                                "👍", "👎", "❤️", "🔥", "😂", "😮", 
                                "😢", "😡", "🙌", "👏", "🎉", "🚀", 
                                "👀", "💯", "🤔", "😭", "🥰", "💀", 
                                "✨", "👑", "🌟", "💡", "💖", "🎯"
                              ].map((emoji) => (
                                <button
                                  key={emoji}
                                  type="button"
                                  onClick={() => {
                                    toggleReaction(m.id, emoji);
                                    setActivePickerMessageId(null);
                                  }}
                                  className="text-base w-7 h-7 flex items-center justify-center hover:bg-slate-800 hover:scale-115 rounded-lg transition-all duration-100"
                                >
                                  {emoji}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
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
                              (r) => r.emoji === emoji && (r.user_id === myId || r.id === myId)
                            );
                            return (
                              <button
                                key={emoji}
                                type="button"
                                onClick={() => toggleReaction(m.id, emoji)}
                                className={`flex items-center gap-1.5 text-[9px] px-2 py-0.5 rounded-full border transition-all ${
                                  hasReacted
                                    ? "bg-pink-500/15 border-pink-505 text-pink-400 font-bold"
                                    : "bg-slate-900/90 border-slate-850 hover:border-slate-700 text-slate-400"
                                }`}
                              >
                                <span>{emoji}</span>
                                <span>{count}</span>
                              </button>
                            );
                          })}
                          <button
                            type="button"
                            onClick={() => setActivePickerMessageId(activePickerMessageId === m.id ? null : m.id)}
                            className="flex items-center justify-center w-5 h-5 rounded-full border border-dashed border-slate-700 hover:border-pink-500 text-slate-500 hover:text-pink-400 text-[10px] transition-colors bg-slate-950/40"
                            title="Add reaction"
                          >
                            +
                          </button>
                        </div>
                      )}

                      {/* Seen / timestamp status layout */}
                      <div className="flex items-center gap-1 mt-1 text-[8px] text-slate-500 font-mono select-none">
                        <button
                          type="button"
                          onClick={() => setActivePickerMessageId(activePickerMessageId === m.id ? null : m.id)}
                          className="p-0.5 text-slate-500 hover:text-pink-400 transition-colors flex items-center"
                          title="Add reaction"
                        >
                          <Smile className="w-2.5 h-2.5" />
                        </button>
                        <span>•</span>
                        <span>{new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        <span>•</span>
                        {isUserM ? (
                          <div className="flex items-center gap-0.5">
                            {m.seen_by && Array.isArray(m.seen_by) && m.seen_by.some((id) => id !== myId) ? (
                              <>
                                <CheckCheck className="w-2.5 h-2.5 text-pink-400 shrink-0" strokeWidth={3} />
                                <span className="text-pink-400">Seen_</span>
                              </>
                            ) : (
                              <>
                                <Check className="w-2.5 h-2.5 text-slate-600 shrink-0" />
                                <span>Sent</span>
                              </>
                            )}
                          </div>
                        ) : (
                          <span>Received</span>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Recipient Typing indicator status bar */}
            {recipientTyping && selectedRecipient && (
              <div className="px-4 py-1.5 text-[10px] text-pink-400 font-mono flex items-center gap-1.5 bg-slate-900/30 border-t border-slate-800/50">
                <div className="flex gap-1 shrink-0">
                  <span className="w-1.5 h-1.5 bg-pink-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
                  <span className="w-1.5 h-1.5 bg-pink-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
                  <span className="w-1.5 h-1.5 bg-pink-500 rounded-full animate-bounce" />
                </div>
                <span>{selectedRecipient.name} is typing...</span>
              </div>
            )}

            {/* Typing popup bar */}
            {showEmojiPicker && (
              <div className="mx-3 my-1 p-2 bg-slate-900 border border-slate-800 rounded-xl flex gap-1 items-center justify-between shrink-0">
                <div className="flex gap-1 overflow-x-auto">
                  {["👍", "🔥", "❤️", "😂", "🙌", "🎉", "😮", "🎯", "🤔"].map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => {
                        handleTextChange(text + emoji);
                        setShowEmojiPicker(false);
                      }}
                      className="text-sm p-1 hover:bg-slate-800 hover:scale-125 rounded transition-transform"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
                <button onClick={() => setShowEmojiPicker(false)} className="text-slate-500 hover:text-slate-350 p-1">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Custom URL Upload Overlay container */}
            {showAttachPopover && (
              <div className="mx-3 my-1 p-2.5 bg-slate-900 border border-slate-800 rounded-xl space-y-2 shrink-0 animate-in fade-in duration-100">
                <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
                  <span className="text-[9px] font-mono text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1">
                    <Paperclip className="w-3 h-3 text-pink-400" />
                    Attach File or Image Link
                  </span>
                  <button onClick={() => setShowAttachPopover(false)} className="text-slate-500 hover:text-slate-300">
                    <X className="w-3 h-3" />
                  </button>
                </div>
                <div className="flex gap-2">
                  <input
                     type="url"
                    placeholder="Paste direct URL (e.g. https://image.png)..."
                    value={attachmentUrl}
                    onChange={(e) => {
                      setAttachmentUrl(e.target.value);
                      setAttachedCount(e.target.value ? 1 : 0);
                    }}
                    className="flex-1 bg-slate-950/80 border border-slate-800 focus:border-pink-500/50 rounded-lg text-slate-100 px-3 py-1.5 text-[10px] outline-none"
                  />
                  <select
                    value={attachmentType}
                    onChange={(e: any) => setAttachmentType(e.target.value)}
                    className="bg-slate-950 border border-slate-800 text-slate-200 rounded-lg px-2 text-[10px] outline-none"
                  >
                    <option value="image">🖼️ Image</option>
                    <option value="file">📄 File</option>
                  </select>
                </div>
                {attachmentUrl && (
                  <p className="text-[9px] text-emerald-400 font-mono">
                    ✓ Link attached! Click 'Send' to submit with your message text.
                  </p>
                )}
              </div>
            )}

            {/* message writing layout tray input */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendDm();
              }}
              className="p-3 border-t border-slate-800/80 bg-slate-950/60 flex gap-2 shrink-0"
            >
              {/* Extra Attachment Toggle button */}
              <button
                type="button"
                onClick={() => setShowAttachPopover(!showAttachPopover)}
                className={`flex items-center justify-center p-2.5 border rounded-xl transition-all shrink-0 ${
                  showAttachPopover || attachedCount > 0
                    ? "bg-pink-500/15 border-pink-500/30 text-pink-400 scale-[1.02]"
                    : "bg-slate-900 border-slate-800 hover:border-slate-700 text-slate-400"
                }`}
                title="Attach Web Link or Image"
              >
                <Paperclip className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className={`flex items-center justify-center p-2.5 border rounded-xl transition-all shrink-0 ${
                  showEmojiPicker
                    ? "bg-pink-500/15 border-pink-500/30 text-pink-400"
                    : "bg-slate-900 border-slate-800 hover:border-slate-700 text-slate-400"
                }`}
                title="Add Emoji"
              >
                <Smile className="w-3.5 h-3.5" />
              </button>

              <input
                value={text}
                onChange={(e) => handleTextChange(e.target.value)}
                placeholder="Type private message..."
                className="flex-1 bg-slate-900/90 border border-slate-800 hover:border-slate-700 focus:focus:border-pink-500/50 focus:ring-1 focus:ring-pink-500/50 rounded-xl text-slate-100 text-xs px-3.5 py-2 placeholder:text-slate-505 outline-none transition-all font-sans"
              />

              <button
                type="submit"
                disabled={!text.trim() && !attachmentUrl.trim()}
                className="bg-gradient-to-r from-pink-500 to-indigo-600 hover:from-pink-400 hover:to-indigo-500 hover:scale-[1.02] text-white px-4 rounded-xl flex items-center justify-center transition-all shadow-md shadow-pink-905/20 disabled:opacity-50 disabled:pointer-events-none shrink-0"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center p-8">
            <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center mb-3">
              <Lock className="w-6 h-6 text-pink-500/50" />
            </div>
            <h5 className="font-bold text-slate-200 uppercase tracking-wider text-xs font-sans">
              Peer-to-Peer Scholar Tunnel
            </h5>
            <p className="text-[11px] font-mono text-slate-450 leading-relaxed mt-1 max-w-[280px]">
              Select a certified ICT club scholar from the directory sidebar to initiate an absolute direct message tunnel.
            </p>
            <div className="mt-4 flex flex-wrap items-center justify-center gap-1.5 text-[9px] font-mono text-slate-500">
              <span className="px-1.5 py-0.5 rounded bg-slate-900/60 border border-slate-850">● Real-time sync</span>
              <span>•</span>
              <span className="px-1.5 py-0.5 rounded bg-slate-900/60 border border-slate-850">✓ Seen Receipts</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
