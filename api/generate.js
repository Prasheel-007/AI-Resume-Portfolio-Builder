import { GoogleGenerativeAI } from '@google/generative-ai';

export default async function handler(req, res) {
    // Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { prompt } = req.body;

        if (!prompt) {
            return res.status(400).json({ error: "Prompt is required" });
        }


        // Initialize Gemini using the secure environment variable
        // This process.env.GEMINI_API_KEY will be set in Vercel's dashboard later
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // Send the result back to the frontend
        return res.status(200).json({ success: true, data: text });

    } catch (error) {
        console.error("Error generating content:", error);
        return res.status(500).json({ success: false, error: "Failed to generate content." });
    }
}