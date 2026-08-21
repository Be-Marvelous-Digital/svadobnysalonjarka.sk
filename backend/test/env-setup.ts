import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

/**
 * Must be imported before anything that pulls in src/env.ts, which snapshots
 * process.env at module load. Node gives every test file its own process, so this
 * runs once per file and each one gets an upload directory nobody else writes to.
 */
process.env.UPLOAD_DIR = mkdtempSync(path.join(tmpdir(), 'jarka-uploads-'));
