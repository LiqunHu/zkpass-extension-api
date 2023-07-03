import { BrowserRouter } from 'react-router-dom'
import RenderRouter from './routers'

function App() {
  return (
    <BrowserRouter>
      <RenderRouter />
    </BrowserRouter>
  )
}

export default App