import { createRoot } from 'react-dom/client'
import './styles/index.css'
import App from './App.tsx'

// Import Key Vault Tester untuk development debugging
import './utils/keyVaultTester';

const rootElement = document.getElementById('root')
if (!rootElement) throw new Error('Root element not found')

createRoot(rootElement).render(<App />)
