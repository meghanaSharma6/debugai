import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "10mb" }));

// Debug Endpoint
app.post("/api/debug", async (req, res) => {
  try {
    const { code, language } = req.body;

    if (!code || typeof code !== "string" || code.trim() === "") {
      return res.status(400).json({
        error: "Code input is required."
      });
    }

    // Demo Response
    return res.json({
      errorSummary: "Demo Analysis Completed",

      language: language || "JavaScript",

      explanation: `
1. This is a demo response because Gemini quota has been exceeded.
2. Frontend and backend communication is working correctly.
3. API endpoint /api/debug is functioning properly.
4. Replace the API key or enable Gemini quota for real AI analysis.
5. DebugAI successfully received and processed the submitted code.
      `,

      lineIssues: [
        {
          line: 1,
          issue: "Sample issue detected",
          fix: "Replace with correct syntax"
        },
        {
          line: 2,
          issue: "Potential runtime error",
          fix: "Validate input before use"
        }
      ],

      correctedCode: code,

      fileNameSuggested: "corrected_code.txt"
    });

  } catch (error: any) {
    console.error("Debug Error:", error);

    return res.status(500).json({
      error: error.message || "Internal Server Error"
    });
  }
});

// Setup Vite
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: {
        middlewareMode: true
      },
      appType: "spa"
    });

    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");

    app.use(express.static(distPath));

    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(
      `DebugAI server up and running on http://localhost:${PORT}`
    );
  });
}

startServer();