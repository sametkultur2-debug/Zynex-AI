const express = require("express");
const axios = require("axios");

const app = express();
app.use(express.json());

// FRONTEND (HTML) BURADA
const html = `
<!DOCTYPE html>
<html>
<head>
<title>AI Chat</title>
<style>
body { font-family: Arial; background:#0f172a; color:white; display:flex; flex-direction:column; height:100vh; margin:0;}
#chat { flex:1; padding:10px; overflow:auto;}
.msg { margin:5px; padding:8px; border-radius:6px; }
.user { background:#2563eb; text-align:right;}
.bot { background:#1e293b;}
input { width:80%; padding:10px;}
button { padding:10px;}
</style>
</head>
<body>

<div id="chat"></div>

<div>
<input id="msg" placeholder="Mesaj yaz..."/>
<button onclick="send()">Gönder</button>
</div>

<script>
async function send(){
  const msg = document.getElementById('msg').value;
  if(!msg) return;

  add(msg,'user');

  const res = await fetch('/chat',{
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body:JSON.stringify({message:msg})
  });

  const data = await res.json();
  add(data.reply,'bot');
}

function add(text,type){
  const div=document.createElement('div');
  div.className='msg '+type;
  div.innerText=text;
  document.getElementById('chat').appendChild(div);
}
</script>

</body>
</html>
`;

const GROQ_API_KEY = process.env.GROQ_API_KEY;

app.get("/", (req,res)=>{
  res.send(html);
});

app.post("/chat", async (req,res)=>{
  try {
    const message = req.body.message;

    const response = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: "llama-3.1-8b-instant",
        messages: [{ role:"user", content: message }]
      },
      {
        headers:{
          Authorization:`Bearer ${GROQ_API_KEY}`,
          "Content-Type":"application/json"
        }
      }
    );

    res.json({
      reply: response.data.choices[0].message.content
    });

  } catch (err) {
    res.json({
      reply: "Hata oluştu"
    });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, ()=>console.log("AI çalışıyor"));
