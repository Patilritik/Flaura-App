const express = require('express');
const router = express.Router();

router.post('/identify-plant', async (req, res) => {
  try {
    const { image } = req.body;
    if (!image) {
      return res.status(400).json({ message: 'Image data (base64) is required.' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ message: 'Gemini API Key is not configured on the server.' });
    }

    // Call Gemini Vision API
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

    const requestBody = {
      contents: [
        {
          parts: [
            {
              text: `Identify the plant or tree in this image. 
Respond ONLY with a valid raw JSON object, without any Markdown syntax, code block formatting (do NOT include \`\`\`json or \`\`\`), or additional commentary.
The JSON object MUST strictly conform to this structure:
{
  "isPlant": true,
  "commonName": "Common Name of the plant or tree",
  "scientificName": "Scientific name",
  "category": "Indoor" or "Outdoor",
  "family": "Botanical family",
  "description": "A beautiful, rich and informative description explaining the plant's history, appearance, and characteristics.",
  "toxicity": "Safe for pets and kids" or "Toxic if ingested (specify details)",
  "maintenance": "Low", "Medium", or "High",
  "airPurifying": true or false,
  "careTips": {
    "light": "Provide direct details about sunlight requirements",
    "water": "Provide detailed watering frequency and instructions",
    "soil": "Recommend the best type of soil/potting mix",
    "temperature": "Ideal temperature range for optimal growth"
  },
  "funFact": "An interesting, lesser-known botanical fact about this plant."
}
If the image does not show a plant, tree, flower, or shrub clearly, respond with:
{
  "isPlant": false
}`
            },
            {
              inlineData: {
                mimeType: "image/jpeg",
                data: image
              }
            }
          ]
        }
      ],
      generationConfig: {
        responseMimeType: "application/json"
      }
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = `API error (${response.status})`;
      try {
        const errorJson = JSON.parse(errorText);
        if (errorJson?.error?.message) {
          errorMessage = errorJson.error.message;
        }
      } catch (e) {
        if (errorText) {
          errorMessage = errorText.substring(0, 150);
        }
      }
      return res.status(response.status).json({ message: errorMessage });
    }

    const data = await response.json();
    return res.status(200).json(data);

  } catch (error) {
    console.error('Error in identify-plant:', error);
    return res.status(500).json({ message: 'Internal server error during plant identification.' });
  }
});

module.exports = router;
