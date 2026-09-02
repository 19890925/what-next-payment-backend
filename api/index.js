const express = require("express");

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
  res.send("WHAT NEXT? Payment Backend is running.");
});

app.post("/webhook", (req, res) => {
  console.log("Flutterwave webhook received:", req.body);
  res.sendStatus(200);
});

module.exports = app;
