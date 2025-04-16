import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Statistics from './pages/Statistics'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Statistics />} />
      </Routes>
    </Router>
  )
}

export default App
