-- ==========================================
-- STAHIZZA ICT CLUB ECOSYSTEM
-- Master Suppabase Schema & Migration File
-- ==========================================
-- Single source of truth for the club portal database.
-- Paste these instructions in your Supabase SQL Editor.

-- 1. PROFILES Table (User metadata synced with Supabase Auth)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    class_level TEXT NOT NULL,
    xp INTEGER NOT NULL DEFAULT 120,
    level INTEGER NOT NULL DEFAULT 1,
    avatar_url TEXT NOT NULL DEFAULT 'Sandra',
    role TEXT DEFAULT 'member',
    email TEXT,
    username TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Turn on Row Level Security (RLS) for profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles Security Policies
CREATE POLICY "Public profiles are viewable by everyone." 
    ON public.profiles FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile." 
    ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile." 
    ON public.profiles FOR UPDATE USING (auth.uid() = id);


-- 2. CLUB FEED Table (Notice board updates & announcements)
CREATE TABLE IF NOT EXISTS public.club_feed (
    id TEXT PRIMARY KEY,
    author TEXT NOT NULL,
    role TEXT NOT NULL,
    content TEXT NOT NULL,
    likes INTEGER NOT NULL DEFAULT 0,
    timestamp TEXT NOT NULL,
    is_pinned BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.club_feed ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Club feed is viewable by everyone" 
    ON public.club_feed FOR SELECT USING (true);

CREATE POLICY "Club members can add to the feed" 
    ON public.club_feed FOR INSERT WITH CHECK (true);

CREATE POLICY "Club members can likes announcements" 
    ON public.club_feed FOR UPDATE USING (true);


-- 3. KANBAN TASKS Table (Agile student tasks & sandboxes)
CREATE TABLE IF NOT EXISTS public.kanban_tasks (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'to-do',
    xp_points INTEGER NOT NULL DEFAULT 20,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.kanban_tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Kanban tasks are viewable by anyone" 
    ON public.kanban_tasks FOR SELECT USING (true);

CREATE POLICY "Anyone can create or modify Kanban tasks" 
    ON public.kanban_tasks FOR ALL USING (true);


-- 4. SUGGESTIONS Table (Ecosystem feature & feedback requests)
CREATE TABLE IF NOT EXISTS public.suggestions (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    author TEXT NOT NULL,
    category TEXT NOT NULL,
    votes INTEGER NOT NULL DEFAULT 0,
    date TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'Under Discussion',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.suggestions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Suggestions are viewable by everyone" 
    ON public.suggestions FOR SELECT USING (true);

CREATE POLICY "Anyone can write suggestions or vote" 
    ON public.suggestions FOR ALL USING (true);


-- 5. ATTENDANCE LOGS Table (Club presence logging)
CREATE TABLE IF NOT EXISTS public.attendance_logs (
    id BIGSERIAL PRIMARY KEY,
    student_name TEXT NOT NULL,
    date TEXT NOT NULL,
    topic TEXT NOT NULL,
    mentor TEXT NOT NULL,
    status TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.attendance_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Attendance is viewable by everyone" 
    ON public.attendance_logs FOR SELECT USING (true);

CREATE POLICY "Anyone can log attendance record" 
    ON public.attendance_logs FOR INSERT WITH CHECK (true);


-- 6. PROJECTS Table (Phase 4: Dev Showcase Projects)
CREATE TABLE IF NOT EXISTS public.projects (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    developer TEXT NOT NULL,
    class_level TEXT NOT NULL,
    description TEXT NOT NULL,
    tags TEXT[] NOT NULL DEFAULT '{}',
    code_snippet TEXT,
    likes INTEGER NOT NULL DEFAULT 0,
    views INTEGER NOT NULL DEFAULT 0,
    category TEXT NOT NULL,
    thumbnail_url TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Projects are viewable by everyone" 
    ON public.projects FOR SELECT USING (true);

CREATE POLICY "Anyone can publish or update projects" 
    ON public.projects FOR ALL USING (true);


-- 7. MESSAGES Table (Phase 5: Real-time club chat logs)
CREATE TABLE IF NOT EXISTS public.messages (
    id BIGSERIAL PRIMARY KEY,
    role TEXT NOT NULL CHECK (role IN ('user', 'model')),
    content TEXT NOT NULL,
    timestamp TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Messages can be viewed by anyone" 
    ON public.messages FOR SELECT USING (true);

CREATE POLICY "Anyone can send a message" 
    ON public.messages FOR INSERT WITH CHECK (role IN ('user', 'model'));


-- 8. CLUB EVENTS Table (Schedules of activities & workshops)
CREATE TABLE IF NOT EXISTS public.club_events (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    date TEXT NOT NULL,
    time TEXT NOT NULL,
    location TEXT NOT NULL,
    description TEXT NOT NULL,
    type TEXT NOT NULL,
    host TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.club_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Events are viewable by everyone" 
    ON public.club_events FOR SELECT USING (true);

CREATE POLICY "Anyone can publish or update events" 
    ON public.club_events FOR ALL USING (true);


-- 9. QUESTS Table (Syllabus Quests / Trivia)
CREATE TABLE IF NOT EXISTS public.quests (
    id TEXT PRIMARY KEY,
    topic TEXT NOT NULL,
    difficulty TEXT NOT NULL,
    question TEXT NOT NULL,
    options TEXT[] NOT NULL DEFAULT '{}',
    correct_answer_index INTEGER NOT NULL,
    explanation TEXT NOT NULL,
    xp_reward INTEGER NOT NULL DEFAULT 30,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.quests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Quests are viewable by everyone" 
    ON public.quests FOR SELECT USING (true);

CREATE POLICY "Anyone can edit quests" 
    ON public.quests FOR ALL USING (true);


-- 10. CODE CHALLENGES Table (Online Code Sandbox Challenges)
CREATE TABLE IF NOT EXISTS public.code_challenges (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    difficulty TEXT NOT NULL,
    initial_code TEXT NOT NULL,
    solution_regex TEXT NOT NULL,
    test_instructions TEXT NOT NULL,
    category TEXT NOT NULL,
    xp_reward INTEGER NOT NULL DEFAULT 40,
    hint TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.code_challenges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Challenges are viewable by everyone" 
    ON public.code_challenges FOR SELECT USING (true);

CREATE POLICY "Anyone can edit challenges" 
    ON public.code_challenges FOR ALL USING (true);


-- ==========================================
-- BONUS SCHEMA EVOLUTION / MIGRATION CLINIC
-- ==========================================
-- If tables already exist in your database, run these lines individually 
-- in the Supabase SQL editor to bring them perfectly in sync without data loss:

-- SEED DATA FOR HONORARY STAHIZZA ICT CLUB ELITE MEMBERS
-- Copy and run these inside your Supabase SQL Editor to instantly populate community leaderboard profiles!
-- Note: Inserts matching auth.users with random uuids first to support foreign key constraints.

INSERT INTO auth.users (id, email, raw_user_meta_data) VALUES
('b19d2cc8-bfcd-44b4-a8fe-359f13d80632', 'jerome@stahizza.edu', '{"full_name": "Jerome K. Maku"}'),
('c53531b2-ba0a-42cd-9bc9-a8f8d689afc7', 'arthur@stahizza.edu', '{"full_name": "Kyobe Arthur"}'),
('d53531b2-ba0a-42cd-9bc9-a8f8d689afd8', 'maria@stahizza.edu', '{"full_name": "Nabulo Maria"}'),
('e53531b2-ba0a-42cd-9bc9-a8f8d689afe9', 'hakim@stahizza.edu', '{"full_name": "Hakim Kavuma"}'),
('f53531b2-ba0a-42cd-9bc9-a8f8d689aff0', 'sandra@stahizza.edu', '{"full_name": "Namazzi Sandra"}'),
('a19d2cc8-bfcd-44b4-a8fe-359f13d85631', 'joel@stahizza.edu', '{"full_name": "Atamba Joel"}')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.profiles (id, full_name, username, class_level, role, xp, level, avatar_url, email) VALUES
('b19d2cc8-bfcd-44b4-a8fe-359f13d80632', 'Jerome K. Maku', 'jerome', 'S5 Leader / President', 'president', 2450, 5, 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80', 'jerome@stahizza.edu'),
('c53531b2-ba0a-42cd-9bc9-a8f8d689afc7', 'Kyobe Arthur', 'arthur', 'S6 Rep / Systems VP', 'vp', 1980, 4, 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80', 'arthur@stahizza.edu'),
('d53531b2-ba0a-42cd-9bc9-a8f8d689afd8', 'Nabulo Maria', 'maria', 'S3 Rep / Design Scholar', 'designer', 1850, 4, 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80', 'maria@stahizza.edu'),
('e53531b2-ba0a-42cd-9bc9-a8f8d689afe9', 'Hakim Kavuma', 'hakim', 'S6 Student / Cadet', 'member', 1210, 3, 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80', 'hakim@stahizza.edu'),
('f53531b2-ba0a-42cd-9bc9-a8f8d689aff0', 'Namazzi Sandra', 'sandra', 'S2 Rep / Visual Creator', 'member', 950, 2, 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150&q=80', 'sandra@stahizza.edu'),
('a19d2cc8-bfcd-44b4-a8fe-359f13d85631', 'Atamba Joel', 'joel', 'Fullstack Leader / S6', 'mentor', 2840, 6, 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80', 'joel@stahizza.edu')
ON CONFLICT (id) DO NOTHING;

-- Run these if your PROFILES table has obsolete structures:
-- ALTER TABLE public.profiles RENAME COLUMN name TO full_name;
-- ALTER TABLE public.profiles RENAME COLUMN avatar_seed TO avatar_url;
-- ALTER TABLE public.profiles DROP COLUMN IF EXISTS unlocked_badges;
-- ALTER TABLE public.profiles DROP COLUMN IF EXISTS solved_challenge_ids;
-- ALTER TABLE public.profiles DROP COLUMN IF EXISTS rank;

-- Run these if your PROJECTS table has missing columns:
-- ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS developer TEXT DEFAULT 'Anonymous Builder';
-- ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS class_level TEXT DEFAULT 'Senior 5';
-- ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';
-- ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS code_snippet TEXT DEFAULT '';
-- ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS views INTEGER DEFAULT 0;
-- ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS thumbnail_url TEXT DEFAULT '';

-- Run these if your MESSAGES table is missing columns:
-- ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'user';
-- ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS timestamp TEXT NOT NULL DEFAULT '';
