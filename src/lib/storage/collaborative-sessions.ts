/**
 * Collaborative sessions — shared workspaces for Mage responses. Block 14 homepage.
 */

import { readFile, writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

const DATA_DIR = join(process.cwd(), '.data');
const FILE_PATH = join(DATA_DIR, 'collaborative-sessions.json');

export interface SessionContribution {
  id: string;
  workingGroup: string;
  content: string;
  participantId?: string;
  createdAt: string;
}

export interface CollaborativeSessionRow {
  id: string;
  title: string;
  workingGroup: string;
  createdAt: string;
  contributions: SessionContribution[];
}

let inMemory: CollaborativeSessionRow[] = [
  {
    id: 'block14-ikp',
    title: 'Block 14 — IKP',
    workingGroup: 'ikp',
    createdAt: new Date().toISOString(),
    contributions: [],
  },
  {
    id: 'block14-fase',
    title: 'Block 14 — FASE',
    workingGroup: 'fase',
    createdAt: new Date().toISOString(),
    contributions: [],
  },
  {
    id: 'block14-cyber',
    title: 'Block 14 — Cyber',
    workingGroup: 'cyber',
    createdAt: new Date().toISOString(),
    contributions: [],
  },
  {
    id: 'block14-governance',
    title: 'Block 14 — Governance',
    workingGroup: 'governance',
    createdAt: new Date().toISOString(),
    contributions: [],
  },
];

async function load(): Promise<CollaborativeSessionRow[]> {
  try {
    const raw = await readFile(FILE_PATH, 'utf-8');
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : inMemory;
  } catch {
    return inMemory;
  }
}

async function save(rows: CollaborativeSessionRow[]): Promise<void> {
  await mkdir(DATA_DIR, { recursive: true });
  await writeFile(FILE_PATH, JSON.stringify(rows, null, 2), 'utf-8');
  inMemory = rows;
}

export async function listCollaborativeSessions(): Promise<CollaborativeSessionRow[]> {
  const rows = await load();
  if (rows.length === 0) {
    await save(inMemory);
    return inMemory;
  }
  return rows;
}

export async function getCollaborativeSession(id: string): Promise<CollaborativeSessionRow | null> {
  const rows = await load();
  return rows.find((s) => s.id === id) ?? null;
}

export async function addContribution(
  sessionId: string,
  contribution: Omit<SessionContribution, 'id' | 'createdAt'>
): Promise<CollaborativeSessionRow | null> {
  const rows = await load();
  const idx = rows.findIndex((s) => s.id === sessionId);
  if (idx < 0) return null;
  const session = rows[idx];
  if (!session.contributions) session.contributions = [];
  session.contributions.push({
    ...contribution,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  });
  await save(rows);
  return session;
}
