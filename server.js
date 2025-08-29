import express from "express";
import fetch from "node-fetch";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Blacklisted terms
const blacklist = ["testterm", "@everyone", "spam"]; // Add any terms you want to block

// Debug startup log
console.log("🚀 Starting server with blacklist:", blacklist);

app.post("/submit", async (req, res) => {
  try {
    const { name, location, description } = req.body;
    const webhookURL = process.env.DISCORD_WEBHOOK;

    if (!webhookURL) {
      console.error("DISCORD_WEBHOOK not set");
      return res.status(500).json({ success: false, message: "Server misconfigured" });
    }

    // Debug: log incoming submission
    console.log("Incoming submission:", { name, location, description });

    // Check for blacklisted terms
    const foundTerm = blacklist.find(term =>
      [name || "", location || "", description || ""].some(field =>
        field.toLowerCase().includes(term)
      )
    );

    if (foundTerm) {
      console.log(`Blocked submission containing blacklisted term: ${foundTerm}`);
      return res.status(400).json({
        success: false,
        message: `Submission contains a blacklisted term: "${foundTerm}" and was not sent.`
      });
    }

    // Prepare Discord webhook payload
    const payload = {
      embeds: [
        {
          title: name || "No name provided",
          description: description || "",
          color: 16711680,
          fields: [{ name: "Location", value: location || "No location provided" }]
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

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
