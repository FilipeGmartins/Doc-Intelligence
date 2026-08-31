import { AppRouter } from './router/AppRouter'
import { ThemeProvider } from './theme/ThemeProvider'
import { AppErrorBoundary } from './components/errors/AppErrorBoundary'

export default function App() {
  return <AppErrorBoundary><ThemeProvider><AppRouter /></ThemeProvider></AppErrorBoundary>
}
