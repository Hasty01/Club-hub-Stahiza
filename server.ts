import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import { createServer as createViteServer } from "vite";

dotenv.config();

// Create Express app
const app = express();
app.use(express.json());

const PORT = 3000;

// Lazy initialize Gemini API client safely
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      console.warn("WARNING: GEMINI_API_KEY environment variable is not set. AI features might fail.");
    }
    aiClient = new GoogleGenAI({
      apiKey: key || "",
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// -------------------------------------------------------------
// API ENDPOINTS
// -------------------------------------------------------------

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "healthy", timestamp: new Date().toISOString() });
});

// Chat with ICT AI Tutor Node
app.post("/api/chat", async (req, res) => {
  const { messages, systemPrompt } = req.body;

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: "Invalid 'messages' parameter. Must be an array." });
  }

  try {
    const ai = getGeminiClient();

    // Map the message history into the Google GenAI SDK format.
    // Standard role format in Google GenAI SDK is 'user' or 'model'.
    const apiHistory = messages.map((msg) => {
      // Clean up role names: maps 'assistant' to 'model' if necessary
      const role = msg.role === "assistant" || msg.role === "model" ? "model" : "user";
      return {
        role,
        parts: [{ text: msg.content || "" }],
      };
    });

    const defaultSystemPrompt = 
      "You are 'STAHIZZA AI Learning Nodule', an upbeat, highly encouraging, and super-intelligent AI virtual mentor " +
      "for student and patron of Standard High High School Zzana (STAHIZZA) ICT Club (located in Uganda). " +
      "Explain syllabus topics clearly (HTML, algorithms, website design, database structures, spreadsheet calculations, computer storage, networking) " +
      "with helpful local context if requested. Keep explanations extremely visual, simple, structured with bullet points and emojis, and professional. " +
      "If asked to write code, provide elegant, commented code blocks inside Markdown format. " +
      "Avoid dry or over-technical jargon unless requested and motivate students to level up their skills!";

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: apiHistory,
      config: {
        systemInstruction: systemPrompt || defaultSystemPrompt,
        temperature: 0.7,
      },
    });

    const text = response.text || "I apologize, but I couldn't generate a proper response. Please try reframing your question.";
    res.json({ content: text });
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    res.status(500).json({
      error: "Failed to connect with STAHIZZA AI Learning Nodule. Please check that your Gemini API Key is configured.",
      details: error?.message || String(error),
    });
  }
});

// -------------------------------------------------------------
// VITE OR STATIC FILE SERVING
// -------------------------------------------------------------

async function initializeApp() {
  if (process.env.NODE_ENV !== "production") {
    console.log("Starting server in DEVELOPMENT mode...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Starting server in PRODUCTION mode...");
    const distPath = path.join(process.cwd(), "dist");
    
    // Serve static frontend assets
    app.use(express.static(distPath));
    
    // Fallback all other requests to index.html for React SPA Router
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server successfully started. Running on http://localhost:${PORT}`);
  });
}

initializeApp().catch((err) => {
  console.error("Critical: Failed to launch server:", err);
  process.exit(1);
});
