import { describe, expect, it } from 'vitest'
import { isCompleteCpf, isValidRg, sanitizeCpf, sanitizeRg } from './personalIdentifiers'

describe('personalIdentifiers', () => {
  it('mantém somente os primeiros 11 dígitos do CPF', () => {
    expect(sanitizeCpf('abc123.456.789-01xyz99')).toBe('12345678901')
    expect(isCompleteCpf('12345678901')).toBe(true)
    expect(isCompleteCpf('1234567890')).toBe(false)
  })

  it('limita o RG a 9 caracteres alfanuméricos e preserva o X', () => {
    expect(sanitizeRg('12.345.678-x99')).toBe('12345678X')
    expect(isValidRg('12345678X')).toBe(true)
    expect(isValidRg('1234567890')).toBe(false)
  })
})
