import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();
app.use(cors()); // allow requests from your frontend
app.use(express.json());

app.post("/submit", async (req, res) => {
  const { name, location, description } = req.body;
  const webhookURL = process.env.DISCORD_WEBHOOK; // set this in your environment

  // Check for blacklisted terms
  const combinedText = `${name} ${location} ${description}`;
  if (combinedText.includes("@everyone")) {
    return res.status(400).json({ success: false, message: "Submission contains a blacklisted term." });
  }

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

  try {
    const response = await fetch(webhookURL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (response.ok) res.json({ success: true });
    else res.status(500).json({ success: false, message: "Failed to send to Discord." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error." });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
