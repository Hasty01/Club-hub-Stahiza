import { useEffect } from "react";
import { supabase } from "../lib/supabaseClient";

export function useOnlinePresence(userProfile: any) {
  useEffect(() => {
    let interval: any;

    async function updatePresence() {
      // Find the user ID from userProfile or fall back to retrieving from session/auth
      let activeUserId = userProfile?.id;
      
      if (!activeUserId) {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          activeUserId = user.id;
        }
      }

      if (!activeUserId) return;

      // Ensure activeUserId is a clean, valid UUID to avoid Postgres format errors
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(activeUserId || "");
      if (!isUuid) return;

      const payload = {
        id: activeUserId,
        username: userProfile?.name || userProfile?.username || "Companion",
        avatar_url: userProfile?.avatarUrl || userProfile?.avatar_url || "https://placehold.co/100",
        role: userProfile?.role || "member",
        last_seen: new Date().toISOString(),
      };

      const { error } = await supabase
        .from("online_users")
        .upsert([payload]);

      if (error) {
        console.error("Failed to upsert online presence:", error);
      }
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
