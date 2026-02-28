/**
 * Load and validate knowledge-graph Spellweb data from /public/spellweb/.
 * Imported from agentprivacy_master.
 */

import type { SpellwebKGNode, SpellwebKGEdge } from './kg-types';

const NODES_URL = '/spellweb/nodes.json';
const EDGES_URL = '/spellweb/edges.json';

export interface SpellwebKGData {
  nodes: SpellwebKGNode[];
  edges: SpellwebKGEdge[];
}

function isSpellwebKGNode(raw: unknown): raw is SpellwebKGNode {
  if (!raw || typeof raw !== 'object') return false;
  const o = raw as Record<string, unknown>;
  return (
    typeof o.id === 'string' &&
    typeof o.label === 'string' &&
    typeof o.type === 'string' &&
    typeof o.guild === 'string' &&
    typeof o.protocolFamily === 'string' &&
    typeof o.privacyDelegationPosition === 'number' &&
    typeof o.dimensionalScale === 'number' &&
    typeof o.complexity === 'number' &&
    typeof o.maturity === 'string' &&
    Array.isArray(o.inscriptions) &&
    typeof o.summary === 'string' &&
    Array.isArray(o.standards) &&
    o.dimensions != null &&
    typeof o.dimensions === 'object'
  );
}

function isSpellwebKGEdge(raw: unknown): raw is SpellwebKGEdge {
  if (!raw || typeof raw !== 'object') return false;
  const o = raw as Record<string, unknown>;
  return (
    typeof o.source === 'string' &&
    typeof o.target === 'string' &&
    typeof o.type === 'string' &&
    typeof o.strength === 'number'
  );
}

export async function loadSpellwebKG(): Promise<SpellwebKGData> {
  const [nodesRes, edgesRes] = await Promise.all([
    fetch(NODES_URL),
    fetch(EDGES_URL),
  ]);

  if (!nodesRes.ok) throw new Error(`Failed to load nodes: ${nodesRes.status}`);
  if (!edgesRes.ok) throw new Error(`Failed to load edges: ${edgesRes.status}`);

  const nodesRaw: unknown = await nodesRes.json();
  const edgesRaw: unknown = await edgesRes.json();

  if (!Array.isArray(nodesRaw)) throw new Error('nodes.json must be an array');
  if (!Array.isArray(edgesRaw)) throw new Error('edges.json must be an array');

  const nodes = nodesRaw.filter(isSpellwebKGNode) as SpellwebKGNode[];
  const edges = edgesRaw.filter(isSpellwebKGEdge) as SpellwebKGEdge[];

  if (nodes.length !== nodesRaw.length) throw new Error('Some node entries failed validation');
  if (edges.length !== edgesRaw.length) throw new Error('Some edge entries failed validation');

  return { nodes, edges };
}
