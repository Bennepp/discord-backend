import express from "express";
import fetch from "node-fetch";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config(); // Load environment variables from .env

const app = express();
app.use(cors());
app.use(express.json());

// Blacklisted terms
const blacklist = ["testterm", "@everyone", "spam"]; // Add more terms here

app.post("/submit", async (req, res) => {
  try {
    const { name, location, description } = req.body;
    const webhookURL = process.env.DISCORD_WEBHOOK;

    if (!webhookURL) {
      console.error("DISCORD_WEBHOOK not set");
      return res.status(500).json({ success: false, message: "Server misconfigured" });
    }

    // Check each input field separately for blacklisted terms
    const foundTerm = blacklist.find(term =>
      [name, location, description].some(field =>
        field && field.toLowerCase().includes(term)
      )
    );

    if (foundTerm) {
      console.log(`Blocked submission containing blacklisted term: ${foundTerm}`);
      return res.status(400).json({
        success: false,
        message: `Submission contains a blacklisted term: "${foundTerm}" and was not sent.`
      });
    }

    // Prepare payload for Discord webhook
    const payload = {
      embeds: [
        {
          title: name,
          description,
          color: 16711680,
          fields: [{ name: "Location", value: location }]
        }
      ]
    };

    const response = await fetch(webhookURL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (response.ok) {
      return res.json({ success: true });
    } else {
      return res.status(500).json({ success: false, message: "Failed to send to Discord" });
    }

  } catch (err) {
    console.error("Error in /submit:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

// Listen on Railway dynamic port
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
