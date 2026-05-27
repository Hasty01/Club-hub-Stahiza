import { Quest, CodeChallenge } from "./types";

// ============================================
// STAHIZA ICT CLUB HUB
// Core Static Learning Data
// ============================================

// 1. UNEB Syllabus & Computer Studies Quests
export const INITIAL_QUESTS: Quest[] = [
  {
    id: "q-1",
    topic: "Computer Hardware & Fundamentals",
    difficulty: "Easy",
    question:
      "Which of the following computer components performs arithmetic calculations and logical decisions?",
    options: [
      "Random Access Memory (RAM)",
      "Arithmetic Logic Unit (ALU)",
      "Control Unit (CU)",
      "Read-Only Memory (ROM)",
    ],
    correctAnswerIndex: 1,
    explanation:
      "The Arithmetic Logic Unit (ALU) is the component of the CPU responsible for arithmetic operations and logical comparisons.",
    xpReward: 30,
  },

  {
    id: "q-2",
    topic: "Operating Systems",
    difficulty: "Medium",
    question:
      "During system boot, where is the bootstrap loader program stored?",
    options: [
      "Solid State Drive (SSD)",
      "Random Access Memory (RAM)",
      "BIOS chip (ROM)",
      "Virtual Memory",
    ],
    correctAnswerIndex: 2,
    explanation:
      "The bootstrap loader is stored in ROM BIOS because ROM retains data permanently even after shutdown.",
    xpReward: 45,
  },

  {
    id: "q-3",
    topic: "Web Design HTML",
    difficulty: "Easy",
    question:
      "In HTML5, which semantic tag is specifically designed for navigation links?",
    options: [
      "<section>",
      "<navigation>",
      "<nav>",
      "<links>",
    ],
    correctAnswerIndex: 2,
    explanation:
      "The <nav> element is used for navigation menus and navigation links in HTML5.",
    xpReward: 25,
  },

  {
    id: "q-4",
    topic: "Networking",
    difficulty: "Medium",
    question:
      "What is the primary purpose of an IP address in a network?",
    options: [
      "To increase internet speed",
      "To identify devices uniquely",
      "To encrypt files",
      "To store web pages",
    ],
    correctAnswerIndex: 1,
    explanation:
      "An IP address uniquely identifies devices on a network so data packets can reach the correct destination.",
    xpReward: 40,
  },

  {
    id: "q-5",
    topic: "Database Management Systems",
    difficulty: "Hard",
    question:
      "A student can join multiple clubs and a club can contain multiple students. What type of relationship is this?",
    options: [
      "One-to-One",
      "One-to-Many",
      "Many-to-Many",
      "Hierarchical",
    ],
    correctAnswerIndex: 2,
    explanation:
      "This is a Many-to-Many relationship and is handled using a junction/bridge table.",
    xpReward: 70,
  },
];

// ============================================
// Interactive Coding Challenges
// ============================================

export const INITIAL_CHALLENGES: CodeChallenge[] = [
  {
    id: "c-1",
    title: "Centered Welcome Header",
    description:
      "Create an HTML h1 element displaying 'STAHIZA ICT Club Hub' centered with skyblue text.",
    difficulty: "Beginner",

    initialCode: `<h1 style="color: black; text-align: left;">
  Insert Message Here
</h1>`,

    solutionRegex:
      "style\\s*=\\s*\"(?:[^\"]*color\\s*:\\s*(?:skyblue|blue|#38BDF8)[^\"]*text-align\\s*:\\s*center|[^\"]*text-align\\s*:\\s*center[^\"]*color\\s*:\\s*(?:skyblue|blue|#38BDF8))[^\"]*\"[\\s>]*STAHIZA\\s*ICT\\s*Club\\s*Hub",

    testInstructions:
      "Change the color to skyblue and align the text to center.",

    category: "HTML",

    xpReward: 40,

    hint:
      "Use: color: skyblue; text-align: center;",
  },

  {
    id: "c-2",
    title: "Responsive Flex Layout",

    description:
      "Create a responsive flex container holding three article elements side-by-side.",

    difficulty: "Intermediate",

    initialCode: `<div style="display: block;">
  <article>Node 1</article>
  <article>Node 2</article>
  <article>Node 3</article>
</div>`,

    solutionRegex:
      "display\\s*:\\s*flex\\s*;[^>]*gap\\s*:\\s*(?:20px|1rem)[^>]*flex-wrap\\s*:\\s*wrap",

    testInstructions:
      "Use display:flex with gap and flex-wrap.",

    category: "CSS",

    xpReward: 60,

    hint:
      "Use display:flex; gap:20px; flex-wrap:wrap;",
  },

  {
    id: "c-3",
    title: "Grade Calculator Function",

    description:
      "Write a JavaScript function called calculateGrade(score).",

    difficulty: "Advanced",

    initialCode: `function calculateGrade(score) {
  return "F";
}`,

    solutionRegex:
      "function\\s+calculateGrade\\s*\\(\\s*score\\s*\\)\\s*\\{[\\s\\S]*score\\s*(?:>=|>)\\s*75[\\s\\S]*A[\\s\\S]*score\\s*(?:>=|>)\\s*60[\\s\\S]*B[\\s\\S]*F",

    testInstructions:
      "Return A for >=75, B for >=60, else F.",

    category: "JS",

    xpReward: 80,

    hint:
      "Use if/else statements to compare the score.",
  },
];