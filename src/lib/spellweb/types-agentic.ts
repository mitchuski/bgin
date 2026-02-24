/**
 * Agentic Spellweb types — aligned with agentprivacy_master SpellWeb.
 * Mapped to BGIN AI: grimoire = WG, spell = Spellbook entry (cast), session = Block14 session,
 * proverb = RPP proverb (inscribed on cast or from Mage).
 */

export type SpellwebNodeType =
  | 'grimoire'  // Working group hub (IKP, FASE, Cyber, Governance)
  | 'spell'     // Spellbook entry (cast from Mage)
  | 'session'   // Block 14 session hub
  | 'proverb'   // RPP proverb (linked to cast or Mage)
  | 'topic'     // Cross-WG topic reference
  | 'source';   // Referenced document

export type SpellwebLinkType =
  | 'grimoire'      // WG hub → spell (contains)
  | 'cluster'       // Session hub → spell (cast to session)
  | 'sequence'       // spell → spell (casting order in session)
  | 'constellation'; // spell → topic (cross-WG) or spell → proverb

export interface SpellwebNode {
  id: string;
  type: SpellwebNodeType;
  /** Emoji for canvas rendering */
  emoji: string;
  label: string;
  fullTitle: string;
  /** Optional short name (e.g. Roman numeral) */
  name?: string;
  /** Node size */
  val: number;
  color: string;
  group: string;
  /** Journey / path highlighting */
  isLit?: boolean;
  isOnPath?: boolean;
  sequenceNumber?: number;
  /** BGIN: working group id */
  grimoire: string;
  /** For GlyphInspector: original spellbook/proverb/session id */
  metadata?: {
    sessionId?: string;
    query?: string;
    documentTitle?: string;
    castEntryId?: string;
    proverbId?: string;
    content?: string;
    firstScried?: string;
    lastInvoked?: string;
  };
}

export interface SpellwebLink {
  source: string;
  target: string;
  type: SpellwebLinkType;
  /** Optional strength for line styling */
  weight?: number;
}

export interface SpellwebData {
  nodes: SpellwebNode[];
  links: SpellwebLink[];
}
