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
