'use client';
/** 00 Phase 2.3 — Privacy preferences form. 02_KEY_CEREMONY Step 3. */

import type { PrivacyPreferences } from '@/lib/ceremony/privacy';

export default function PrivacyConfig({
  value,
  onChange,
}: {
  value: PrivacyPreferences;
  onChange: (p: PrivacyPreferences) => void;
}) {
  const p = value;

  return (
    <div className="rounded-lg border border-[var(--border)] p-6 bg-[var(--bg-secondary)] space-y-6">
      <h3 className="font-medium text-lg">Your Swordsman&apos;s boundaries</h3>

      <fieldset>
        <legend className="text-sm font-medium text-[var(--text-secondary)] mb-2">
          How should you be identified in collaborative contexts? (Chatham House)
        </legend>
        <div className="space-y-2">
          {(['full', 'role_only', 'anonymous'] as const).map((level) => (
            <label key={level} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="attribution"
                checked={p.attributionLevel === level}
                onChange={() => onChange({ ...p, attributionLevel: level })}
                className="rounded-full border-[var(--border)]"
              />
              <span className="capitalize">
                {level === 'role_only' ? 'Role only (e.g. regulatory participant)' : level === 'full' ? 'Full attribution' : 'Anonymous'}
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className="text-sm font-medium text-[var(--text-secondary)] mb-2">
          What can the Mages know about you?
        </legend>
        <div className="space-y-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={p.shareExpertiseDomain}
              onChange={(e) => onChange({ ...p, shareExpertiseDomain: e.target.checked })}
              className="rounded border-[var(--border)]"
            />
            <span>My expertise domain</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={p.shareOrganizationType}
              onChange={(e) => onChange({ ...p, shareOrganizationType: e.target.checked })}
              className="rounded border-[var(--border)]"
            />
            <span>My organization type</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={p.shareGeographicRegion}
              onChange={(e) => onChange({ ...p, shareGeographicRegion: e.target.checked })}
              className="rounded border-[var(--border)]"
            />
            <span>My geographic region</span>
          </label>
        </div>
      </fieldset>

      <div>
        <label className="text-sm font-medium text-[var(--text-secondary)] block mb-2">
          Queries per session (privacy budget)
        </label>
        <select
          value={p.maxQueriesPerSession}
          onChange={(e) => onChange({ ...p, maxQueriesPerSession: Number(e.target.value) })}
          className="w-full rounded border border-[var(--border)] bg-[var(--bg-tertiary)] px-3 py-2 text-[var(--text-primary)]"
        >
          {[8, 12, 16, 20, 24].map((n) => (
            <option key={n} value={n}>{n}</option>
          ))}
        </select>
        <p className="text-xs text-[var(--text-muted)] mt-1">Higher = more context, more budget used.</p>
      </div>

      <div className="space-y-2">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={p.allowEpisodicMemory}
            onChange={(e) => onChange({ ...p, allowEpisodicMemory: e.target.checked })}
            className="rounded border-[var(--border)]"
          />
          <span>Allow Mages to remember our past conversations</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={p.allowCrossWgDiscovery}
            onChange={(e) => onChange({ ...p, allowCrossWgDiscovery: e.target.checked })}
            className="rounded border-[var(--border)]"
          />
          <span>Allow cross-WG discovery (Mages can reference my activity in other WGs)</span>
        </label>
      </div>
    </div>
  );
}
