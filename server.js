require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
app.use(cors()); // allow requests from any origin
app.use(express.json());

const PORT = process.env.PORT || 3000;

app.post('/submit', async (req, res) => {
  const { name, location, description } = req.body;

  if (!name || !location || !description) return res.json({ success: false });

  try {
    await axios.post(process.env.DISCORD_WEBHOOK, {
      content: `**New Submission**\nName: ${name}\nLocation: ${location}\nDescription: ${description}`
    });
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.json({ success: false });
  }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
