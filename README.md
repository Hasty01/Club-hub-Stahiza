# 🚀 STAHIZZA ICT Club Hub

### *Empowering the Next Generation of Tech Leaders at Standard High High School Zzana*

---

## 📖 Overview

**STAHIZZA ICT Club Hub** is a next-generation digital ecosystem designed specifically for the ICT Club at **Standard High High School Zzana (STAHIZZA)**. It centralizes club administration, gamified tech education, and intelligent, AI-powered mentorship into a single, high-performance platform.

Built with **React, TypeScript, and Supabase**, the hub bridges the gap between theoretical ICT concepts and practical application, empowering students to master web development, programming, and database systems through structured paths, community collaboration, and interactive coding tools.

---

## ✨ Core Features

### 🤖 AI-Powered Mentorship (Hugging Face & Gemini)

The platform integrates advanced AI orchestration (primarily via Google Gemini) to provide 24/7 localized guidance:

* **AI Tutor:** A context-aware assistant that answers coding questions, helps debug SQL or HTML queries, and provides club information.
* **Smart Roadmaps:** Generates personalized learning paths (from foundational networking up to advanced programming) tailored for Ugandan tech students.
* **Milestone Quizzes:** Dynamically generates assessment quizzes to test knowledge after completing roadmap milestones.
* **Instant Code Feedback:** AI analyzes student script or query submissions to provide constructive code reviews and 5-star performance ratings.

### 💻 Advanced Code Sandbox

A robust development environment running entirely in the browser, optimized for practical learning without environment barriers:

* **Zero Setup:** Run HTML, CSS, and JS code instantly on any school computer without installing local tools.
* **AI Hints:** Get smart suggestions for logic or syntax errors. The AI can analyze and guide fixes directly.
* **Cloud Persistence:** Save, update, and manage student states securely.

### 📅 Club Management & Collaboration

* **Kanban Projects:** Manage club innovations, setup trackers, and event planning with a Trello-style board, task assignments, and progress tracking.
* **Real-time News Feed:** Communicate across the club, featuring full support for announcements and student suggestions.
* **Digital Attendance:** Track and visualize club attendance to monitor weekly member engagement.
* **Resources Hub:** Centralized storage for UNEB ICT practical prep materials, textbook transcriptions, documentation, and useful technical links.

### 🏆 Gamification & Growth

* **Leaderboard:** Climb the ranks and earn specific technical badges by solving coding challenges and contributing to club projects.
* **Club Showcase:** A social feed for members to share active projects, get peer feedback, and inspire others within the STAHIZZA community.

---

## 🛠️ Getting Started

### 1. Prerequisites

* Node.js (v18 or higher recommended)
* A Supabase project instance for backend storage and security management (optional, falls back to a safe sandbox mode automatically when not configured).
* A **Google Gemini API Key** (for server-side AI-powered tutoring).

### 2. Installation

```bash
# Install dependencies
npm install
```

### 3. Configuration

Create a `.env` file in the root directory of the project:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
GEMINI_API_KEY=your_google_gemini_api_key
```

### 4. Run the Development Server

```bash
npm run dev
```

---

## 🏗️ Tech Stack

* **Frontend:** React 18, Vite, Tailwind CSS, Lucide Icons, Framer Motion.
* **Backend:** Express & Node.js server.
* **AI Engine:** Google Gemini API (`@google/genai` Node.js SDK).
* **Database:** Supabase Client & Realtime integration.

---

## 🤝 Help & Support

For feature requests, localized enhancements, or bug reports, please contact the **STAHIZZA ICT Club Core Team**.

Made with ❤️ by **Atamba Joel**
