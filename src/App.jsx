import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { supabase } from './services/supabase.js'
import LoginPage from './pages/LoginPage.jsx'
import ClientsPage from './pages/ClientsPage.jsx'
import ClientPage from './pages/ClientPage.jsx'
import AddClientPage from './pages/AddClientPage.jsx'
import SetPasswordPage from './pages/SetPasswordPage.jsx'

function ProtectedRoute({ session, children }) {
  if (session === undefined) return null // still loading
  if (!session) return <Navigate to="/" replace />
  return children
}

export default function App() {
  const [session, setSession] = useState(undefined)
  const [needsPasswordSetup, setNeedsPasswordSetup] = useState(false)

  useEffect(() => {
    // Detect Supabase invite or password-recovery tokens in the URL hash
    const hash = window.location.hash
    if (hash.includes('type=invite') || hash.includes('type=recovery')) {
      setNeedsPasswordSetup(true)
    }

    supabase.auth.getSession().then(({ data }) => setSession(data.session ?? null))

    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session ?? null)
      // PASSWORD_RECOVERY fires when the user follows a "reset password" email link
      if (event === 'PASSWORD_RECOVERY') {
        setNeedsPasswordSetup(true)
      }
    })
    return () => listener.subscription.unsubscribe()
  }, [])

  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Routes>
        <Route
          path="/"
          element={
            needsPasswordSetup
              ? <Navigate to="/set-password" replace />
              : <LoginPage />
          }
        />
        <Route path="/set-password" element={<SetPasswordPage onPasswordSet={() => setNeedsPasswordSetup(false)} />} />
        <Route path="/clients" element={<ProtectedRoute session={session}><ClientsPage /></ProtectedRoute>} />
        <Route path="/clients/add" element={<ProtectedRoute session={session}><AddClientPage /></ProtectedRoute>} />
        <Route path="/clients/:clientId" element={<ProtectedRoute session={session}><ClientPage /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
