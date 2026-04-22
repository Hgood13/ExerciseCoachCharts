import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../components/Header.jsx'
import { supabase } from '../services/supabase.js'

export default function LoginPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error: authError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    })
    setLoading(false)
    if (authError) {
      setError('Email or password is incorrect. Please try again.')
      setPassword('')
    } else {
      navigate('/clients')
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

        {/* Login Form */}
        <div className="login-center">
          <div className="container login-container">
            <h1>Coach Sign In</h1>

            {error && (
              <div className="error-message">{error}</div>
            )}

            <form onSubmit={handleSubmit}>
              <label>
                Email
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                />
              </label>

              <label>
                Password
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                />
              </label>

              <button type="submit" disabled={loading}>
                {loading ? 'Signing in…' : 'Sign In'}
              </button>
            </form>
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
