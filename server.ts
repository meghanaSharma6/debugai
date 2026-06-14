import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// Lazy init/helper for Gemini as requested by the guidelines
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is not set. Please add it in Settings > Secrets.");
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

// REST Endpoint: Debug Code
app.post("/api/debug", async (req, res) => {
  try {
    const { code, language, errorLogs, extraContext } = req.body;

    if (!code || typeof code !== "string" || code.trim() === "") {
      res.status(400).json({ error: "Code input is required." });
      return;
    }

    const ai = getGeminiClient();

    const userPrompt = `
You are an expert developer diagnostic assistant. Your task is to analyze the following code, pinpoint the errors or bad practices, and deliver a comprehensive diagnostic report with corrected code.

Language hint: ${language || "Auto-detect"}
Optional error logs provided: ${errorLogs || "None provided"}
Optional developer context: ${extraContext || "None provided"}

Here is the source code:
\`\`\`
${code}
\`\`\`

Analyze the code for:
1. Syntax errors, compilation failures, typos, or runtime crashes.
2. Logic or algorithmic bugs.
3. Clean coding standards and proper naming formatting.

Please make sure the explanation contains a highly rigorous, point-wise breakdown of each key issue found, including root cause, runtime impact, and preventive coding advice. Structuring it as bullet points or numbered findings is mandatory.

Structure the response matching the provided schema exactly. Be extremely precise on the matching line numbers of the original code in the lineIssues array.
`;

    // Always use gemini-3.5-flash for standard text-based JSON structured outputs
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: userPrompt,
      config: {
        systemInstruction: "You are 'DebugAI' - an Elite Developer's Intelligent debugging system. Walk through code line-by-line, diagnose exact errors, explain them clearly using standard developer markdown point-wise terminology (emphasizing bulleted or numbered lists of key findings), and output perfectly working copyable and downloadable code. Be strict about JSON compliance.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            errorSummary: {
              type: Type.STRING,
              description: "A short, crystal-clear 1-sentence headline of the main error/bug found (e.g. 'ReferenceError: counter is not declared before incrementing')."
            },
            language: {
              type: Type.STRING,
              description: "The determined programming language (e.g. JavaScript, Python, C++, TypeScript)."
            },
            explanation: {
              type: Type.STRING,
              description: "A detailed, structured, point-wise breakdown of why each error or bug occurs. Explain findings in bullet points or numbered lists detailing the root causes, runtime consequences, and direct preventive patterns. No generic fluff. Use markdown."
            },
            lineIssues: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  line: {
                    type: Type.INTEGER,
                    description: "The 1-based line number of the original input code where the issue resides. If it's a general issue, use 0."
                  },
                  issue: {
                    type: Type.STRING,
                    description: "What is wrong on this specific line (e.g., 'Missing closing parenthesis' or 'Incorrect type casting')."
                  },
                  fix: {
                    type: Type.STRING,
                    description: "What the code should look like or how to fix it on this line."
                  }
                },
                required: ["line", "issue", "fix"]
              },
              description: "A list of line-specific issues and fixes identified in the source code."
            },
            correctedCode: {
              type: Type.STRING,
              description: "The complete, pristine, fully corrected version of the code, ready to be immediately copied, downloaded, and safely executed."
            },
            fileNameSuggested: {
              type: Type.STRING,
              description: "A suggested filename including the correct extension based on the language (e.g., 'main.py' or 'App.tsx')."
            }
          },
          required: ["errorSummary", "language", "explanation", "lineIssues", "correctedCode", "fileNameSuggested"]
        }
      }
    });

    const text = response.text;
    if (!text) {
      throw new Error("No response text received from Gemini.");
    }

    const parsedData = JSON.parse(text);
    res.json(parsedData);

  } catch (error: any) {
    console.error("Debug Error:", error);
    res.status(500).json({
      error: error.message || "An error occurred during AI analysis."
    });
  }
});

// Setup development or production front-end serving
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`DebugAI server up and running on http://localhost:${PORT}`);
  });
}

startServer();
