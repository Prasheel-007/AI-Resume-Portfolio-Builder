import { GoogleGenerativeAI } from '@google/generative-ai';

export const config = {
    maxDuration: 60, // Extends Vercel timeout to 60 seconds
};

// Hard cap on incoming prompt size to prevent abuse and runaway costs
const MAX_PROMPT_LENGTH = 12000;

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, error: 'Method not allowed' });
    }

    try {
        const { prompt } = req.body;

        if (!prompt || typeof prompt !== 'string') {
            return res.status(400).json({ success: false, error: 'A valid prompt string is required.' });
        }

        if (prompt.length > MAX_PROMPT_LENGTH) {
            return res.status(400).json({ success: false, error: 'Input is too long. Please reduce the amount of text and try again.' });
        }

        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        return res.status(200).json({ success: true, data: text });

    } catch (error) {
        console.error('Error generating content:', error);

        // Distinguish API key problems from general generation failures
        const isKeyError = error?.message?.toLowerCase().includes('api key') ||
                           error?.message?.toLowerCase().includes('api_key') ||
                           error?.status === 401 || error?.status === 403;

        const message = isKeyError
            ? 'API key is invalid or not configured. Contact the site owner.'
            : 'Failed to generate content. Please try again in a moment.';

        return res.status(500).json({ success: false, error: message });
    }
}