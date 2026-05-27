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

      const basePayload = {
        username: userProfile?.name || userProfile?.username || "Companion",
        avatar_url: userProfile?.avatarUrl || userProfile?.avatar_url || "https://placehold.co/100",
        role: userProfile?.role || "member",
        last_seen: new Date().toISOString(),
      };

      // Try schema variant A: setting 'id' to the activeUserId 
      const { error: errorA } = await supabase
        .from("online_users")
        .upsert([{ ...basePayload, id: activeUserId }]);

      if (errorA) {
        // If variant A fails (e.g., column user_id is the foreign key), try schema variant B with 'user_id'
        const { error: errorB } = await supabase
          .from("online_users")
          .upsert([{ ...basePayload, user_id: activeUserId }]);

        if (errorB) {
          // If both fail, let's try upserting with both properties, letting postgrest/supabase handle it
          await supabase
            .from("online_users")
            .upsert([{ ...basePayload, id: activeUserId, user_id: activeUserId }]);
        }
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
