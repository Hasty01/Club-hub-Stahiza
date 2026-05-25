import { supabase, isSupabaseConfigured } from "./supabaseClient";
import { StudentProfile, Notice } from "../types";

// Standard types matching DB tables:
export interface DbProfile {
  id: string;
  name: string;
  class_level: string;
  xp: number;
  level: number;
  unlocked_badges: string[];
  solved_challenge_ids: string[];
  avatar_seed: string;
  rank: string;
  role?: string;
}

export interface DbNotice {
  id: string;
  author: string;
  role: string;
  content: string;
  likes: number;
  timestamp: string;
  is_pinned: boolean;
  created_at?: string;
}

export interface DbSuggestion {
  id: string;
  title: string;
  description: string;
  author: string;
  category: string;
  votes: number;
  date: string;
  status: string;
}

export interface DbKanbanTask {
  id: string;
  title: string;
  description: string;
  category: string;
  status: string;
  xp_points: number;
}

export interface DbAttendanceLog {
  id?: string;
  student_name: string;
  date: string;
  topic: string;
  mentor: string;
  status: string;
}

// Map database snake_case keys to local typescript camelCase schemas:
export function mapProfileFromDb(db: DbProfile): StudentProfile {
  return {
    name: db.name,
    classLevel: db.class_level,
    xp: db.xp,
    level: db.level,
    unlockedBadges: db.unlocked_badges || [],
    solvedChallengeIds: db.solved_challenge_ids || [],
    avatarSeed: db.avatar_seed,
    rank: db.rank,
    role: (db.role as "president" | "cabinet" | "member") || "member",
  };
}

export function mapProfileToDb(profile: StudentProfile, id: string = "primary_student"): DbProfile {
  return {
    id,
    name: profile.name,
    class_level: profile.classLevel,
    xp: profile.xp,
    level: profile.level,
    unlocked_badges: profile.unlockedBadges,
    solved_challenge_ids: profile.solvedChallengeIds,
    avatar_seed: profile.avatarSeed,
    rank: profile.rank,
    role: profile.role,
  };
}

// Profile CRUD operations safely:
export async function fetchProfileFromSupabase(id: string = "primary_student"): Promise<StudentProfile | null> {
  if (!isSupabaseConfigured) return null;
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error) {
      console.error("Supabase Profile Fetch Error:", error);
      return null;
    }
    return data ? mapProfileFromDb(data) : null;
  } catch (err) {
    console.error("Supabase Profile Fetch Exception:", err);
    return null;
  }
}

export async function saveProfileToSupabase(profile: StudentProfile, id: string = "primary_student"): Promise<boolean> {
  if (!isSupabaseConfigured) return false;
  try {
    const dbProfile = mapProfileToDb(profile, id);
    const { error } = await supabase
      .from("profiles")
      .upsert(dbProfile);

    if (error) {
      console.error("Supabase Profile Save Error:", error);
      return false;
    }
    return true;
  } catch (err) {
    console.error("Supabase Profile Save Exception:", err);
    return false;
  }
}

// Notice Board CRUD:
export async function fetchNoticesFromSupabase(): Promise<Notice[] | null> {
  if (!isSupabaseConfigured) return null;
  try {
    const { data, error } = await supabase
      .from("club_feed")
      .select("*")
      .order("is_pinned", { ascending: false });

    if (error) {
      console.error("Supabase Notices Fetch Error:", error);
      return null;
    }

    return data.map((n: DbNotice) => ({
      id: n.id,
      author: n.author,
      role: n.role,
      content: n.content,
      likes: n.likes,
      timestamp: n.timestamp,
      isPinned: n.is_pinned,
    }));
  } catch (err) {
    console.error("Supabase Notices Fetch Exception:", err);
    return null;
  }
}

export async function saveNoticeToSupabase(notice: Notice): Promise<boolean> {
  if (!isSupabaseConfigured) return false;
  try {
    const dbNotice: DbNotice = {
      id: notice.id,
      author: notice.author,
      role: notice.role,
      content: notice.content,
      likes: notice.likes,
      timestamp: notice.timestamp,
      is_pinned: !!notice.isPinned,
    };
    const { error } = await supabase
      .from("club_feed")
      .insert([dbNotice]);

    if (error) {
      console.error("Supabase Notice Insert Error:", error);
      return false;
    }
    return true;
  } catch (err) {
    console.error("Supabase Notice Insert Exception:", err);
    return false;
  }
}

export async function incrementNoticeLikesInSupabase(id: string): Promise<boolean> {
  if (!isSupabaseConfigured) return false;
  try {
    const { data, error: fetchErr } = await supabase
      .from("club_feed")
      .select("likes")
      .eq("id", id)
      .single();

    if (fetchErr) return false;

    const { error } = await supabase
      .from("club_feed")
      .update({ likes: (data?.likes || 0) + 1 })
      .eq("id", id);

    return !error;
  } catch (err) {
    return false;
  }
}

// Kanban Task CRUD:
export async function fetchKanbanTasksFromSupabase(): Promise<any[] | null> {
  if (!isSupabaseConfigured) return null;
  try {
    const { data, error } = await supabase
      .from("kanban_tasks")
      .select("*");

    if (error) {
      console.error("Supabase Tasks Fetch Error:", error);
      return null;
    }

    return data.map((t: DbKanbanTask) => ({
      id: t.id,
      title: t.title,
      description: t.description,
      category: t.category,
      status: t.status,
      xpPoints: t.xp_points,
    }));
  } catch (err) {
    console.error("Supabase Tasks Fetch Exception:", err);
    return null;
  }
}

export async function saveKanbanTaskToSupabase(task: any): Promise<boolean> {
  if (!isSupabaseConfigured) return false;
  try {
    const dbTask: DbKanbanTask = {
      id: task.id,
      title: task.title,
      description: task.description,
      category: task.category,
      status: task.status,
      xp_points: task.xpPoints,
    };
    const { error } = await supabase
      .from("kanban_tasks")
      .insert([dbTask]);

    return !error;
  } catch (err) {
    return false;
  }
}

export async function updateKanbanTaskStatusInSupabase(id: string, newStatus: string): Promise<boolean> {
  if (!isSupabaseConfigured) return false;
  try {
    const { error } = await supabase
      .from("kanban_tasks")
      .update({ status: newStatus })
      .eq("id", id);

    return !error;
  } catch (err) {
    return false;
  }
}

export async function deleteKanbanTaskFromSupabase(id: string): Promise<boolean> {
  if (!isSupabaseConfigured) return false;
  try {
    const { error } = await supabase
      .from("kanban_tasks")
      .delete()
      .eq("id", id);

    return !error;
  } catch (err) {
    return false;
  }
}

// Suggestions CRUD:
export async function fetchSuggestionsFromSupabase(): Promise<any[] | null> {
  if (!isSupabaseConfigured) return null;
  try {
    const { data, error } = await supabase
      .from("suggestions")
      .select("*")
      .order("votes", { ascending: false });

    if (error) {
      console.error("Supabase Suggestions Fetch Error:", error);
      return null;
    }

    return data.map((s: DbSuggestion) => ({
      id: s.id,
      title: s.title,
      description: s.description,
      author: s.author,
      category: s.category,
      votes: s.votes,
      date: s.date,
      status: s.status,
    }));
  } catch (err) {
    return null;
  }
}

export async function saveSuggestionToSupabase(suggestion: any): Promise<boolean> {
  if (!isSupabaseConfigured) return false;
  try {
    const dbSug: DbSuggestion = {
      id: suggestion.id,
      title: suggestion.title,
      description: suggestion.description,
      author: suggestion.author,
      category: suggestion.category,
      votes: suggestion.votes,
      date: suggestion.date,
      status: suggestion.status,
    };
    const { error } = await supabase
      .from("suggestions")
      .insert([dbSug]);

    return !error;
  } catch (err) {
    return false;
  }
}

export async function upvoteSuggestionInSupabase(id: string): Promise<boolean> {
  if (!isSupabaseConfigured) return false;
  try {
    const { data, error: fetchErr } = await supabase
      .from("suggestions")
      .select("votes")
      .eq("id", id)
      .single();

    if (fetchErr) return false;

    const { error } = await supabase
      .from("suggestions")
      .update({ votes: (data?.votes || 0) + 1 })
      .eq("id", id);

    return !error;
  } catch (err) {
    return false;
  }
}

// Attendance CRUD:
export async function fetchAttendanceFromSupabase(studentName: string): Promise<any[] | null> {
  if (!isSupabaseConfigured) return null;
  try {
    const { data, error } = await supabase
      .from("attendance_logs")
      .select("*")
      .eq("student_name", studentName)
      .order("date", { ascending: false });

    if (error) {
      console.error("Supabase Attendance Fetch Error:", error);
      return null;
    }

    return data.map((l: DbAttendanceLog) => ({
      date: l.date,
      topic: l.topic,
      mentor: l.mentor,
      status: l.status,
    }));
  } catch (err) {
    return null;
  }
}

export async function recordAttendanceInSupabase(log: DbAttendanceLog): Promise<boolean> {
  if (!isSupabaseConfigured) return false;
  try {
    const { error } = await supabase
      .from("attendance_logs")
      .insert([log]);

    return !error;
  } catch (err) {
    return false;
  }
}
