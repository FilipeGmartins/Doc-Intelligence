export const CPF_LENGTH = 11
export const RG_MAX_LENGTH = 9

export function sanitizeCpf(value: string): string {
  return value.replace(/\D/g, '').slice(0, CPF_LENGTH)
}

export function sanitizeRg(value: string): string {
  return value.replace(/[^0-9a-z]/gi, '').toUpperCase().slice(0, RG_MAX_LENGTH)
}

export function isCompleteCpf(value: string): boolean {
  return new RegExp(`^\\d{${CPF_LENGTH}}$`).test(value)
}

export function isValidCpf(value: string): boolean {
  if (!isCompleteCpf(value) || /^(\d)\1{10}$/.test(value)) return false
  const digits = [...value].map(Number)
  const calculateDigit = (length: number) => {
    const sum = digits.slice(0, length).reduce((total, digit, index) => total + digit * (length + 1 - index), 0)
    const remainder = (sum * 10) % 11
    return remainder === 10 ? 0 : remainder
  }
  return calculateDigit(9) === digits[9] && calculateDigit(10) === digits[10]
}

export function cpfValidationMessage(value: string): string | null {
  if (!isCompleteCpf(value)) return 'CPF deve conter exatamente 11 números.'
  return isValidCpf(value) ? null : 'CPF inválido. Confira os números informados.'
}

export function formatCpf(value: string): string {
  const digits = sanitizeCpf(value)
  if (digits.length !== CPF_LENGTH) return digits
  return digits.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
}

export function isValidRg(value: string): boolean {
  return value.length > 0 && value.length <= RG_MAX_LENGTH && /^[0-9A-Z]+$/.test(value)
}

export function isCpfField(key: string, label = ''): boolean {
  return key.toLocaleLowerCase('pt-BR') === 'cpf' || label.trim().toLocaleLowerCase('pt-BR') === 'cpf'
}

export function isRgField(key: string, label = ''): boolean {
  const normalizedKey = key.toLocaleLowerCase('pt-BR')
  const normalizedLabel = label.trim().toLocaleLowerCase('pt-BR')
  return normalizedKey === 'rg' || normalizedKey === 'documentnumber' || normalizedLabel === 'rg'
}
