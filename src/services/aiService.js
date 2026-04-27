// AI Service — Gemini 1.5 Flash API
// Analyzes civic issue images + descriptions and returns
// structured { category, severity } JSON

import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

// Initialize Gemini client
const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

/**
 * Converts a File object to a base64-encoded string + mimeType
 * required by the Gemini multimodal API.
 */
async function fileToGenerativePart(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      // reader.result is "data:<mimeType>;base64,<data>"
      const base64Data = reader.result.split(',')[1];
      resolve({
        inlineData: {
          data: base64Data,
          mimeType: file.type,
        },
      });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Valid categories and severities for validation
 */
const VALID_CATEGORIES = [
  'pothole',
  'garbage',
  'water_leak',
  'broken_streetlight',
  'graffiti',
  'flooding',
  'road_damage',
  'illegal_dumping',
  'sewage',
  'other',
];

const VALID_SEVERITIES = ['low', 'medium', 'high'];

/**
 * Analyzes a civic issue using Gemini AI.
 *
 * @param {File|null} imageFile  - Optional image file of the issue
 * @param {string}    description - Text description of the issue
 * @returns {Promise<{ category: string, severity: string }>}
 */
export async function analyzeIssue(imageFile, description) {
  if (!API_KEY) {
    throw new Error('Gemini API key is not configured. Please add VITE_GEMINI_API_KEY to your .env file.');
  }

  const prompt = `You are a civic issue classification AI. Analyze the civic problem described below and optionally shown in the image.

Return ONLY a valid JSON object with exactly these two fields:
{
  "category": "<one of: pothole, garbage, water_leak, broken_streetlight, graffiti, flooding, road_damage, illegal_dumping, sewage, other>",
  "severity": "<one of: low, medium, high>"
}

Severity guidelines:
- high: Immediate danger to public safety, major infrastructure failure, health hazard
- medium: Significant inconvenience, moderate damage, needs attention within a week
- low: Minor cosmetic issue, can be addressed within a month

Issue description: "${description || 'No description provided'}"

Respond with ONLY the JSON object. No markdown, no explanation, no extra text.`;

  try {
    let result;

    if (imageFile) {
      // Multimodal: image + text
      const imagePart = await fileToGenerativePart(imageFile);
      result = await model.generateContent([prompt, imagePart]);
    } else {
      // Text-only analysis
      result = await model.generateContent(prompt);
    }

    const responseText = result.response.text().trim();

    // Strip markdown code fences if the model wrapped it
    const cleaned = responseText
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/\s*```$/i, '')
      .trim();

    // Parse JSON
    const parsed = JSON.parse(cleaned);

    // Validate fields
    const category = VALID_CATEGORIES.includes(parsed.category)
      ? parsed.category
      : 'other';

    const severity = VALID_SEVERITIES.includes(parsed.severity)
      ? parsed.severity
      : 'medium';

    return { category, severity };
  } catch (error) {
    console.error('[aiService] Error analyzing issue:', error);

    // Graceful fallback so the report can still be submitted
    return { category: 'other', severity: 'medium' };
  }
}
