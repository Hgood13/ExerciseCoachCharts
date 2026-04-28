import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../components/Header.jsx'
import { supabase } from '../services/supabase.js'

const MIN_PASSWORD_LENGTH = 6

export default function SetPasswordPage({ onPasswordSet }) {
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (password.length < MIN_PASSWORD_LENGTH) {
      setError(`Password must be at least ${MIN_PASSWORD_LENGTH} characters.`)
      return
    }
    if (password !== confirm) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)
    const { error: updateError } = await supabase.auth.updateUser({ password })
    setLoading(false)

    if (updateError) {
      setError(updateError.message)
    } else {
      setSuccess(true)
      onPasswordSet?.()
      setTimeout(() => navigate('/clients'), 2000)
    }
  }

  return (
    <>
      <Header title="The Exercise Coach" />

      <div className="login-wrapper">
        {/* Left Image */}
        <div className="login-image-left">
          <img
            src="/images/The_gym.jpg"
            alt="The Exercise Coach Gym"
            className="login-side-image"
          />
        </div>

        {/* Set Password Form */}
        <div className="login-center">
          <div className="container login-container">
            <h1>Set Your Password</h1>
            <p className="set-password-subtitle">
              Welcome! Please create a password to activate your account.
            </p>

            {error && <div className="error-message">{error}</div>}

            {success ? (
              <div className="success-message">
                Password set successfully! Redirecting you to the app…
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <label>
                  New Password
                  <input
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder={`At least ${MIN_PASSWORD_LENGTH} characters`}
                    required
                  />
                </label>

                <label>
                  Confirm Password
                  <input
                    type="password"
                    value={confirm}
                    onChange={e => setConfirm(e.target.value)}
                    placeholder="Re-enter your password"
                    required
                  />
                </label>

                <button type="submit" disabled={loading}>
                  {loading ? 'Saving…' : 'Set Password'}
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Right Image */}
        <div className="login-image-right">
          <img
            src="/images/the_exercise_coach_workout.jpg"
            alt="Exercise Coach Training Session"
            className="login-side-image"
          />
        </div>
      </div>
    </>
  )
}
