import type { AIProcessingResult, ExtractedField } from '../types/document'

const FAILURE_MESSAGE = 'Não foi possível processar este documento.'

function wait(milliseconds: number): Promise<void> {
  return new Promise((resolve) => window.setTimeout(resolve, milliseconds))
}

function hashFileName(fileName: string): number {
  return [...fileName].reduce((total, character) => total + character.charCodeAt(0), 0)
}

function field(id: string, key: string, label: string, value: string, confidence: number): ExtractedField {
  return { id, key, label, value, confidence, manuallyEdited: false }
}

export class MockAIService {
  private readonly minimumDelay: number
  private readonly maximumDelay: number

  constructor(
    minimumDelay = 1_000,
    maximumDelay = 4_000,
  ) {
    this.minimumDelay = minimumDelay
    this.maximumDelay = maximumDelay
  }

  async process(fileName: string): Promise<AIProcessingResult> {
    const range = Math.max(0, this.maximumDelay - this.minimumDelay)
    await wait(this.minimumDelay + (range ? hashFileName(fileName) % (range + 1) : 0))

    const normalized = fileName.toLocaleLowerCase('pt-BR')
    if (normalized.includes('falha') || normalized.includes('erro')) {
      throw new Error(FAILURE_MESSAGE)
    }

    if (normalized.includes('revisao') || normalized.includes('baixa_confianca')) {
      return {
        documentType: 'Documento de Identidade',
        suggestedFileName: 'IDENTIDADE_JOAO_HENRIQUE_SILVA.pdf',
        confidence: 0.68,
        extractedFields: [
          field('name', 'name', 'Nome', 'João Henrique Silva', 0.96),
          field('cpf', 'cpf', 'CPF', '000.111.222-33', 0.61),
          field('birthDate', 'birthDate', 'Data de nascimento', '15/04/1994', 0.78),
        ],
      }
    }

    return {
      documentType: 'Comprovante de residência',
      suggestedFileName: 'COMPROVANTE_RESIDENCIA_MARIA_FERREIRA.pdf',
      confidence: 0.94,
      extractedFields: [
        field('name', 'name', 'Nome', 'Maria Ferreira', 0.97),
        field('address', 'address', 'Endereço', 'Rua das Palmeiras, 120', 0.92),
        field('city', 'city', 'Cidade', 'Mossoró', 0.95),
        field('state', 'state', 'Estado', 'RN', 0.98),
      ],
    }
  }
}
