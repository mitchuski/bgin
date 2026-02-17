/**
 * Document ingestion pipeline — chunk, embed, store in vector DB.
 * Run: npx ts-node --compiler-options '{"module":"CommonJS"}' scripts/ingest.ts
 * See block14_updates/03_MAGE_AGENTS.md and 09_MIGRATION.md
 */

async function main() {
  console.log('Ingest script stub. Implement: chunk documents, generate embeddings, upsert to Qdrant (or Bonfires).');
}

main().catch(console.error);
