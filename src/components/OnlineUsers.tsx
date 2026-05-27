import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { Users2, Radio } from "lucide-react";

export default function OnlineUsers() {
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    fetchUsers();

    const channel = supabase
      .channel("online-users")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "online_users",
        },
        () => {
          fetchUsers();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  async function fetchUsers() {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();

    const { data } = await supabase
      .from("online_users")
      .select("*")
      .gte("last_seen", fiveMinutesAgo)
      .order("last_seen", {
        ascending: false,
      });

    setUsers(data || []);
  }

  return (
    <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-4 font-sans">
      <div className="flex items-center justify-between mb-4 border-b border-slate-800/50 pb-3">
        <div className="flex items-center gap-2">
          <Users2 className="w-4 h-4 text-emerald-400" />
          <h3 className="text-xs font-bold font-sans text-slate-200 uppercase tracking-wider">
            Online Now
          </h3>
        </div>
        <span className="flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          <Radio className="w-3 h-3 text-emerald-400 animate-pulse" />
          {users.length} Active
        </span>
      </div>

      {users.length === 0 ? (
        <p className="text-[10px] text-slate-500 font-mono text-center py-2">
          No peer scholars online recently.
        </p>
      ) : (
        <div className="space-y-3 max-h-[240px] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-800">
          {users.map((user) => {
            const role = user.role || "member";
            let roleBadge = null;

            if (role === "president") {
              roleBadge = (
                <span className="text-[8px] font-mono bg-amber-500/10 text-amber-400 border border-amber-500/30 px-1.5 py-0.1 rounded lowercase">
                  president
                </span>
              );
            } else if (role === "cabinet") {
              roleBadge = (
                <span className="text-[8px] font-mono bg-purple-500/10 text-purple-400 border border-purple-500/30 px-1.5 py-0.1 rounded lowercase">
                  cabinet
                </span>
              );
            } else {
              roleBadge = (
                <span className="text-[8px] font-mono bg-slate-500/15 text-slate-400 px-1.5 py-0.1 rounded lowercase">
                  member
                </span>
              );
            }

            return (
              <div
                key={user.id}
                className="flex items-center gap-3 p-1.5 hover:bg-slate-950/25 rounded-xl transition-all"
              >
                <div className="relative shrink-0">
                  <img
                    src={user.avatar_url || "https://placehold.co/100"}
                    className="w-8 h-8 rounded-full object-cover border border-slate-700"
                    referrerPolicy="no-referrer"
                    alt={user.username}
                  />
                  <div className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-slate-900" />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-semibold text-slate-100 truncate">
                      {user.username || "Companion"}
                    </span>
                    {roleBadge}
                  </div>
                  <p className="text-[9px] text-slate-500 font-mono">
                    active terminal
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
