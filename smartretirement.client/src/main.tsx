import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './app/App.tsx'
import { AppErrorBoundary } from './app/AppErrorBoundary.tsx'
import { AppProviders } from './app/AppProviders.tsx'

const rootElement = document.getElementById('root')

if (rootElement === null) {
  throw new Error('The root element was not found.')
}

createRoot(rootElement).render(
  <StrictMode>
    <AppErrorBoundary>
      <AppProviders>
        <App />
      </AppProviders>
    </AppErrorBoundary>
  </StrictMode>,
)
