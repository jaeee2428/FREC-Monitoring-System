import { useState } from 'react'
import AuthCard from '../components/AuthCard'
import { GoogleLogin } from '@react-oauth/google'

function LoginPage({ onSignIn }) {
  const [error, setError] = useState('')

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const res = await fetch('http://localhost:5000/api/auth/google', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token: credentialResponse.credential }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Sign in failed')
      }

      onSignIn({ ...data.user, token: data.token })
    } catch (err) {
      setError(err.message)
    }
  }

  const handleGoogleError = () => {
    setError('Google sign in failed')
  }

  return (
    <div className="login-page">
      <div className="login-shell">
        <header className="brand-panel">
          <div className="brand-icon">CT</div>
          <div className="brand-copy">
            <div className="brand-title-row">
              <span className="brand-title">CertTrack:</span>
              <span className="brand-subtitle">Certification Monitoring and Tracking System</span>
            </div>
            <p>University Certification Management Portal</p>
          </div>
        </header>
        <AuthCard
          title="Sign in with Google"
          description="Access is restricted to whitelisted institutional Google accounts only. Select your account below to continue."
        >
          {error && <div className="text-red-600 mb-4 p-3 bg-red-50 rounded-lg border border-red-200">{error}</div>}
          
          <div className="mb-4">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
              useOneTap
              shape="pill"
              theme="filled_blue"
              size="large"
              text="signin_with"
              logo_alignment="left"
              width="100%"
            />
          </div>
        </AuthCard>

        <div className="auth-footer">
          Only whitelisted Google accounts may access this system · Managed by IT Admin
        </div>
      </div>
    </div>
  )
}

export default LoginPage
