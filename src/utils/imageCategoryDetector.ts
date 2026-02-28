// ─────────────────────────────────────────────────────────────────────────────
// AI Image Category Detector – Civic Issue Classification
// ─────────────────────────────────────────────────────────────────────────────
// Uses Google Gemini 2.0 Flash (Vision) to analyse a captured photo and
// predict the civic issue category automatically.
// ─────────────────────────────────────────────────────────────────────────────

import { File } from 'expo-file-system';

const GEMINI_API_KEY = 'AIzaSyAa1KlbWrjgpYhkRmFRAuX0DzfG7E2z9Ck';

const GEMINI_MODEL = 'gemini-2.0-flash';
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;

/** All valid categories the app supports */
export const VALID_CATEGORIES = [
    'Pothole',
    'Garbage',
    'Water Leakage',
    'Streetlight',
    'Sewage',
    'Road Damage',
    'Others',
] as const;

export type CivicCategory = (typeof VALID_CATEGORIES)[number];

export interface DetectionResult {
    category: CivicCategory;
    confidence: number;
}

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/** Single attempt to call Gemini Vision API for category detection */
async function callGeminiVisionOnce(
    base64Image: string,
    mimeType: string,
): Promise<DetectionResult> {
    const prompt = `You are a civic issue image classifier. Analyze this image and determine the type of civic/infrastructure problem shown.

Classify the image into exactly ONE of these categories:
- Pothole (road potholes, road holes, road pits)
- Garbage (waste, litter, trash dumps, overflowing bins)
- Water Leakage (water pipe leaks, flooding, waterlogging, broken pipes)
- Streetlight (broken/damaged street lights, non-functioning lights)
- Sewage (open drainage, blocked drains, sewage overflow, manhole issues)
- Road Damage (cracked roads, broken pavements, damaged curbs, uneven surfaces)
- Others (anything that doesn't fit above categories)

Respond in EXACTLY this JSON format, nothing else:
{"category": "CategoryName", "confidence": 0.XX}

Where confidence is a decimal between 0.0 and 1.0 representing how confident you are in the classification.`;

    let response: Response;
    try {
        response = await fetch(GEMINI_API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [
                    {
                        parts: [
                            {
                                inlineData: {
                                    mimeType,
                                    data: base64Image,
                                },
                            },
                            { text: prompt },
                        ],
                    },
                ],
                generationConfig: { temperature: 0.1, maxOutputTokens: 100 },
            }),
        });
    } catch (networkErr: any) {
        throw new Error('Network error – check your internet connection.');
    }

    const bodyText = await response.text();

    if (!response.ok) {
        if (response.status === 429) {
            const err: any = new Error('rate_limit');
            err.isRateLimit = true;
            throw err;
        }
        console.error(`Gemini Vision HTTP ${response.status}:`, bodyText);
        throw new Error(`Gemini API error (${response.status}).`);
    }

    const data = JSON.parse(bodyText);
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
    if (!text) throw new Error('No detection result returned.');

    // Extract JSON from response (handles cases where model adds extra text)
    const jsonMatch = text.match(/\{[\s\S]*?\}/);
    if (!jsonMatch) throw new Error('Invalid response format.');

    const parsed = JSON.parse(jsonMatch[0]);
    const rawCategory: string = parsed.category || 'Others';
    const confidence: number = Math.min(1, Math.max(0, Number(parsed.confidence) || 0));

    // Map to valid app category (case-insensitive match)
    const matchedCategory: CivicCategory =
        VALID_CATEGORIES.find(
            (c) => c.toLowerCase() === rawCategory.toLowerCase(),
        ) ?? 'Others';

    return { category: matchedCategory, confidence };
}

/**
 * Analyses a civic-issue photo and returns the predicted category with
 * confidence. Automatically retries on rate-limit (429) with back-off.
 *
 * @param imageUri  Local file URI of the captured photo
 * @returns         Detected category and confidence (0-1)
 */
export async function detectImageCategory(
    imageUri: string,
): Promise<DetectionResult> {
    // Read image as base64 using the new expo-file-system File API
    const file = new File(imageUri);
    const base64 = await file.base64();

    // Determine MIME type from extension
    const extension = imageUri.split('.').pop()?.toLowerCase();
    const mimeType = extension === 'png' ? 'image/png' : 'image/jpeg';

    // Retry with back-off on 429
    const delays = [5000, 10000];

    for (let attempt = 0; attempt <= delays.length; attempt++) {
        try {
            return await callGeminiVisionOnce(base64, mimeType);
        } catch (err: any) {
            const isLast = attempt === delays.length;
            if (err?.isRateLimit && !isLast) {
                console.warn(
                    `Gemini 429 – retrying in ${delays[attempt] / 1000}s (attempt ${attempt + 1})`,
                );
                await sleep(delays[attempt]);
                continue;
            }
            if (err?.isRateLimit) {
                throw new Error(
                    'Rate limit exceeded. Please select category manually.',
                );
            }
            throw err;
        }
    }

    throw new Error('Failed to detect category after retries.');
}
