export type DocumentStatus =
  | 'pending'
  | 'processing'
  | 'processed'
  | 'review_required'
  | 'failed'
  | 'approved'

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
}

export interface DocumentListFilters {
  query?: string
  status?: DocumentStatus
}

export interface UpdateDocumentInput {
  suggestedFileName?: string
  documentType?: string
  extractedFields?: ExtractedField[]
}

export interface AIProcessingResult {
  documentType: string
  suggestedFileName: string
  confidence: number
  extractedFields: ExtractedField[]
}
