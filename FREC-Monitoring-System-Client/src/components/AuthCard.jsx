function AuthCard({ title, description, children }) {
    return (
        <div className="auth-card">
            <div className="auth-card-header">
                <div>
                    <h2>{title}</h2>
                    <p>{description}</p>
                </div>
            </div>
            {children}
        </div>
    )
}

export default AuthCard
