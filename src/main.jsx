import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import InlandApp from './InlandApp.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <InlandApp />
  </StrictMode>,
)
