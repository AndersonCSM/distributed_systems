import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Home from '@pages/Home'
import CreateRoom from '@pages/CreateRoom'
import JoinRoom from '@pages/JoinRoom'
import Game from '@pages/Game'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/create-room" element={<CreateRoom />} />
        <Route path="/join-room" element={<JoinRoom />} />
        <Route path="/game/:roomCode" element={<Game />} />
      </Routes>
    </Router>
  )
}

export default App
