const express = require("express");

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
    res.send("Zynex AI Server aktif 🚀");
});

app.post("/chat", (req, res) => {
    const message = req.body.message;

    res.json({
        reply: "Sen dedin: " + message
    });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log("Server çalışıyor");
});
