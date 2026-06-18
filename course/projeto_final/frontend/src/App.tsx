import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Login from './pages/Login'
import Feed from './pages/Feed'
import CadastrarItem from './pages/CadastrarItem'
import Navbar from './components/Navbar'

function ProtectedRoute({ children }: { children: JSX.Element }) {
  const { isAuthenticated } = useAuth()
  return isAuthenticated ? children : <Navigate to="/" replace />
}

function AppRoutes() {
  const { isAuthenticated } = useAuth()

  return (
    <div className="app-shell">
      <Routes>
        <Route path="/" element={isAuthenticated ? <Navigate to="/feed" replace /> : <Login />} />
        <Route path="/feed" element={<ProtectedRoute><Feed /></ProtectedRoute>} />
        <Route path="/cadastrar" element={<ProtectedRoute><CadastrarItem /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      {isAuthenticated && <Navbar />}
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  )
}
