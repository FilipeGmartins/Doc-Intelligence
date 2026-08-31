import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { documentService } from '../../services/documentService'
import type { DocumentRecord } from '../../types/document'
import { UploadPage } from './UploadPage'

const uploadedDocument: DocumentRecord = {
  id: 'uploaded-payslip', originalFileName: 'contracheque_demo.pdf', suggestedFileName: '', mimeType: 'application/pdf', sizeInBytes: 12,
  documentType: 'Aguardando processamento', status: 'pending', confidence: null, extractedFields: [], createdAt: '2026-08-31T12:00:00.000Z',
  updatedAt: '2026-08-31T12:00:00.000Z', personId: 'person-carlos-santos', expectedCategory: 'payslip', events: [],
}

describe('UploadPage', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.restoreAllMocks()
  })

  it('permite selecionar cliente, requisitos e processar um tipo específico', async () => {
    vi.spyOn(documentService, 'uploadForPerson').mockResolvedValue({ created: [uploadedDocument], duplicates: [] })
    vi.spyOn(documentService, 'process').mockResolvedValue({ ...uploadedDocument, status: 'processed', documentType: 'Contracheque', confidence: 0.9 })
    render(<MemoryRouter><UploadPage /></MemoryRouter>)
    const user = userEvent.setup()

    await user.selectOptions(await screen.findByLabelText('Cliente do atendimento'), 'person-carlos-santos')
    expect(screen.getByText('3 selecionados')).toBeInTheDocument()

    const fileInputs = document.querySelectorAll<HTMLInputElement>('.slot-file-button input')
    fireEvent.change(fileInputs[2], { target: { files: [new File(['contracheque'], 'contracheque_demo.pdf', { type: 'application/pdf' })] } })
    await user.click(screen.getByRole('button', { name: 'Processar 1 arquivo' }))

    await waitFor(() => expect(screen.getByText('Processamento concluído')).toBeInTheDocument())
    expect(documentService.uploadForPerson).toHaveBeenCalledWith([expect.objectContaining({ personId: 'person-carlos-santos', expectedCategory: 'payslip' })])
  })
})
