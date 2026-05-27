import { useEffect } from "react";
import { supabase } from "../lib/supabaseClient";

export function useOnlinePresence(userProfile: any) {
  useEffect(() => {
    if (!userProfile?.id) return;

    let interval: any;

    async function updatePresence() {
      await supabase
        .from("online_users")
        .upsert([
          {
            id: userProfile.id,
            username: userProfile.username || userProfile.name || "Companion",
            avatar_url: userProfile.avatarUrl || userProfile.avatar_url || "https://placehold.co/100",
            role: userProfile.role || "member",
            last_seen: new Date().toISOString(),
          },
        ]);
    }

    updatePresence();

    interval = setInterval(() => {
      updatePresence();
    }, 15000);

    return () => {
      clearInterval(interval);
    };
  }, [userProfile]);
}
