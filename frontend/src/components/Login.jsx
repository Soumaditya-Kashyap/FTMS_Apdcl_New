import React, { useState } from 'react'
import './Auth.css'

const Login = ({ onLogin, onSwitchToSignup }) => {
  const [formData, setFormData] = useState({
    apdcl_id: '',
    password: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await fetch('http://localhost:5001/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      // Store user data with expiration (7 days)
      const loginData = {
        user: data.user,
        loginTime: data.loginTime || new Date().toISOString(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days
      }
      
      localStorage.setItem('userSession', JSON.stringify(loginData))
      localStorage.setItem('user', JSON.stringify(data.user)) // Keep for backward compatibility
      
      onLogin(data.user)
    } catch (err) {
      console.error('Login error:', err)
      if (err.message.includes('fetch')) {
        setError('Unable to connect to server. Please check if the server is running.')
      } else {
        setError(err.message || 'Login failed. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1>Sign In</h1>
          <p>Welcome back to APDCL File Tracking System</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {error && <div className="error-message">{error}</div>}
          
          <div className="form-group">
            <label htmlFor="apdcl_id">APDCL ID</label>
            <input
              type="text"
              id="apdcl_id"
              name="apdcl_id"
              value={formData.apdcl_id}
              onChange={handleChange}
              placeholder="Enter your APDCL ID"
              required
              maxLength="8"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              required
            />
          </div>

          <button 
            type="submit" 
            className="auth-btn"
            disabled={loading}
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Don't have an account?{' '}
            <button 
              type="button" 
              className="link-btn"
              onClick={onSwitchToSignup}
            >
              Sign Up
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login
