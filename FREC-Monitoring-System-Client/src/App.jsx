import './App.css'

const accounts = [
  {
    initials: 'MS',
    name: 'Maria Santos',
    email: 'm.santos@university.edu.ph',
    role: 'Student',
  },
  {
    initials: 'DE',
    name: 'Dr. Elena Reyes',
    email: 'e.reyes@university.edu.ph',
    role: 'Adviser',
  },
  {
    initials: 'AD',
    name: 'Admin Dela Rosa',
    email: 'it.admin@university.edu.ph',
    role: 'IT Admin',
  },
  {
    initials: 'DJ',
    name: 'Dr. Jose Santos',
    email: 'j.santos@university.edu.ph',
    role: 'Program Chair',
  },
  {
    initials: 'DA',
    name: 'Dr. Amalia Cruz',
    email: 'a.cruz@university.edu.ph',
    role: 'Dean',
  },
  {
    initials: 'PR',
    name: 'Prof. Ramon Dela Cruz',
    email: 'r.delacruz@university.edu.ph',
    role: 'Reviewer (FREC)',
  },
]

function App() {
  return (
    <div className="login-page">
      <div className="login-shell">
        <header className="brand-panel">
          <span className="brand-chip">CertTrack</span>
          <div>
            <h1>Certification Monitoring and Tracking System</h1>
            <p>University Certification Management Portal</p>
          </div>
        </header>

        <section className="auth-panel">
          <div className="auth-header">
            <div>
              <h2>Sign in with Google</h2>
              <p>
                Access is restricted to whitelisted institutional Google accounts only.
                Select your account below to continue.
              </p>
            </div>
          </div>

          <div className="account-list">
            {accounts.map((account) => (
              <button key={account.email} className="account-item" type="button">
                <div className="account-avatar">{account.initials}</div>
                <div className="account-details">
                  <span className="account-name">{account.name}</span>
                  <span className="account-email">{account.email}</span>
                </div>
                <span className="account-role">{account.role}</span>
                <span className="account-chevron">›</span>
              </button>
            ))}
          </div>
        </section>

        <div className="auth-footer">
          Only whitelisted Google accounts may access this system — Managed by IT Admin
        </div>
      </div>
    </div>
  )
}

export default App
