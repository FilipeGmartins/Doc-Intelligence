import { describe, expect, it } from 'vitest'
import { MAX_DOCUMENT_SIZE_IN_BYTES, validateDocumentFiles } from './documentFiles'

describe('validateDocumentFiles', () => {
  it('aceita os formatos documentais previstos', () => {
    const files = [
      new File(['pdf'], 'documento.pdf', { type: 'application/pdf' }),
      new File(['imagem'], 'documento.jpeg', { type: 'image/jpeg' }),
      new File(['imagem'], 'documento.png', { type: 'image/png' }),
    ]

    expect(validateDocumentFiles(files).valid).toHaveLength(3)
  })

  it('rejeita formato não suportado', () => {
    const result = validateDocumentFiles([
      new File(['planilha'], 'dados.xlsx', { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }),
    ])

    expect(result.rejected[0]?.reason).toContain('Formato não suportado')
  })

  it('rejeita arquivo maior que 10 MB', () => {
    const file = new File([new Uint8Array(MAX_DOCUMENT_SIZE_IN_BYTES + 1)], 'grande.pdf', { type: 'application/pdf' })
    expect(validateDocumentFiles([file]).rejected[0]?.reason).toContain('10 MB')
  })
})
