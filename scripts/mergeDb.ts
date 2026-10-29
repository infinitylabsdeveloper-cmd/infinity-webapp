import fs from 'fs';
import path from 'path';
import { mergeExamNetworkWithExistingDb } from '../src/lib/allIndiaExamRegistry';

const dbPath = path.join(process.cwd(), 'db.json');

try {
  const raw = fs.readFileSync(dbPath, 'utf8');
  const db = JSON.parse(raw);
  const beforeCount = db.apps ? db.apps.length : 0;
  
  db.apps = mergeExamNetworkWithExistingDb(db.apps || []);
  
  fs.writeFileSync(dbPath, JSON.stringify(db, null, 2), 'utf8');
  console.log(`Successfully merged All India Exams Network! Apps count went from ${beforeCount} to ${db.apps.length}`);
  db.apps.forEach((a: any) => {
    console.log(`- [${(a.mediums || []).join('/')}] ${a.id}: ${a.name} (${a.examCategory})`);
  });
} catch (err) {
  console.error('Error merging db:', err);
  process.exit(1);
}
