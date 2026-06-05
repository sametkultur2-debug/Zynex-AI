const express = require("express");
const axios = require("axios");

const app = express();
app.use(express.json());
app.get("/", (req, res) => {
  res.send("Zynex AI çalışıyor 🚀 API aktif");
});
// ====================== CONFIG ======================
const GROQ_API_KEY = process.env.GROQ_API_KEY;

// Her kullanıcı için basit hafıza (demo)
const chatHistory = [];

// AI modu
let aiMode = "helpful";

// ====================== MODE ENDPOINT ======================
app.post("/mode", (req, res) => {
  const mode = req.body.mode;

  if (["helpful", "cool", "aggressive"].includes(mode)) {
    aiMode = mode;
  }

  res.json({ mode: aiMode });
});

// ====================== CHAT ENDPOINT ======================
app.post("/chat", async (req, res) => {
  try {
    const message = req.body.message;

    if (!GROQ_API_KEY) {
      return res.status(500).json({ error: "API key yok" });
    }

    // Kullanıcı mesajı hafıza
    chatHistory.push({
      role: "user",
      content: message
    });

    // Hafıza limiti (performans için)
    if (chatHistory.length > 20) {
      chatHistory.splice(0, chatHistory.length - 20);
    }

    // ====================== SYSTEM PROMPT ======================
    let systemPrompt = "";

    if (aiMode === "helpful") {
      systemPrompt = `
Sen Zynex AI'sın.
Türkçe konuş.
Samimi, yardımcı ve doğal ol.
Kısa ve net cevap ver.
Klişe cümleler kullanma.
`;
    }

    if (aiMode === "cool") {
      systemPrompt = `
Sen Zynex AI'sın.
Cool, özgüvenli ve rahat konuş.
Kısa, havalı cevaplar ver.
Fazla resmi olma.
`;
    }

    if (aiMode === "aggressive") {
      systemPrompt = `
Sen Zynex AI'sın.
Sert, direkt ve net konuş.
Yumuşatma yapma.
Kısa cevap ver.
`;
    }

    // ====================== GROQ REQUEST ======================
    const response = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: "llama-3.1-8b-instant",
        messages: [
          {
            role: "system",
            content: systemPrompt
          },
          ...chatHistory
        ],
        temperature: 0.7,
        max_tokens: 300
      },
      {
        headers: {
          Authorization: `Bearer ${GROQ_API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    const reply =
      response?.data?.choices?.[0]?.message?.content ||
      "Şu an cevap veremiyorum.";

    // AI cevabı hafızaya ekle
    chatHistory.push({
      role: "assistant",
      content: reply
    });

    res.json({ reply });

  } catch (err) {
    console.log("ERROR:", err.response?.data || err.message);

    res.status(500).json({
      error: "AI hata verdi",
      detail: err.response?.data || err.message
    });
  }
});

// ====================== SERVER ======================
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Zynex AI çalışıyor 🚀 Port:", PORT);
});
