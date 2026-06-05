const express = require("express");
const axios = require("axios");

const app = express();
app.use(express.json());

const GROQ_API_KEY = process.env.GROQ_API_KEY;

app.get("/", (req, res) => {
  res.send("Groq AI Server çalışıyor 🚀");
});

app.post("/chat", async (req, res) => {
  try {
    const message = req.body.message;

    if (!GROQ_API_KEY) {
      return res.status(500).json({
        error: "GROQ API key yok"
      });
    }

    const response = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
  model: "llama-3.1-8b-instant",
  messages: [
    { role: "user", content: message }
  ],
  temperature: 0.7
}
      {
        headers: {
          Authorization: `Bearer ${GROQ_API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    res.json({
      reply: response.data.choices[0].message.content
    });

  } catch (error) {
    console.log(error.response?.data || error.message);

    res.status(500).json({
      error: "Groq AI hata verdi",
      detail: error.response?.data || error.message
    });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Groq AI Server çalışıyor");
});
