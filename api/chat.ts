import { GoogleGenAI } from "@google/genai";

export default async function handler(req: any, res: any) {
  // Only allow POST request
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  const { messages, systemPrompt } = req.body || {};

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: "Invalid 'messages' parameter. Must be an array." });
  }

  try {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      return res.status(500).json({
        error: "GEMINI_API_KEY environment variable is not set. Please configure it in your secrets panel."
      });
    }

    const ai = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });

    const apiHistory = messages.map((msg: any) => {
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
    return res.status(200).json({ content: text });
  } catch (error: any) {
    console.error("Gemini API Error in Vercel function:", error);
    return res.status(500).json({
      error: "Failed to connect with STAHIZZA AI Learning Nodule.",
      details: error?.message || String(error),
    });
  }
}
