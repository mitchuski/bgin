'use client';

import CeremonyWizard from '@/components/ceremony/CeremonyWizard';

export default function CeremonyPage() {
  return (
    <main className="min-h-screen p-8">
      <CeremonyWizard returnTo="/" />
    </main>
  );
}
