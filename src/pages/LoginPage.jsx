import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../components/Header.jsx'
import { validCredentials } from '../data/clients.js'

export default function LoginPage() {
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    const isValid = validCredentials.some(
      c => c.username === username.trim() && c.password === password
    )
    if (isValid) {
      setError('')
      navigate('/clients')
    } else {
      setError('Username or password is incorrect. Please try again.')
      setPassword('')
    }
  }

  return (
    <>
      <Header title="The Exercise Coach" />

      {/*
        MVP NOTE:
        This is mock authentication.
        The goal is to demonstrate flow, not security.
      */}
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
                Username
                <input
                  type="text"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
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

              <button type="submit">Sign In</button>
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
