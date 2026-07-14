import { useEffect, useState } from 'react'
import AuthCard from '../components/AuthCard'
import AdviserDashboard from '../pages/adviser/dashboard'

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

const mockWhitelistedAccount = accounts[0]

function LoginPage() {
    const [selectedAccount, setSelectedAccount] = useState(() => {
        if (typeof window !== 'undefined') {
            const saved = window.sessionStorage.getItem('mockWhitelistedAccount')
            return saved ? JSON.parse(saved) : mockWhitelistedAccount
        }
        return mockWhitelistedAccount
    })

    useEffect(() => {
        if (typeof window !== 'undefined') {
            window.sessionStorage.setItem(
                'mockWhitelistedAccount',
                JSON.stringify(selectedAccount),
            )
        }
    }, [selectedAccount])

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

                    <div className="account-list">
                        {accounts.map((account) => (
                            <button
                                key={account.email}
                                className={`account-item ${selectedAccount.email === account.email ? 'selected' : ''}`}
                                type="button"
                                onClick={() => setSelectedAccount(account)}
                            >
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
                </AuthCard>

                <div className="auth-footer">
                    Only whitelisted Google accounts may access this system — Managed by IT Admin
                </div>

                <div className="session-note">
                    Mock signed-in account: {selectedAccount.name} — {selectedAccount.email}
                </div>
            </div>
        </div>
    )
}

export default LoginPage
