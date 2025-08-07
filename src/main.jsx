import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { ChartingProvider } from './context/ChartingContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ChartingProvider>
      <App />
    </ChartingProvider>
  </StrictMode>,
)
