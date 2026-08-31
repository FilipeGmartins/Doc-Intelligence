import type { AIProcessingResult, DocumentCategory, ExtractedField } from '../types/document'
import type { AIProcessor } from './AIProcessor'

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

function inferCategory(fileName: string): DocumentCategory {
  const normalized = fileName.toLocaleLowerCase('pt-BR')
  if (normalized.includes('contracheque') || normalized.includes('holerite')) return 'payslip'
  if (normalized.includes('cheque')) return 'bank_check'
  if (normalized.includes('carteira') || normalized.includes('ctps')) return 'work_card'
  if (normalized.includes('contrato')) return 'contract'
  if (normalized.includes('identidade') || normalized.includes('cnh') || normalized.includes('rg')) return 'identity'
  if (normalized.includes('laudo')) return 'medical_report'
  if (normalized.includes('procuracao') || normalized.includes('procuração')) return 'power_of_attorney'
  return 'proof_of_residence'
}

function createTemplate(category: DocumentCategory): AIProcessingResult {
  const templates: Partial<Record<DocumentCategory, AIProcessingResult>> = {
    identity: {
      documentType: 'Documento de Identidade', suggestedFileName: 'IDENTIDADE_JOAO_HENRIQUE_SILVA.pdf', confidence: 0.91,
      extractedFields: [
        field('name', 'name', 'Nome', 'João Henrique Silva', 0.96), field('affiliation', 'affiliation', 'Filiação', 'Maria Silva e Carlos Silva', 0.88),
        field('birthDate', 'birthDate', 'Data de nascimento', '15/04/1994', 0.93), field('rg', 'rg', 'RG', '000000000', 0.89),
        field('issuingAuthority', 'issuingAuthority', 'Órgão emissor', 'SSP/RN', 0.92), field('cpf', 'cpf', 'CPF', '86288366757', 0.90),
      ],
    },
    proof_of_residence: {
      documentType: 'Comprovante de residência', suggestedFileName: 'COMPROVANTE_RESIDENCIA_MARIA_FERREIRA.pdf', confidence: 0.94,
      extractedFields: [
        field('name', 'name', 'Nome', 'Maria Ferreira', 0.97), field('address', 'address', 'Endereço', 'Rua das Palmeiras, 120', 0.92),
        field('city', 'city', 'Cidade', 'Mossoró', 0.95), field('state', 'state', 'Estado', 'RN', 0.98), field('issueDate', 'issueDate', 'Data de emissão', '20/08/2026', 0.91),
      ],
    },
    payslip: {
      documentType: 'Contracheque', suggestedFileName: 'CONTRACHEQUE_CARLOS_SANTOS_2026-08.pdf', confidence: 0.90,
      extractedFields: [
        field('employeeName', 'employeeName', 'Funcionário', 'Carlos Eduardo Santos', 0.96), field('employer', 'employer', 'Empregador', 'Empresa Demonstração Ltda.', 0.91),
        field('referenceMonth', 'referenceMonth', 'Competência', '08/2026', 0.94), field('grossAmount', 'grossAmount', 'Valor bruto', 'R$ 4.850,00', 0.87),
        field('netAmount', 'netAmount', 'Valor líquido', 'R$ 3.912,40', 0.84),
      ],
    },
    bank_check: {
      documentType: 'Cheque', suggestedFileName: 'CHEQUE_CLIENTE_2026-08.pdf', confidence: 0.88,
      extractedFields: [
        field('holder', 'holder', 'Emitente', 'Pessoa Fictícia', 0.91), field('bank', 'bank', 'Banco', 'Banco Demonstração', 0.89),
        field('checkNumber', 'checkNumber', 'Número do cheque', '000001', 0.86), field('amount', 'amount', 'Valor', 'R$ 1.250,00', 0.84),
        field('issueDate', 'issueDate', 'Data', '31/08/2026', 0.90),
      ],
    },
    work_card: {
      documentType: 'Carteira de Trabalho', suggestedFileName: 'CARTEIRA_TRABALHO_ROBERTO_ALVES.pdf', confidence: 0.89,
      extractedFields: [
        field('name', 'name', 'Nome', 'Roberto Alves Nascimento', 0.95), field('pis', 'pis', 'PIS/PASEP', '000.00000.00-0', 0.86),
        field('ctpsNumber', 'ctpsNumber', 'Número da CTPS', '0000000', 0.90), field('series', 'series', 'Série', '000/RN', 0.88),
        field('birthDate', 'birthDate', 'Data de nascimento', '21/11/1988', 0.92),
      ],
    },
    contract: {
      documentType: 'Contrato', suggestedFileName: 'CONTRATO_PRESTACAO_SERVICOS_MARIANA_COSTA.pdf', confidence: 0.87,
      extractedFields: [
        field('contractor', 'contractor', 'Contratante', 'Mariana Ferreira Costa', 0.92), field('contracted', 'contracted', 'Contratada', 'Serviços Fictícios Ltda.', 0.90),
        field('subject', 'subject', 'Objeto', 'Prestação de serviços administrativos', 0.83), field('signatureDate', 'signatureDate', 'Data de assinatura', '10/08/2026', 0.88),
        field('term', 'term', 'Vigência', '12 meses', 0.81),
      ],
    },
  }

  return templates[category] ?? {
    documentType: category === 'medical_report' ? 'Laudo' : category === 'power_of_attorney' ? 'Procuração' : 'Outro documento',
    suggestedFileName: 'DOCUMENTO_ADICIONAL_CLIENTE.pdf', confidence: 0.86,
    extractedFields: [
      field('holder', 'holder', 'Titular', 'Pessoa Fictícia', 0.91), field('issueDate', 'issueDate', 'Data de emissão', '18/08/2026', 0.84),
      field('summary', 'summary', 'Descrição', 'Conteúdo demonstrativo para conferência', 0.82),
    ],
  }
}

export class MockAIService implements AIProcessor {
  private readonly minimumDelay: number
  private readonly maximumDelay: number

  constructor(minimumDelay = 1_000, maximumDelay = 4_000) {
    this.minimumDelay = minimumDelay
    this.maximumDelay = maximumDelay
  }

  async process(fileName: string, expectedCategory?: DocumentCategory): Promise<AIProcessingResult> {
    const range = Math.max(0, this.maximumDelay - this.minimumDelay)
    await wait(this.minimumDelay + (range ? hashFileName(fileName) % (range + 1) : 0))

    const normalized = fileName.toLocaleLowerCase('pt-BR')
    if (normalized.includes('falha') || normalized.includes('erro')) throw new Error(FAILURE_MESSAGE)

    const result = createTemplate(expectedCategory ?? inferCategory(fileName))
    if (!normalized.includes('revisao') && !normalized.includes('baixa_confianca')) return result

    return {
      ...result,
      confidence: 0.68,
      extractedFields: result.extractedFields.map((item, index) => index === 1 || index === result.extractedFields.length - 1 ? { ...item, confidence: 0.61 } : item),
    }
  }
}
