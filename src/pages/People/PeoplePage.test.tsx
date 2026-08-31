import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'
import { PeoplePage } from './PeoplePage'

describe('PeoplePage', () => {
  beforeEach(() => localStorage.clear())

  it('edita a pessoa e simula documentos exigidos e recebidos', async () => {
    render(<PeoplePage />)
    const user = userEvent.setup()

    await user.click(await screen.findByRole('button', { name: 'Editar cadastro de Roberto Alves Nascimento' }))
    const cpfInput = screen.getByLabelText(/CPF/)
    await user.clear(cpfInput)
    await user.type(cpfInput, 'abc1234567890999')
    expect(cpfInput).toHaveValue('12345678909')
    const requiredCheck = screen.getByRole('checkbox', { name: 'Exigir Cheque' })
    const receivedCheck = screen.getByRole('checkbox', { name: 'Marcar Cheque como recebido' })

    expect(requiredCheck).not.toBeChecked()
    expect(receivedCheck).not.toBeChecked()
    await user.click(requiredCheck)
    await user.click(screen.getByRole('button', { name: 'Salvar alterações' }))

    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
    expect(await screen.findByText('Faltam: Cheque')).toBeInTheDocument()
  })
})
