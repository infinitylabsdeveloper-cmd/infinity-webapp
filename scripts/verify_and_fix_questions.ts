import fs from 'fs';
import { GoogleGenAI, Type } from '@google/genai';

async function main() {
  const dbPath = './db.json';
  if (!fs.existsSync(dbPath)) {
    console.error("db.json not found!");
    return;
  }

  const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
  const questions = db.questions || [];
  console.log(`Loaded ${questions.length} questions from db.json`);

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("GEMINI_API_KEY is not set.");
    return;
  }

  const ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build'
      }
    }
  });

  // Batch process in chunks of 20 questions for super fast and accurate processing
  const batchSize = 20;
  let totalFixed = 0;

  for (let i = 0; i < questions.length; i += batchSize) {
    const chunk = questions.slice(i, i + batchSize);
    console.log(`\nVerifying questions ${i + 1} to ${Math.min(i + batchSize, questions.length)}...`);

    const promptPayload = chunk.map((q: any, idx: number) => ({
      index: idx,
      id: q.id,
      questionText: q.questionText,
      options: q.options,
      currentCorrectOption: q.correctOption,
      explanation: q.explanation
    }));

    const systemPrompt = `You are a strict Master Exam Validator for APPSC / UPSC / State PSC competitive examinations.
Your job is to analyze each Multiple Choice Question (MCQ) with 4 options (A, B, C, D) and ensure the correct option ('A' | 'B' | 'C' | 'D') is 100% FACTUALLY ACCURATE and matches historical, geographic, and scientific facts.
For example:
- "Kalibangan is located in present-day" -> Option A: Gujarat, Option B: Punjab, Option C: Rajasthan, Option D: Haryana. The correct answer MUST be 'C' (Rajasthan).
- "Harappa is in present-day" -> Punjab, Pakistan.
- "Mohenjo-daro is in present-day" -> Sindh, Pakistan.
- "Lothal is in present-day" -> Gujarat.
- "Rakhigarhi is in present-day" -> Haryana.

For each question:
1. Determine the EXACT correct option letter ('A', 'B', 'C', or 'D').
2. Provide a clear, factual explanation confirming the correct answer.
Return a JSON array of verified objects.`;

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.7-flash',
        contents: JSON.stringify(promptPayload),
        config: {
          systemInstruction: systemPrompt,
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                index: { type: Type.INTEGER },
                id: { type: Type.STRING },
                correctOption: { 
                  type: Type.STRING,
                  enum: ['A', 'B', 'C', 'D'],
                  description: 'The exact correct option letter A, B, C, or D'
                },
                explanation: { 
                  type: Type.STRING,
                  description: 'Accurate concise explanation in English and/or Telugu explaining why this option is correct'
                }
              },
              required: ['index', 'id', 'correctOption', 'explanation']
            }
          }
        }
      });

      const validatedChunk = JSON.parse(response.text || '[]');
      for (const item of validatedChunk) {
        const targetQ = chunk[item.index] || questions.find((q: any) => q.id === item.id);
        if (targetQ) {
          if (targetQ.correctOption !== item.correctOption) {
            console.log(`  [FIXED] Q: "${targetQ.questionText.slice(0, 45)}..." was ${targetQ.correctOption} -> NOW ${item.correctOption} (${targetQ.options[item.correctOption]})`);
            targetQ.correctOption = item.correctOption;
            totalFixed++;
          }
          if (item.explanation && item.explanation.length > 5) {
            targetQ.explanation = item.explanation;
          }
        }
      }
    } catch (err) {
      console.error(`Error processing batch ${i}:`, err);
    }
  }

  console.log(`\nFinished validation! Total questions fixed: ${totalFixed} / ${questions.length}`);
  fs.writeFileSync(dbPath, JSON.stringify(db, null, 2), 'utf8');
  console.log("Updated db.json successfully!");
}

main().catch(console.error);
