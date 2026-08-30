import type { DocumentStatus } from '../types/document'

export const REVIEW_CONFIDENCE_THRESHOLD = 0.8

export function getStatusFromConfidence(
  confidence: number,
): Extract<DocumentStatus, 'processed' | 'review_required'> {
  return confidence >= REVIEW_CONFIDENCE_THRESHOLD
    ? 'processed'
    : 'review_required'
}
