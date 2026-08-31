import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
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
    cleanup()
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

  it('cria um cliente manual e mantém o fluxo de envio na mesma tela', async () => {
    render(<MemoryRouter><UploadPage /></MemoryRouter>)
    const user = userEvent.setup()

    await user.click(screen.getByRole('button', { name: 'Novo cliente' }))
    await user.type(screen.getByLabelText('Nome completo'), 'Cliente Demonstração')
    await user.type(screen.getByLabelText('CPF ou identificação fictícia'), 'CPF •••.888.•••-88')
    await user.type(screen.getByLabelText('E-mail'), 'cliente.novo@exemplo.test')
    await user.click(screen.getByRole('button', { name: 'Criar e selecionar' }))

    expect(await screen.findByText('Cliente Demonstração foi criado e selecionado para este envio.')).toBeInTheDocument()
    expect((screen.getByLabelText('Cliente do atendimento') as HTMLSelectElement).value).toMatch(/^person-manual-/)
    expect(screen.getByText('2 selecionados')).toBeInTheDocument()
  })
})
