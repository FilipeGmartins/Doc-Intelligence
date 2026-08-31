export type DocumentStatus =
  | 'pending'
  | 'processing'
  | 'processed'
  | 'review_required'
  | 'failed'
  | 'approved'

export type DocumentCategory =
  | 'identity'
  | 'proof_of_residence'
  | 'payslip'
  | 'bank_check'
  | 'work_card'
  | 'contract'
  | 'medical_report'
  | 'power_of_attorney'
  | 'other'

export type DocumentEventType =
  | 'uploaded'
  | 'processing_started'
  | 'processed'
  | 'review_required'
  | 'failed'
  | 'manually_edited'
  | 'approved'

export interface DocumentEvent {
  id: string
  type: DocumentEventType
  description: string
  actor: string
  createdAt: string
}

export interface ExtractedField {
  id: string
  key: string
  label: string
  value: string
  confidence: number
  manuallyEdited: boolean
}

export interface DocumentRecord {
  id: string
  originalFileName: string
  suggestedFileName: string
  mimeType: string
  sizeInBytes: number
  documentType: string
  status: DocumentStatus
  confidence: number | null
  extractedFields: ExtractedField[]
  createdAt: string
  updatedAt: string
  approvedAt?: string
  processingError?: string
  previewUrl?: string
  personId?: string
  expectedCategory?: DocumentCategory
  fingerprint?: string
  events: DocumentEvent[]
}

export interface DocumentListFilters {
  query?: string
  status?: DocumentStatus
}

export interface UpdateDocumentInput {
  suggestedFileName?: string
  documentType?: string
  extractedFields?: ExtractedField[]
  personId?: string
  expectedCategory?: DocumentCategory
}

export interface AIProcessingResult {
  documentType: string
  suggestedFileName: string
  confidence: number
  extractedFields: ExtractedField[]
}

export interface DocumentUploadInput {
  file: File
  personId?: string
  expectedCategory?: DocumentCategory
}

export interface DuplicateDocument {
  fileName: string
  existingDocumentId: string
}

export interface DocumentUploadResult {
  created: DocumentRecord[]
  duplicates: DuplicateDocument[]
}

export const DOCUMENT_CATEGORY_OPTIONS: Array<{ value: DocumentCategory; label: string; description: string }> = [
  { value: 'identity', label: 'Documento de identidade', description: 'RG, CNH ou documento equivalente' },
  { value: 'proof_of_residence', label: 'Comprovante de residência', description: 'Conta ou correspondência recente' },
  { value: 'payslip', label: 'Contracheque', description: 'Comprovante de renda mensal' },
  { value: 'bank_check', label: 'Cheque', description: 'Cheque bancário recebido do cliente' },
  { value: 'work_card', label: 'Carteira de trabalho', description: 'Carteira física ou digital' },
  { value: 'contract', label: 'Contrato', description: 'Contrato assinado pelas partes' },
  { value: 'medical_report', label: 'Laudo', description: 'Laudo ou relatório técnico' },
  { value: 'power_of_attorney', label: 'Procuração', description: 'Instrumento de representação' },
  { value: 'other', label: 'Outro documento', description: 'Arquivo adicional do cliente' },
]
