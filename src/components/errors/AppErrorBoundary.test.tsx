import { render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { AppErrorBoundary } from './AppErrorBoundary'

function BrokenView(): never {
  throw new Error('Falha simulada')
}

describe('AppErrorBoundary', () => {
  afterEach(() => vi.restoreAllMocks())

  it('oferece uma recuperação quando um componente falha', () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined)
    render(<AppErrorBoundary><BrokenView /></AppErrorBoundary>)

    expect(screen.getByRole('alert')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Não foi possível exibir esta tela' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /recarregar aplicação/i })).toBeInTheDocument()
  })
})
