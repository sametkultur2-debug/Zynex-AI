let aiMode = "helpful";
const chatHistory = [];
const express = require("express");
const axios = require("axios");

const app = express();
app.use(express.json());

const GROQ_API_KEY = process.env.GROQ_API_KEY;

/* ---------------- FRONTEND ---------------- */
const html = `
<!DOCTYPE html>
<html lang="tr">
<head>
<meta charset="UTF-8">
<title>Zynex AI Chat</title>

<style>
body{
  margin:0;
  font-family:Arial;
  background:#0b1220;
  color:white;
  display:flex;
  flex-direction:column;
  height:100vh;
}

/* HEADER */
header{
  padding:15px;
  background:#111a2e;
  text-align:center;
  font-weight:bold;
}

/* CHAT */
#chat{
  flex:1;
  padding:15px;
  overflow-y:auto;
  display:flex;
  flex-direction:column;
  gap:10px;
}

/* MESSAGES */
.msg{
  max-width:75%;
  padding:12px;
  border-radius:14px;
  line-height:1.4;
  word-wrap:break-word;
}

.user{
  align-self:flex-end;
  background:#2563eb;
  border-bottom-right-radius:4px;
}

.bot{
  align-self:flex-start;
  background:#1f2937;
  border-bottom-left-radius:4px;
}

/* INPUT */
.inputBox{
  display:flex;
  padding:10px;
  background:#111a2e;
  gap:10px;
}

input{
  flex:1;
  padding:12px;
  border:none;
  border-radius:10px;
  outline:none;
}

button{
  padding:12px 18px;
  border:none;
  border-radius:10px;
  background:#22c55e;
  color:white;
  cursor:pointer;
}

/* TYPING ANIMATION */
.typing span{
  width:6px;
  height:6px;
  margin:0 2px;
  background:white;
  display:inline-block;
  border-radius:50%;
  animation:blink 1.2s infinite;
}

.typing span:nth-child(2){ animation-delay:0.2s; }
.typing span:nth-child(3){ animation-delay:0.4s; }

@keyframes blink{
  0%,80%,100%{ opacity:0.2; }
  40%{ opacity:1; }
}

</style>
</head>

<body>

<header>🤖 Zynex AI Chat</header>

<div id="chat"></div>

<div class="inputBox">
<input id="msg" placeholder="Mesaj yaz..." />
<button onclick="send()">Gönder</button>
</div>

<script>

// mesaj ekle
function addMessage(text,type){
  const div=document.createElement("div");
  div.className="msg "+type;
  div.innerText=text;
  document.getElementById("chat").appendChild(div);
  scroll();
}

// scroll
function scroll(){
  const chat=document.getElementById("chat");
  chat.scrollTop=chat.scrollHeight;
}

// typing anim
function addTyping(){
  const div=document.createElement("div");
  div.className="msg bot";
  div.id="typing";
  div.innerHTML =
    '<div class="typing">' +
    '<span></span><span></span><span></span>' +
    '</div>';

  document.getElementById("chat").appendChild(div);
  scroll();
}

function removeTyping(){
  const t=document.getElementById("typing");
  if(t) t.remove();
}

// ENTER support
document.getElementById("msg").addEventListener("keydown", function(e){
  if(e.key==="Enter"){
    e.preventDefault();
    send();
  }
});

// SEND
async function send(){
  const input=document.getElementById("msg");
  const text=input.value;
  if(!text) return;

  addMessage(text,"user");
  input.value="";

  addTyping();

  const res=await fetch("/chat",{
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify({message:text})
  });

  const data=await res.json();

  removeTyping();
  addMessage(data.reply || "Hata oluştu","bot");
  scroll();
}

</script>

</body>
</html>
`;

/* ---------------- ROUTES ---------------- */

app.get("/", (req,res)=>{
  res.send(html);
});
app.post("/mode", (req, res) => {
  const mode = req.body.mode;

  if (mode === "helpful" || mode === "cool" || mode === "aggressive") {
    aiMode = mode;
  }

  res.json({ mode: aiMode });
});
app.post("/chat", async (req, res) => {
  try {
    const message = req.body.message;

    if (!GROQ_API_KEY) {
      return res.status(500).json({
        error: "API key yok"
      });
    }

    chatHistory.push({
      role: "user",
      content: message
    });
if (chatHistory.length > 20) {
  chatHistory.splice(0, chatHistory.length - 20);
}
    const response = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: "llama-3.1-8b-instant",
  messages: [
  {
    role: "system",
    content: "..."
  }
]
        let systemPrompt = "";

if (aiMode === "helpful") {
  systemPrompt = "Sen yardımcı, samimi bir AI’sın.";
}

if (aiMode === "cool") {
  systemPrompt = "Sen cool, rahat konuşan bir AI’sın.";
}

if (aiMode === "aggressive") {
  systemPrompt = "Sen sert ve direkt konuşan bir AI’sın.";
}
Sen Zynex AI'sın.

Kurallar:
- Türkçe konuş
- Samimi ve doğal ol
- Kısa ve net cevap ver
- Gereksiz resmi ifadeler kullanma
- Kullanıcıyla sohbet eder gibi konuş
- Asla "Size nasıl yardımcı olabilirim?" tarzı klişe cümleler kullanma
`
},
          ...chatHistory
        ],
        temperature: 0.8
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

    chatHistory.push({
      role: "assistant",
      content: reply
    });

    // Çok büyümesin
    if (chatHistory.length > 20) {
      chatHistory.splice(0, chatHistory.length - 20);
    }

    res.json({ reply });

  } catch (err) {
    console.log(err.response?.data || err.message);

    res.status(500).json({
      error: "AI hata verdi"
    });
  }
});

/* ---------------- START ---------------- */

const PORT = process.env.PORT || 3000;

app.listen(PORT, ()=>{
  console.log("Zynex AI çalışıyor 🚀");
});
