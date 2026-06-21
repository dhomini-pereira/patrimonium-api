import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { pool } from '../config/database';

async function migrate() {
  console.log('🔄 Running migrations...');

  const client = await pool.connect();
  try {
    const schema = readFileSync(join(__dirname, 'schema.sql'), 'utf-8');

    const statements: string[] = [];
    let current = '';
    let insideDollar = false;

    for (const line of schema.split('\n')) {
      const trimmed = line.trim();

      if (trimmed.startsWith('DO $$') || trimmed === 'DO $$') {
        insideDollar = true;
      }

      current += line + '\n';

      if (insideDollar && (trimmed === 'END $$;' || trimmed.endsWith('END $$;'))) {
        insideDollar = false;
        statements.push(current.trim());
        current = '';
      } else if (!insideDollar && trimmed.endsWith(';') && !trimmed.startsWith('--')) {
        statements.push(current.trim());
        current = '';
      }
    }

    if (current.trim()) statements.push(current.trim());

    for (const stmt of statements) {
      const clean = stmt.replace(/--.*$/gm, '').trim();
      if (!clean) continue;
      try {
        await client.query(stmt);
      } catch (err: unknown) {
        if (err instanceof Error) console.error('⚠️  Statement failed:', stmt.substring(0, 80), '...', err.message);
      }
    }

    console.log('✅ Migrations completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

migrate();
