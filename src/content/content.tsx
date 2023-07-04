window.addEventListener('message', (event) => {
  if (event.source != window) return
  if (
    event.data.type &&
    event.data.type === 'ZKPASS_EXTENSION' &&
    (event.origin.includes('localhost') || event.origin.includes('zkpass.org'))
  ) {
    console.log(event)
    chrome.runtime.sendMessage(event.data.doc)
  }
})
