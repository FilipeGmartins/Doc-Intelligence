import { AppRouter } from './router/AppRouter'
import { ThemeProvider } from './theme/ThemeProvider'

export default function App() {
  return <ThemeProvider><AppRouter /></ThemeProvider>
}
