import { useEffect, useState } from 'react'
import './App.css'
import { isAdviserRole, isStudentRole, isProgramChairRole, isDeanRole, isReviewerRole, isITAdminRole } from './data/accounts.js'
import AdviserDashboard from './pages/adviser/Dashboard.jsx'
import StudentDashboard from './pages/student/dashboard.jsx'
import ProgramChairDashboard from './pages/program-chair/program-chair-dashboard.jsx'
import DeanDashboard from './pages/dean/dashboard.jsx'
import ReviewerDashboard from './pages/reviewer/dashboard.jsx'
import ITAdminDashboard from './pages/it-admin/dashboard.jsx'
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

  if (session && isStudentRole(session.role)) {
    return <StudentDashboard user={session} onLogout={handleSignOut} />
  }

  if (session && isProgramChairRole(session.role)) { 
    return <ProgramChairDashboard user={session} onLogout={handleSignOut} />
  }

  if (session && isDeanRole(session.role)) {
    return <DeanDashboard user={session} onLogout={handleSignOut} />
  }

  if (session && isReviewerRole(session.role)) {
    return <ReviewerDashboard user={session} onLogout={handleSignOut} />
  }

  if (session && isITAdminRole(session.role)) {
    return <ITAdminDashboard user={session} onLogout={handleSignOut} />
  }

  // 3. If not logged in at all, show the Login Page
  return <LoginPage onSignIn={handleSignIn} />
}

export default App
