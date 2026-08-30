import { describe, expect, it } from 'vitest'
import {
  getStatusFromConfidence,
  REVIEW_CONFIDENCE_THRESHOLD,
} from './confidence'

describe('getStatusFromConfidence', () => {
  it('encaminha confiança abaixo do limite para revisão', () => {
    expect(getStatusFromConfidence(0.68)).toBe('review_required')
  })

  it('considera o próprio limite como processado', () => {
    expect(getStatusFromConfidence(REVIEW_CONFIDENCE_THRESHOLD)).toBe(
      'processed',
    )
  })
})
