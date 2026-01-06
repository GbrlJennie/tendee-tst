import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx' // Pastikan ada .jsx
import './index.css'        // Import styling global

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)