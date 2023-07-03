import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import '@/fonts/JetBrainsMono-Light.ttf'
import '@/fonts/JetBrainsMono-Regular.ttf'
import '@/fonts/JetBrainsMono-Medium.ttf'
import '@/fonts/JetBrainsMono-ExtraBold.ttf'

import './App.css'

const mask = document.createElement('div')
mask.className = 'plugin_root'
mask.setAttribute('id', 'plugin-mask')  
document.body.appendChild(mask)

const root = ReactDOM.createRoot(mask)

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)