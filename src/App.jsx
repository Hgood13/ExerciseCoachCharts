import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { supabase } from './services/supabase.js'
import LoginPage from './pages/LoginPage.jsx'
import ClientsPage from './pages/ClientsPage.jsx'
import ClientPage from './pages/ClientPage.jsx'
import AddClientPage from './pages/AddClientPage.jsx'

function ProtectedRoute({ session, children }) {
  if (session === undefined) return null // still loading
  if (!session) return <Navigate to="/" replace />
  return children
}

export default function App() {
  const [session, setSession] = useState(undefined)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session ?? null))
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session ?? null)
    })
    return () => listener.subscription.unsubscribe()
  }, [])

  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/clients" element={<ProtectedRoute session={session}><ClientsPage /></ProtectedRoute>} />
        <Route path="/clients/add" element={<ProtectedRoute session={session}><AddClientPage /></ProtectedRoute>} />
        <Route path="/clients/:clientId" element={<ProtectedRoute session={session}><ClientPage /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
