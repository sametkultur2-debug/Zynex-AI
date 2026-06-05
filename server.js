const express = require("express");
const app = express();

app.get("/", (req, res) => {
    res.send("Server çalışıyor 🚀");
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log("Server çalışıyor");
});
app.get("/api", (req, res) => {
    res.json({ status: "ok", message: "API çalışıyor" });
});
