const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());

app.use(express.json());
app.options("*", cors());
app.options("/create-payment", cors());

app.get("/", (req, res) => {
  res.send("WHAT NEXT? Payment Backend is running.");
});

app.post("/create-payment", async (req, res) => {
  try {
    const { email, service } = req.body;

    if (!email) {
      return res.status(400).json({
        error: "Email is required"
      });
    }

    const tx_ref = "WHATNEXT-" + Date.now();

    const response = await fetch(
      "https://api.flutterwave.com/v3/payments",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.FLW_SECRET_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          tx_ref: tx_ref,
          amount: 100,
          currency: "NGN",
          redirect_url: "https://19890925.github.io/What--next/",
          customer: {
            email: email
          },
          customizations: {
            title: "WHAT NEXT?",
            description: "Complete Plan"
          },
          meta: {
            service: service || "general"
          }
        })
      }
    );

    const data = await response.json();

    if (data.status === "success" && data.data && data.data.link) {
      return res.json({
        link: data.data.link
      });
    }

    console.error("Flutterwave error:", data);

    return res.status(400).json({
      error: "Unable to create payment"
    });

  } catch (error) {
    console.error("Payment error:", error);

    return res.status(500).json({
      error: "Payment connection failed"
    });
  }
});

app.post("/webhook", (req, res) => {
  console.log("Flutterwave webhook received:", req.body);
  res.sendStatus(200);
});

module.exports = app;
