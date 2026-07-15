export const accounts = [
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

export const defaultAccount = accounts[0]

export function isAdviserRole(role) {
    return ['adviser', 'advisor'].includes(role?.toLowerCase())
}

export function isStudentRole(role) {
    return ['student'].includes(role?.toLowerCase())
}
