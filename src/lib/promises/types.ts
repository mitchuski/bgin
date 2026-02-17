/**
 * Promise types for voluntary commitments. 05_COLLABORATIVE_WORKSPACE, 07_API_SPEC.
 */

export type PromiseType =
  | 'author'
  | 'review'
  | 'attend'
  | 'present'
  | 'research'
  | 'coordinate'
  | 'custom';

export type PromiseStatus = 'active' | 'in_progress' | 'completed' | 'withdrawn';

export interface PromiseRecord {
  id: string;
  participantId: string;
  workingGroup: string;
  type: PromiseType;
  description: string;
  relatedTopics: string[];
  status: PromiseStatus;
  dueDate?: string;
  createdAt: string;
  completedAt?: string;
  selfAssessmentNote?: string;
  signature: string;
}
