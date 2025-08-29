import express from "express";
import fetch from "node-fetch";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const blacklist = ["testterm", "@everyone", "spam"]; // blacklisted terms

app.post("/submit", async (req, res) => {
  const { name = "", location = "", description = "" } = req.body;
  const webhookURL = process.env.DISCORD_WEBHOOK;

  if (!webhookURL) return res.status(500).json({ success: false, message: "Server misconfigured" });

  // Check blacklist
  if (blacklist.some(term => [name, location, description].some(field => field.toLowerCase().includes(term)))) {
    return res.status(400).json({ success: false, message: "Submission contains a blacklisted term and was not sent." });
  }

  try {
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

    const response = await fetch(webhookURL, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });

    return res.json({ success: response.ok });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
