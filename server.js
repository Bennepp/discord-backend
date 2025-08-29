import express from "express";
import fetch from "node-fetch";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.post("/submit", async (req, res) => {
  const { name, location, description } = req.body;
  const webhookURL = process.env.DISCORD_WEBHOOK;

  if (!webhookURL) return res.status(500).json({ success: false, message: "Webhook not set" });

  let coords = location;

  // Convert address to coordinates using Nominatim API
  try {
    const geoRes = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(location)}`);
    const geoData = await geoRes.json();
    if (geoData && geoData.length > 0) {
      const { lat, lon } = geoData[0];
      coords = `${lat}, ${lon} (${location})`;
    }
  } catch (err) {
    console.error("Geocoding failed:", err);
    coords = `${location} (coords not found)`;
  }

  // Prepare Discord webhook payload
  const payload = {
    embeds: [
      {
        title: name || "No name provided",
        description: description || "",
        color: 16711680,
        fields: [{ name: "Location", value: coords }]
      }
    ]
  };

  try {
    const discordRes = await fetch(webhookURL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    if (discordRes.ok) res.json({ success: true });
    else res.status(500).json({ success: false, message: "Failed to send to Discord" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
