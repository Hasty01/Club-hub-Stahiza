export interface Message {
  role: "user" | "model";
  content: string;
  timestamp: string;
}

export interface StudentProfile {
  id?: string;
  name: string;
  classLevel: string; // e.g., "Senior 1", "Senior 3", "Senior 5", "Patron/Teacher"
  xp: number;
  level: number;
  unlockedBadges: string[];
  solvedChallengeIds: string[];
  avatarUrl: string; // e.g., custom URL
  rank: string;
  role: "president" | "cabinet" | "member";
  email?: string;
  username?: string;
  bio?: string;
  streak?: number;
}

export interface Quest {
  id: string;
  topic: string; // e.g., "Operating Systems", "Networking", "Web Dev", "Spreadsheets"
  difficulty: "Easy" | "Medium" | "Hard";
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
  xpReward: number;
}

export interface CodeChallenge {
  id: string;
  title: string;
  description: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  initialCode: string;
  solutionRegex: string; // Used to validate solution pattern-wise
  testInstructions: string;
  category: "HTML" | "CSS" | "JS" | "Excel";
  xpReward: number;
  hint: string;
}

export interface Notice {
  id: string;
  author: string;
  role: string; // "Student", "Patron", "President"
  content: string;
  likes: number;
  timestamp: string;
  isPinned?: boolean;
}

export interface ShowcaseProject {
  id: string;
  title: string;
  developer: string;
  classLevel: string;
  description: string;
  tags: string[];
  codeSnippet?: string;
  likes: number;
  views: number;
  category: "Web" | "Game" | "Algorithm" | "Design";
  thumbnailUrl: string; // Selectable default presets or empty
}

export interface EventSchedule {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  description: string;
  type: "Workshop" | "Meeting" | "Contest" | "Expo";
  host: string;
}
