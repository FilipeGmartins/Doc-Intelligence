import { Component, type ErrorInfo, type ReactNode } from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'

interface AppErrorBoundaryProps {
  children: ReactNode
}

interface AppErrorBoundaryState {
  hasError: boolean
}

export class AppErrorBoundary extends Component<AppErrorBoundaryProps, AppErrorBoundaryState> {
  state: AppErrorBoundaryState = { hasError: false }

  static getDerivedStateFromError(): AppErrorBoundaryState {
    return { hasError: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Falha não tratada na interface do DOC Intelligence.', error, info)
  }

  private reload = () => window.location.reload()

  render() {
    if (!this.state.hasError) return this.props.children

    return (
      <main className="app-error-page" role="alert">
        <div className="app-error-card">
          <span className="app-error-icon" aria-hidden="true"><AlertTriangle size={26} /></span>
          <p className="eyebrow">Falha inesperada</p>
          <h1>Não foi possível exibir esta tela</h1>
          <p>Seus dados simulados continuam salvos neste navegador. Recarregue a aplicação para tentar novamente.</p>
          <button className="primary-button primary-button--button" type="button" onClick={this.reload}>
            <RefreshCw size={17} /> Recarregar aplicação
          </button>
        </div>
      </main>
    )
  }
}
