import { useEffect, useState } from 'react'
import './App.css'
import { isAdviserRole, isProgramChairRole } from './data/accounts.js'
import AdviserDashboard from './pages/adviser/dashboard.jsx'
import ProgramChairDashboard from './pages/program-chair/dashboard.jsx'
import LoginPage from './pages/LoginPage.jsx'

const SESSION_KEY = 'mockSession'

function readSession() {
  if (typeof window === 'undefined') {
    return null
  }

  const saved = window.sessionStorage.getItem(SESSION_KEY)
  if (!saved) {
    return null
  }

  try {
    return JSON.parse(saved)
  } catch {
    return null
  }
}

function App() {
  const [session, setSession] = useState(readSession)

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    if (session) {
      window.sessionStorage.setItem(SESSION_KEY, JSON.stringify(session))
      document.getElementById('root')?.classList.add('app-root--dashboard')
      document.getElementById('root')?.classList.remove('app-root--auth')
    } else {
      window.sessionStorage.removeItem(SESSION_KEY)
      document.getElementById('root')?.classList.add('app-root--auth')
      document.getElementById('root')?.classList.remove('app-root--dashboard')
    }
  }, [session])

  const handleSignIn = (account) => {
    setSession(account)
  }

  const handleSignOut = () => {
    setSession(null)
  }

  // 1. If logged in as Adviser, show the Adviser Dashboard
  if (session && isAdviserRole(session.role)) {
    return <AdviserDashboard user={session} onLogout={handleSignOut} />
  }

  // 2. UPDATED: If logged in as Program Chair, show your new ProgramChairDashboard
  if (session && isProgramChairRole(session.role)) { 
    return <ProgramChairDashboard user={session} onLogout={handleSignOut} />
  }

  // 3. If not logged in at all, show the Login Page
  return <LoginPage onSignIn={handleSignIn} />
}

export default App
