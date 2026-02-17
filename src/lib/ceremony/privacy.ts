/**
 * Privacy preferences for Swordsman. 02_KEY_CEREMONY.md Step 3.
 */

export interface PrivacyPreferences {
  attributionLevel: 'full' | 'role_only' | 'anonymous';
  shareExpertiseDomain: boolean;
  shareOrganizationType: boolean;
  shareGeographicRegion: boolean;
  maxQueriesPerSession: number;
  allowEpisodicMemory: boolean;
  allowCrossWgDiscovery: boolean;
}

export const DEFAULT_PRIVACY: PrivacyPreferences = {
  attributionLevel: 'anonymous',
  shareExpertiseDomain: false,
  shareOrganizationType: false,
  shareGeographicRegion: false,
  maxQueriesPerSession: 16,
  allowEpisodicMemory: true,
  allowCrossWgDiscovery: false,
};
