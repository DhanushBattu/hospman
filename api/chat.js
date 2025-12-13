// File: api/chat.js

export default async function handler(req, res) {
  // 1. Check if the request is a POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // 2. securely get the key from Vercel environment
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      throw new Error('Server configuration error: API Key is missing in Vercel');
    }

    const { userMessage, systemPrompt } = req.body;

    // 3. The Server talks to Google (This works because the server has the key)
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-lite-latest:generateContent?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{
          role: "user",
          parts: [{ text: systemPrompt + "\n\nUser Query: " + userMessage }]
        }]
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || 'API Error from Google');
    }

    // 4. Send the answer back to your website
    const text = data.candidates[0].content.parts[0].text;
    res.status(200).json({ text });

  } catch (error) {
    console.error("Server Error:", error);
    res.status(500).json({ error: error.message });
  }
}