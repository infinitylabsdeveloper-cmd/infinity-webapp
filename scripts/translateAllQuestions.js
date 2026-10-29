/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const DB_FILE = path.join(process.cwd(), 'db.json');

function extractJson(raw) {
  if (!raw) return [];
  const trimmed = raw.trim();
  try {
    return JSON.parse(trimmed);
  } catch (e) {
    const match = trimmed.match(/\[\s*\{[\s\S]*\}\s*\]/);
    if (match) {
      try {
        return JSON.parse(match[0]);
      } catch (e2) {}
    }
    throw e;
  }
}

async function translateAll() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error('No GEMINI_API_KEY found in .env');
    process.exit(1);
  }

  const ai = new GoogleGenAI({
    apiKey,
    httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }
  });

  const dbData = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
  const questions = dbData.questions || [];
  console.log(`Found ${questions.length} total questions.`);

  const batchSize = 8;
  const models = ['gemini-3.1-flash-lite', 'gemini-flash-latest', 'gemini-3.7-flash'];

  for (let i = 0; i < questions.length; i += batchSize) {
    const chunk = questions.slice(i, i + batchSize);
    const needTranslation = chunk.filter(q => !q.questionTextTelugu);

    if (needTranslation.length === 0) {
      continue;
    }

    console.log(`Translating chunk ${i + 1} to ${Math.min(i + batchSize, questions.length)} of ${questions.length}...`);

    const inputData = chunk.map(q => ({
      id: q.id,
      questionText: q.questionText,
      options: q.options,
      explanation: q.explanation || ''
    }));

    const prompt = `Translate the following ${inputData.length} MCQ questions into standard academic Telugu for APPSC & TSPSC exams.
Make sure all text, options, and explanations are translated clearly into Telugu.

Input JSON:
${JSON.stringify(inputData)}

Respond strictly in a valid JSON array of objects with keys: id, questionTextTelugu, optionsTelugu (with keys A, B, C, D), explanationTelugu.`;

    let success = false;
    for (let attempt = 0; attempt < 3; attempt++) {
      for (const model of models) {
        try {
          const response = await ai.models.generateContent({
            model,
            contents: prompt,
            config: {
              responseMimeType: 'application/json',
              temperature: 0.1
            }
          });

          const rawText = response.text || '[]';
          const parsed = extractJson(rawText);

          if (Array.isArray(parsed) && parsed.length > 0) {
            const map = new Map();
            parsed.forEach(item => map.set(item.id, item));

            chunk.forEach(q => {
              const tr = map.get(q.id);
              if (tr) {
                q.questionTextTelugu = tr.questionTextTelugu || q.questionTextTelugu;
                q.optionsTelugu = tr.optionsTelugu || q.optionsTelugu;
                q.explanationTelugu = tr.explanationTelugu || q.explanationTelugu;
              }
            });

            fs.writeFileSync(DB_FILE, JSON.stringify(dbData, null, 2), 'utf8');
            console.log(`✓ Saved chunk ${i + 1} to ${Math.min(i + batchSize, questions.length)}`);
            success = true;
            break;
          }
        } catch (err) {
          // retry on next model
        }
      }
      if (success) break;
      await new Promise(r => setTimeout(r, 1200));
    }

    if (!success) {
      console.warn(`Could not translate chunk ${i + 1} with AI, moving forward.`);
    }

    await new Promise(r => setTimeout(r, 200));
  }

  console.log('Finished translation run!');
}

translateAll().catch(console.error);
