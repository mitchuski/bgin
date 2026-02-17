/**
 * Client-side MyTerms agreement chronicle. 00 Phase 1.4, 13_MYTERMS_AGREEMENT_LAYER.md
 */

import { localDB } from '@/lib/storage/local';

export interface AgreementRecord {
  id: string;
  agreementId: string;
  version: string;
  counterparty: string;
  signedAt: string;
  status: 'active' | 'expired' | 'revoked' | 'disputed';
  participantSignature: string;
  platformSignature: string;
  agreementHash: string;
}

export async function storeAgreement(record: AgreementRecord): Promise<void> {
  if (!localDB) throw new Error('IndexedDB not available');
  const row = { ...record, id: record.id || crypto.randomUUID() };
  await localDB.agreementChronicle.put(row);
}

export async function getActiveAgreements(): Promise<AgreementRecord[]> {
  if (!localDB) return [];
  return localDB.agreementChronicle.where('status').equals('active').toArray();
}
