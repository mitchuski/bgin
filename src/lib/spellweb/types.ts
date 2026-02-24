/**
 * Spellweb types — nodes (glyphs) and edges (strands) for the Spellbook graph.
 * @see docs/CONVERGENCE_BONFIRES_BGINAI.md
 */

/** A glyph is a node in the Spellweb */
export type GlyphType =
  | 'spell'   // A cast entry (SpellbookEntry)
  | 'session' // A Block 14 session
  | 'topic'   // An extracted topic/concept
  | 'source'  // A referenced document
  | 'proverb' // RPP proverb (inscribed on cast or from Mage)
  | 'grimoire'; // A working group container

export interface Glyph {
  id: string;
  type: GlyphType;
  label: string;
  grimoire: string;
  arcaneResonance: number;
  firstScried: string;
  lastInvoked: string;
  metadata: {
    query?: string;
    sessionId?: string;
    documentTitle?: string;
    /** RPP proverb content when type is proverb */
    content?: string;
    castEntryId?: string;
    proverbId?: string;
  };
}

/** A strand is an edge in the Spellweb */
export type StrandType =
  | 'cast_to'   // Spell → Session
  | 'cross_wg'  // Spell → Spell (cross-WG reference)
  | 'cites'     // Spell → Source
  | 'co_occurs' // Topic → Topic
  | 'contains'  // Grimoire → Spell
  | 'thread';   // Repeated traversal path

export interface Strand {
  id: string;
  source: string;
  target: string;
  type: StrandType;
  threadStrength: number;
  firstWoven: string;
  lastTraversed: string;
}

export interface SpellwebGraph {
  glyphs: Glyph[];
  strands: Strand[];
}
