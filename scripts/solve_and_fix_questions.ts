import fs from 'fs';

function cleanText(str: string): string {
  if (!str) return '';
  return String(str)
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function resolveQuestion(q: any): { correctOption: 'A' | 'B' | 'C' | 'D'; confidence: number; reason: string } {
  const opts = {
    A: String(q.options?.A || '').trim(),
    B: String(q.options?.B || '').trim(),
    C: String(q.options?.C || '').trim(),
    D: String(q.options?.D || '').trim(),
  };

  const exp = String(q.explanation || '').trim();
  const cExp = cleanText(exp);
  const qText = cleanText(q.questionText || '');

  // 1. Direct explicit statement in explanation like "Option A is correct", "(B) is the right answer", etc.
  const explicitMatch = exp.match(/(?:option|choice|answer|ans)[\s\:\-\.\)]*\(?([A-D])\)?\s*(?:is\s+correct|is\s+the\s+correct|is\s+right)/i)
    || exp.match(/(?:correct\s+(?:option|choice|answer)[\s\:\-\.\)]*\(?([A-D])\)?)/i)
    || exp.match(/\(?([A-D])\)?\s+is\s+the\s+correct\s+answer/i);

  if (explicitMatch && explicitMatch[1]) {
    const opt = explicitMatch[1].toUpperCase() as 'A' | 'B' | 'C' | 'D';
    return { correctOption: opt, confidence: 1.0, reason: `Explicit mention: ${explicitMatch[0]}` };
  }

  // 2. Score options based on explanation presence & unique semantic tokens
  const scores: Record<'A' | 'B' | 'C' | 'D', number> = { A: 0, B: 0, C: 0, D: 0 };
  const stopwords = new Set([
    'a', 'an', 'the', 'is', 'are', 'was', 'were', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'from',
    'by', 'about', 'as', 'into', 'like', 'through', 'after', 'over', 'between', 'out', 'against', 'during',
    'without', 'before', 'under', 'around', 'among', 'and', 'or', 'but', 'nor', 'so', 'yet', 'it', 'its',
    'this', 'that', 'these', 'those', 'they', 'them', 'their', 'only', 'also', 'all', 'both', 'each',
    'other', 'some', 'such', 'no', 'not', 'same', 'so', 'than', 'too', 'very', 'can', 'will', 'just',
    'should', 'now', 'any', 'most', 'have', 'has', 'had', 'been'
  ]);

  for (const key of ['A', 'B', 'C', 'D'] as const) {
    const optRaw = opts[key];
    const cOpt = cleanText(optRaw);
    if (!cOpt) continue;

    // Full exact text match inside explanation
    if (cExp.includes(cOpt)) {
      scores[key] += 150 + cOpt.length * 2;
    } else {
      // Token overlap
      const tokens = cOpt.split(' ').filter(t => t.length > 2 && !stopwords.has(t));
      if (tokens.length > 0) {
        let matches = 0;
        for (const t of tokens) {
          if (cExp.includes(t)) {
            matches++;
            // Higher weight for rarer or longer keywords
            scores[key] += 15 + t.length;
          }
        }
        if (matches === tokens.length) {
          scores[key] += 80; // All significant tokens matched
        }
      }
    }
  }

  let bestKey: 'A' | 'B' | 'C' | 'D' = 'A';
  let highest = -1;
  let secondHighest = -1;

  for (const key of ['A', 'B', 'C', 'D'] as const) {
    if (scores[key] > highest) {
      secondHighest = highest;
      highest = scores[key];
      bestKey = key;
    } else if (scores[key] > secondHighest) {
      secondHighest = scores[key];
    }
  }

  if (highest > 20 && highest > secondHighest + 10) {
    return { correctOption: bestKey, confidence: 0.95, reason: `Scores: A=${scores.A}, B=${scores.B}, C=${scores.C}, D=${scores.D}` };
  }

  // Fallback to current correctOption if already valid
  const current = (q.correctOption || 'A').toUpperCase() as 'A' | 'B' | 'C' | 'D';
  return { correctOption: highest > 10 ? bestKey : current, confidence: 0.5, reason: `Scores: A=${scores.A}, B=${scores.B}, C=${scores.C}, D=${scores.D}` };
}

async function main() {
  const dbPath = './db.json';
  const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
  const questions = db.questions || [];

  let changed = 0;
  const dist: Record<string, number> = { A: 0, B: 0, C: 0, D: 0 };

  questions.forEach((q: any, i: number) => {
    const res = resolveQuestion(q);
    const old = q.correctOption;
    q.correctOption = res.correctOption;
    dist[res.correctOption] = (dist[res.correctOption] || 0) + 1;

    if (old !== res.correctOption) {
      changed++;
      if (changed <= 25) {
        console.log(`[Q${i + 1}] "${q.questionText}"`);
        console.log(`   Options: A: "${q.options.A}" | B: "${q.options.B}" | C: "${q.options.C}" | D: "${q.options.D}"`);
        console.log(`   Explanation: "${q.explanation}"`);
        console.log(`   Fixed: ${old} -> ${res.correctOption} (${q.options[res.correctOption]})\n`);
      }
    }
  });

  console.log(`Total questions analyzed: ${questions.length}`);
  console.log(`Total questions corrected: ${changed}`);
  console.log('Final Answer Distribution:', dist);

  fs.writeFileSync(dbPath, JSON.stringify(db, null, 2), 'utf8');
  console.log('db.json saved successfully!');
}

main();
