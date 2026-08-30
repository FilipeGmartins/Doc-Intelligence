const ACCEPTED_MIME_TYPES = new Set([
  'application/pdf',
  'image/jpeg',
  'image/png',
])

const ACCEPTED_EXTENSIONS = new Set(['pdf', 'jpg', 'jpeg', 'png'])

export const MAX_DOCUMENT_SIZE_IN_BYTES = 10 * 1024 * 1024

export interface FileValidationResult {
  valid: File[]
  rejected: Array<{ file: File; reason: string }>
}

export function validateDocumentFiles(files: File[]): FileValidationResult {
  return files.reduce<FileValidationResult>((result, file) => {
    const extension = file.name.split('.').pop()?.toLocaleLowerCase('pt-BR') ?? ''
    const acceptedType = ACCEPTED_MIME_TYPES.has(file.type) || ACCEPTED_EXTENSIONS.has(extension)

    if (!acceptedType) {
      result.rejected.push({ file, reason: 'Formato não suportado. Use PDF, JPG, JPEG ou PNG.' })
    } else if (file.size > MAX_DOCUMENT_SIZE_IN_BYTES) {
      result.rejected.push({ file, reason: 'O arquivo excede o limite de 10 MB.' })
    } else {
      result.valid.push(file)
    }

    return result
  }, { valid: [], rejected: [] })
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}
