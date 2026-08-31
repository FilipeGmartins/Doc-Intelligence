import type { AIProcessingResult, DocumentCategory } from '../types/document'

export interface AIProcessor {
  process(fileName: string, expectedCategory?: DocumentCategory): Promise<AIProcessingResult>
}
