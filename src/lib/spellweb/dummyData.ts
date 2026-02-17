/**
 * Dummy spellbook entries for the Spellweb page when no API data is available.
 * Ensures the graph always has something to render (grimoires, sessions, spells, sources, cross-WG refs).
 * Remove or replace with real data once /api/spellbook/entries and Bonfires integration are in place.
 */

import type { SpellbookEntryInput } from './builder';

const now = new Date().toISOString();

export function getSpellwebDummyEntries(): SpellbookEntryInput[] {
  return [
    {
      id: 'demo-ikp-1',
      sessionId: 'ikp-accountable-wallet',
      sessionTitle: 'IKP: Accountable Wallet',
      workingGroup: 'ikp',
      mageQuery: 'What are the key design goals for accountable wallets?',
      mageResponse: 'Accountable wallets balance privacy with auditability…',
      addedAt: now,
      sources: [
        { documentTitle: 'BGIN Accountable Wallet Spec', documentDate: '2025-01' },
        { documentTitle: 'Privacy and Compliance in Key Management', documentDate: '2025-02' },
      ],
      crossWgRefs: [{ workingGroup: 'governance', topic: 'Regulatory compliance' }],
    },
    {
      id: 'demo-fase-1',
      sessionId: 'fase-harmonization',
      sessionTitle: 'FASE: Harmonization among Crypto-asset, stablecoin and tokenized deposit',
      workingGroup: 'fase',
      mageQuery: 'How do stablecoins and tokenized deposits relate?',
      mageResponse: 'Harmonization frameworks aim to align treatment…',
      addedAt: now,
      sources: [{ documentTitle: 'FASE Harmonization Report', documentDate: '2025-03' }],
      crossWgRefs: [
        { workingGroup: 'ikp', topic: 'Key management' },
        { workingGroup: 'governance', topic: 'Policy alignment' },
      ],
    },
    {
      id: 'demo-cyber-1',
      sessionId: 'security-cyber-info-1',
      sessionTitle: 'Security: Cyber Security Information Sharing (1)',
      workingGroup: 'cyber',
      mageQuery: 'What information-sharing models work for security?',
      mageResponse: 'Structured sharing with clear boundaries…',
      addedAt: now,
      sources: [
        { documentTitle: 'Cyber Information Sharing Guidelines', documentDate: '2025-01' },
      ],
      crossWgRefs: [{ workingGroup: 'ikp', topic: 'Identity and attestation' }],
    },
    {
      id: 'demo-gov-1',
      sessionId: 'opening-plenary',
      sessionTitle: 'Opening Plenary',
      workingGroup: 'governance',
      mageQuery: 'What are the main governance themes for Block 14?',
      mageResponse: 'Three graphs, one identity; voluntary commitments…',
      addedAt: now,
      sources: [],
      crossWgRefs: [
        { workingGroup: 'ikp', topic: 'Identity' },
        { workingGroup: 'fase', topic: 'Stablecoins' },
      ],
    },
    {
      id: 'demo-ikp-2',
      sessionId: 'ikp-proof-of-personhood',
      sessionTitle: 'IKP: Proof of Personhood',
      workingGroup: 'ikp',
      mageQuery: 'How does proof of personhood integrate with wallets?',
      mageResponse: 'Personhood attestations can bind to key material…',
      addedAt: now,
      sources: [{ documentTitle: 'Proof of Personhood Overview', documentDate: '2025-02' }],
      crossWgRefs: [{ workingGroup: 'cyber', topic: 'Security targets' }],
    },
  ];
}
