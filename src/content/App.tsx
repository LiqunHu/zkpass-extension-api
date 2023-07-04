import { useEffect } from 'react'
import Home from './views/Home'

function getComponent() {
  const checkBrowser = () => {
    const is_chrome = window.navigator.userAgent.match('Chrome') ? true : false

    if (!is_chrome) {
      alert('please install Chrome')
    }
  }

  useEffect(() => {
    checkBrowser()
  }, [])

  return (
    <>
      <Home />
    </>
  )
}

function App() {
  return <>{getComponent()}</>
}

export default App
