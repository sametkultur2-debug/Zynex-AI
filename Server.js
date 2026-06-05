const express = require("express");

const app = express();

app.get("/", (req, res) => {
  res.send("Zynex AI Server aktif 🚀");
});

app.listen(3000, () => {
  console.log("Server çalışıyor");
});
