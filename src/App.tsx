import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
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
