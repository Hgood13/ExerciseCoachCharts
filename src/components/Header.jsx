import { useNavigate } from 'react-router-dom'
import { supabase } from '../services/supabase.js'

export default function Header({ title = "The Exercise Coach", showSignOut = false }) {
  const navigate = useNavigate()

  async function handleSignOut() {
    await supabase.auth.signOut()
    navigate('/')
  }

  return (
    <div className="header">
      <div className="header-content">
        <div className="logo-section">
          <img
            src="/images/TEC_logo.svg"
            alt="The Exercise Coach"
            className="logo"
          />
        </div>
        <h1 className="header-title">{title}</h1>
        {showSignOut && (
          <button className="sign-out-btn" onClick={handleSignOut}>
            Sign Out
          </button>
        )}
      </div>
    </div>
  )
}
