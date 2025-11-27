import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './app/App'
import { useAppStore } from './store'
import './index.css'

// Initialize store with seed data
useAppStore.getState().initializeStore()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
)

