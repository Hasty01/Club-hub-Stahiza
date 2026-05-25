import { Quest, CodeChallenge, Notice, ShowcaseProject, EventSchedule, StudentProfile } from "./types";

// 1. UNEB Syllabus & Computer Studies Quests
export const INITIAL_QUESTS: Quest[] = [
  {
    id: "q-1",
    topic: "Computer Hardware & Fundamentals",
    difficulty: "Easy",
    question: "Which of the following computer components performs arithmetic calculations and logical decisions?",
    options: [
      "Random Access Memory (RAM)",
      "Arithmetic Logic Unit (ALU)",
      "Control Unit (CU)",
      "Read-Only Memory (ROM)"
    ],
    correctAnswerIndex: 1,
    explanation: "The Arithmetic Logic Unit (ALU) is the component of the Central Processing Unit (CPU) that performs arithmetic operations and logical comparisons.",
    xpReward: 30
  },
  {
    id: "q-2",
    topic: "Operating Systems",
    difficulty: "Medium",
    question: "During system boot, where is the bootstrap loader program stored so it can initiate system startup?",
    options: [
      "Solid State Drive (SSD)",
      "Random Access Memory (RAM)",
      "BIOS chip (Read-Only Memory)",
      "Virtual Memory swap file"
    ],
    correctAnswerIndex: 2,
    explanation: "The bootstrap loader is stored on the ROM BIOS chip because RAM is volatile and empty on system reboot, whereas ROM retains its program permanently.",
    xpReward: 45
  },
  {
    id: "q-3",
    topic: "Spreadsheets & Excel Formulas",
    difficulty: "Medium",
    question: "If cell A1 contains 15, cell B1 contains 20, and cell C1 contains 25. Which Excel formula calculates the average correctly?",
    options: [
      "=SUM(A1:C1)/3",
      "=AVERAGE(A1, C1)",
      "=AVG(A1:C1)",
      "=STDEV(A1:C1)"
    ],
    correctAnswerIndex: 0,
    explanation: "Though =AVERAGE(A1:C1) is also standard, '=SUM(A1:C1)/3' is a correct alternative. Note that standard `=AVG()` is not a valid Excel formula name (it must be written as '=AVERAGE()'). Therefore, '=SUM(A1:C1)/3' is the only mathematically correct Excel formula option lists.",
    xpReward: 50
  },
  {
    id: "q-4",
    topic: "Web Design HTML",
    difficulty: "Easy",
    question: "In HTML5, which tag is recommended to group a set of navigation links?",
    options: [
      "<navigation>",
      "<section id='links'>",
      "<nav>",
      "<ul>"
    ],
    correctAnswerIndex: 2,
    explanation: "The semantic HTML5 `<nav>` element is specifically intended for holding main site or section-level navigation links.",
    xpReward: 25
  },
  {
    id: "q-5",
    topic: "Database Management Systems (DBMS)",
    difficulty: "Hard",
    question: "You are designing a database for STAHIZZA where a student can enroll in multiple Clubs, and a Club can have multiple students. What type of relationship structure is this, and how should it be represented in relational tables?",
    options: [
      "One-to-Many; represented by adding the Club ID directly as a column in the Student table",
      "Many-to-Many; represented by creating a bridge/junction table containing foreign keys matching both Student ID and Club ID",
      "One-to-One; represented by nesting the Club table directly inside the Student table",
      "Many-to-Many; represented by adding serialized lists of Club IDs to each Student record"
    ],
    correctAnswerIndex: 1,
    explanation: "A student-to-club relationship is a Many-to-Many relationship. Relational theory handles this by introducing an intermediate junction table (e.g. Club_Members) containing composite foreign keys linking the two tables.",
    xpReward: 70
  },
  {
    id: "q-6",
    topic: "Networking & Internet",
    difficulty: "Medium",
    question: "What is the primary function of an IP Address (Internet Protocol Address) in a local area network (LAN)?",
    options: [
      "To measure the speed of connection in Megabits per second",
      "To translate text addresses like google.com into physical server coordinates",
      "To uniquely identify each computer device on a network so they can transfer packets to the correct target",
      "To encode raw digital bytes into analog voice waveforms for telephone hardware"
    ],
    correctAnswerIndex: 2,
    explanation: "An IP address ensures that packets find the correct computer device on a network, serving as a unique digital identifier.",
    xpReward: 40
  },
  {
    id: "q-7",
    topic: "Algorithms & Flowcharts",
    difficulty: "Hard",
    question: "In standard algorithm flowcharts, which shape represents a decision or branching point (e.g., checking if score >= 50)?",
    options: [
      "Rectangle with normal corners",
      "Parallelogram with slanted sides",
      "Diamond (rhombus) structure",
      "Oval with rounded boundaries"
    ],
    correctAnswerIndex: 2,
    explanation: "In flowchart conventions, a Diamond represents decisions (conditional checks), a Parallelogram represents Input/Output operations, a Rectangle represents operational steps, and an Oval represents Start/End boundaries.",
    xpReward: 60
  }
];

// 2. Interactive Code Challenges for the Online Sandbox
export const INITIAL_CHALLENGES: CodeChallenge[] = [
  {
    id: "c-1",
    title: "The Centered Welcome Header",
    description: "Write an HTML code snippet that creates a classic header (`<h1>`) saying 'STAHIZZA ICT Club Hub' with its text colored skyblue and perfectly centered using inline styles.",
    difficulty: "Beginner",
    initialCode: `<h1 style="color: black; text-align: left;">
  Insert Message Here
</h1>`,
    solutionRegex: "style\\s*=\\s*\"(?:[^\"]*color\\s*:\\s*(?:blue|skyblue|sky|#0000FF|deepskyblue|#00BFFF|#0284C7|#0EA5E9|#38BDF8)[^\"]*text-align\\s*:\\s*center|[^\"]*text-align\\s*:\\s*center[^\"]*color\\s*:\\s*(?:blue|skyblue|sky|#0000FF|deepskyblue|#00BFFF|#0284C7|#0EA5E9|#38BDF8))[^\"]*\"[\\s>]*STAHIZZA\\s*ICT\\s*Club\\s*Hub",
    testInstructions: "Modify style property values to sets: color: skyblue; (or other dynamic blue colors) and text-align: center; and sets cell content exactly to 'STAHIZZA ICT Club Hub'.",
    category: "HTML",
    xpReward: 40,
    hint: "Change `color: black` to `color: skyblue` and `text-align: left` to `text-align: center`, and replace the text inside with: STAHIZZA ICT Club Hub"
  },
  {
    id: "c-2",
    title: "Responsive Flex Grid Base",
    description: "Build an HTML structure containing a container `div` that spreads 3 beautiful grid items side by side. Use CSS classes in inline styles (or simple CSS style tags) or Tailwind classes in a sandbox `className` attribute. For the standard code editor checking, write a div with class name or inline style: `display: flex; gap: 20px; flex-wrap: wrap;` holding three `<article>` children.",
    difficulty: "Intermediate",
    initialCode: `<div style="display: block;">
  <article>Node 1</article>
  <article>Node 2</article>
  <article>Node 3</article>
</div>`,
    solutionRegex: "display\\s*:\\s*flex\\s*;[^>]*gap\\s*:\\s*(?:20px|5px|10px|1rem)[^>]*flex-wrap\\s*:\\s*wrap",
    testInstructions: "Modify the container's inline styles to include display: flex, gap spacing, and flex-wrap properties to align blocks dynamically.",
    category: "CSS",
    xpReward: 60,
    hint: "Replace `display: block;` with `display: flex; gap: 20px; flex-wrap: wrap;` in the container's style attribute."
  },
  {
    id: "c-3",
    title: "The Fibonacci Loop Logic",
    description: "Write a JavaScript function that returns the N-th Fibonacci number. Wait, let's make a simple interactive checker for the sandbox logic: a function named `calculateGrade(score)` that returns 'A' for scores >= 75, 'B' for >= 60, and 'F' otherwise.",
    difficulty: "Advanced",
    initialCode: `function calculateGrade(score) {
  // Return grade letters based on scores:
  return "F";
}`,
    solutionRegex: "function\\s+calculateGrade\\s*\\(\\s*score\\s*\\)\\s*\\{[\\s\\S]*score\\s*(?:>=|>)\\s*75[\\s\\S]*A[\\s\\S]*score\\s*(?:>=|>)\\s*60[\\s\\S]*B[\\s\\S]*F",
    testInstructions: "Implement conditional checks checking if score >= 75 returns 'A', score >= 60 returns 'B', and default to returning 'F'.",
    category: "JS",
    xpReward: 80,
    hint: "Use `if (score >= 75) { return 'A'; } else if (score >= 60) { return 'B'; } else { return 'F'; }` in your function body."
  }
];

// 3. Showcase Projects from Student Creators
export const INITIAL_PROJECTS: ShowcaseProject[] = [
  {
    id: "p-1",
    title: "STAHIZZA Grading Terminal",
    developer: "Jerome K. Maku",
    classLevel: "Senior 5",
    description: "An elegant interactive terminal program that helps class teachers compute UNEB computer studies points, compute division criteria, and print neat report formats instantly for STAHIZZA scholars.",
    tags: ["React", "Custom CSS", "Excel Export"],
    likes: 34,
    views: 112,
    category: "Web",
    thumbnailUrl: "https://images.unsplash.com/photo-1510915228340-29c85a43dcfe?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    codeSnippet: `// S5 Lab Practical Project
function gradeUNEB(practicalScore, theoryScore) {
  const total = practicalScore * 0.4 + theoryScore * 0.6;
  if(total >= 80) return "Distinction 1";
  if(total >= 70) return "Distinction 2";
  if(total >= 60) return "Credit 3";
  if(total >= 50) return "Credit 5";
  return "Pass 7";
}`
  },
  {
    id: "p-2",
    title: "Peer-to-Peer HTML Playground",
    developer: "Maria N. Nabulo",
    classLevel: "Senior 3",
    description: "A sandbox page inspired by CodePen, tailored for students learning first-year HTML tag families in the S1-S2 Computer syllabus. Supports auto-refreshing previews.",
    tags: ["HTML5", "Local Storage", "Iframe Prep"],
    likes: 42,
    views: 189,
    category: "Web",
    thumbnailUrl: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3"
  },
  {
    id: "p-3",
    title: "Bit Shift: Binary Learning Game",
    developer: "Felix M. Alinyo",
    classLevel: "Senior 4",
    description: "An interactive arcade card matching puzzle game where you match decimal integers to base-2 binary strings under strict clock countdown, reinforcing bits and bytes lessons.",
    tags: ["Game Logic", "Lucide Icons", "Audio Effects"],
    likes: 27,
    views: 95,
    category: "Game",
    thumbnailUrl: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3"
  }
];

// 4. Live Updates, Notices, and Discussion Board Postings
export const INITIAL_NOTICES: Notice[] = [
  {
    id: "n-1",
    author: "Mr. Ronald Mwebesa",
    role: "ICT Department / Patron",
    content: "Excellent performance in the regional quiz prep, team! Remember our weekly hands-on laboratory hackathon takes place this Friday from 2:00 PM - 4:30 PM. Focus is web layout mechanics & Excel calculations.",
    likes: 18,
    timestamp: "2 hours ago",
    isPinned: true
  },
  {
    id: "n-2",
    author: "Jerome K. Maku",
    role: "ICT Club President",
    content: "If you are working on your National Schools ICT Expo submissions, please double check that all your references and media links do not rely on local file paths. Run clean relative pointers so the judges can open them in any workstation!",
    likes: 12,
    timestamp: "1 day ago",
    isPinned: true
  },
  {
    id: "n-3",
    author: "Namazzi Sandra",
    role: "Senior 2 Representative",
    content: "Could anyone explain the precise difference between system software and application software for my revision draft? Our midterm notes seems to have conflicting summaries. Thank you in advance!",
    likes: 6,
    timestamp: "3 days ago"
  }
];

// 5. Club Event Calendar
export const INITIAL_EVENTS: EventSchedule[] = [
  {
    id: "e-1",
    title: "Practical CSS Flexbox & Bento Layouts",
    date: "2026-05-29",
    time: "2:00 PM - 4:00 PM",
    location: "Main Computer Laboratory / Block B",
    description: "A fun, hands-on masterclass led by Senior 5 web mentors. Bring code sketch ideas, learn alignment, layout design grids, and build bento boxes.",
    type: "Workshop",
    host: "Jerome Maku (President)"
  },
  {
    id: "e-2",
    title: "The S3 Inter-House Code Battle",
    date: "2026-06-03",
    time: "3:30 PM - 5:00 PM",
    location: "Lab Annex A",
    description: "Solve algorithmic computer logic loops and structure high-contrast CSS headers under precise count-down. Compete in Houses to win prestigious trophies and core XP points!",
    type: "Contest",
    host: "STAHIZZA Patron Board"
  },
  {
    id: "e-3",
    title: "Preparatory Session: UNEB Computer Studies Paper 2 Prep",
    date: "2026-06-12",
    time: "2:30 PM - 4:30 PM",
    location: "Multi-media Lab",
    description: "Detailed step-by-step review of standard past papers, spreadsheets design, databases structures, indexing syntax, with tips to gain maximum scores.",
    type: "Meeting",
    host: "Mr. Ronald Mwebesa"
  }
];

// 6. Prebuilt Top Leaderboard Profiles (For gamification realism)
export const TOP_MEMBERS: StudentProfile[] = [
  {
    name: "Jerome K. Maku",
    classLevel: "Senior 5",
    xp: 2450,
    level: 12,
    unlockedBadges: ["Web Dev", "UNEB Ace", "Club Hero", "Fast Coder"],
    solvedChallengeIds: ["c-1", "c-2"],
    avatarSeed: "Felix",
    rank: "President",
    role: "president"
  },
  {
    name: "Kyobe Arthur",
    classLevel: "Senior 6",
    xp: 1980,
    level: 10,
    unlockedBadges: ["Data Master", "Code Ninja"],
    solvedChallengeIds: ["c-1"],
    avatarSeed: "CodeNinja",
    rank: "Systems VP",
    role: "cabinet"
  },
  {
    name: "Nabulo Maria",
    classLevel: "Senior 3",
    xp: 1850,
    level: 9,
    unlockedBadges: ["Design Scholar", "CSS Artist"],
    solvedChallengeIds: ["c-1", "c-2"],
    avatarSeed: "Maria",
    rank: "Senior Rep",
    role: "member"
  },
  {
    name: "Alinyo Felix",
    classLevel: "Senior 4",
    xp: 1650,
    level: 8,
    unlockedBadges: ["Binary Pro", "Math Wizard"],
    solvedChallengeIds: ["c-1"],
    avatarSeed: "Felix",
    rank: "Game Anchor",
    role: "member"
  }
];

// List of fun, colorful African-relevant educational avatars or codes
export const AVATAR_PRESETS = [
  { id: "Mwenya", emoji: "✊🏽", label: "Tech Champion" },
  { id: "Maria", emoji: "👩🏾‍💻", label: "Dev Scholar" },
  { id: "Felix", emoji: "👨🏾‍💻", label: "Problem Solver" },
  { id: "CodeNinja", emoji: "🧠", label: "Systems Guru" },
  { id: "Sandra", emoji: "✨", label: "Visual Creator" },
  { id: "Kato", emoji: "🦁", label: "Bit Blazer" }
];
