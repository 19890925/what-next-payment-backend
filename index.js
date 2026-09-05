const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("WHAT NEXT? Payment Backend is running.");
});

/*
  CREATE PAYMENT
*/
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
          tx_ref,
          amount: 100,
          currency: "NGN",

          redirect_url:
            "https://19890925.github.io/What--next/",

          customer: {
            email
          },

          customizations: {
            title: "WHAT NEXT?",
            description: "Complete Plan"
          },

          meta: {
            service: service || "general",
            customer_email: email
          }
        })
      }
    );

    const data = await response.json();

    if (data.status === "success" && data.data?.link) {
      return res.json({
        link: data.data.link,
        tx_ref
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


/*
  VERIFY PAYMENT
*/
app.get("/verify-payment", async (req, res) => {
  try {
    const { transaction_id } = req.query;

    if (!transaction_id) {
      return res.status(400).json({
        success: false,
        error: "Transaction ID is required"
      });
    }

    const response = await fetch(
      `https://api.flutterwave.com/v3/transactions/${transaction_id}/verify`,
      {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${process.env.FLW_SECRET_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    const data = await response.json();

    console.log("Flutterwave verification:", data);

    if (
      data.status === "success" &&
      data.data &&
      data.data.status === "successful" &&
      Number(data.data.amount) >= 100 &&
      data.data.currency === "NGN"
    ) {
      return res.json({
        success: true,
        email: data.data.customer?.email || null,
        tx_ref: data.data.tx_ref,
        amount: data.data.amount,
        currency: data.data.currency
      });
    }

    return res.status(400).json({
      success: false,
      error: "Payment was not successful"
    });

  } catch (error) {
    console.error("Verification error:", error);

    return res.status(500).json({
      success: false,
      error: "Payment verification failed"
    });
  }
});


/*
  WEBHOOK
*/
app.post("/webhook", (req, res) => {
  console.log("Flutterwave webhook received:", req.body);

  res.sendStatus(200);
});


module.exports = app;
