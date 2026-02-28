/**
 * Spellbook entry input type for graph builders.
 * @see docs/CONVERGENCE_BONFIRES_BGINAI.md
 */

/** Shape of spellbook entry from API / spellbook page (minimal for builder). */
export interface SpellbookEntryInput {
  id: string;
  sessionId: string;
  sessionTitle: string;
  workingGroup: string;
  mageQuery: string;
  mageResponse?: string;
  sources?: Array<{ documentTitle: string; documentDate?: string; relevanceScore?: number }>;
  crossWgRefs?: Array<{ workingGroup: string; topic: string; hint?: string }>;
  addedAt: string;
}
