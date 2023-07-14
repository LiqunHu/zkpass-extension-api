import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import '@/fonts/JetBrainsMono-Light.ttf'
import '@/fonts/JetBrainsMono-Regular.ttf'
import '@/fonts/JetBrainsMono-Medium.ttf'
import '@/fonts/JetBrainsMono-ExtraBold.ttf'
;(async () => {
  window.addEventListener('message', (event) => {
    if (event.source != window) return
    if (event.data.type && event.data.type === 'ZKPASS_EXTENSION') {
      console.log(event)
      chrome.runtime.sendMessage(event.data.doc)
    }
  })

  const result = await chrome.runtime.sendMessage({
    method: 'CHECKPOP'
  })
  if (result) {
    const mask = document.createElement('div')
    // mask.className = 'plugin_root'
    mask.setAttribute('id', 'plugin-mask')
    // document.body.insertBefore(mask, document.body.firstChild)
    document.body.appendChild(mask)

    const root = ReactDOM.createRoot(mask)

    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    )
  }
})()
