// ─────────────────────────────────────────────────────────────────────────────
// Gemini AI Helper – Civic Issue Description Generator
// ─────────────────────────────────────────────────────────────────────────────
// 👉 PASTE YOUR GEMINI API KEY BELOW (https://aistudio.google.com/apikey)
//    Keep this key private – never share it publicly.
// ─────────────────────────────────────────────────────────────────────────────

const GEMINI_API_KEY = 'AIzaSyAa1KlbWrjgpYhkRmFRAuX0DzfG7E2z9Ck';

const GEMINI_MODEL = 'gemini-2.0-flash';
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/** Internal: single attempt to call the Gemini API */
async function callGeminiOnce(prompt: string): Promise<string> {
    let response: Response;
    try {
        response = await fetch(GEMINI_API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: { temperature: 0.4, maxOutputTokens: 256 },
            }),
        });
    } catch (networkErr: any) {
        throw new Error('Network error – check your internet connection.');
    }

    const bodyText = await response.text();

    if (!response.ok) {
        console.error(`Gemini HTTP ${response.status}:`, bodyText);

        // Throw a typed 429 error so the retry loop can catch it specifically
        if (response.status === 429) {
            const err: any = new Error('rate_limit');
            err.isRateLimit = true;
            throw err;
        }

        // Other API errors – extract readable message
        try {
            const errJson = JSON.parse(bodyText);
            throw new Error(errJson?.error?.message ?? `HTTP ${response.status}`);
        } catch (inner: any) {
            if (inner.message !== bodyText) throw inner; // already parsed
            throw new Error(`Gemini API error (${response.status}).`);
        }
    }

    const data = JSON.parse(bodyText);
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
    if (!text) throw new Error('No description was generated. Please try again.');
    return text;
}

/**
 * Converts short civic issue text into a professional municipal complaint
 * description using Gemini AI. Automatically retries up to 3 times on rate
 * limit (429) with increasing delays (5s → 10s → 20s).
 */
export async function generateDescription(userText: string): Promise<string> {
    if (!userText.trim()) {
        throw new Error('Please enter some text first.');
    }

    const prompt = `You are a civic complaint assistant for a municipal reporting system.
Convert the following short input into a professional, formal complaint description for a government report.

Rules:
- Output ONLY the complaint description text. No intro, labels, or commentary.
- Keep it concise (2–4 sentences).
- Use formal, polite municipal language.
- Mention the issue, its impact, and request for prompt action.

Citizen input: "${userText}"`;

    const delays = [5000, 10000, 20000]; // retry delays in ms

    for (let attempt = 0; attempt <= delays.length; attempt++) {
        try {
            return await callGeminiOnce(prompt);
        } catch (err: any) {
            const isLast = attempt === delays.length;
            if (err?.isRateLimit && !isLast) {
                const wait = delays[attempt];
                console.warn(`Gemini 429 – retrying in ${wait / 1000}s (attempt ${attempt + 1})`);
                await sleep(wait);
                continue;
            }
            // On last retry or non-rate-limit error, surface the real message
            if (err?.isRateLimit) {
                throw new Error('Rate limit exceeded. Please wait a minute and try again.');
            }
            throw err;
        }
    }

    throw new Error('Failed to generate description after retries.');
}
