export const ROLE_NAMES = {
    1: 'Student',
    2: 'Adviser',
    3: 'IT Admin',
    4: 'Program Chair',
    5: 'Dean',
    6: 'Reviewer (FREC)'
}

export const accounts = [
    {
        initials: 'MS',
        name: 'Maria Santos',
        email: 'm.santos@university.edu.ph',
        role: 1,
    },
    {
        initials: 'DE',
        name: 'Dr. Elena Reyes',
        email: 'e.reyes@university.edu.ph',
        role: 2,
    },
    {
        initials: 'AD',
        name: 'Admin Dela Rosa',
        email: 'it.admin@university.edu.ph',
        role: 3,
    },
    {
        initials: 'DJ',
        name: 'Dr. Jose Santos',
        email: 'j.santos@university.edu.ph',
        role: 4,
    },
    {
        initials: 'DA',
        name: 'Dr. Amalia Cruz',
        email: 'a.cruz@university.edu.ph',
        role: 5,
    },
    {
        initials: 'PR',
        name: 'Prof. Ramon Dela Cruz',
        email: 'r.delacruz@university.edu.ph',
        role: 6,
    },
]

export const defaultAccount = accounts[0]

export function isAdviserRole(role) {
    return role === 2 || (typeof role === 'string' && ['adviser', 'advisor'].includes(role.toLowerCase()))
}

export function isStudentRole(role) {
    return role === 1 || (typeof role === 'string' && role.toLowerCase() === 'student')
}

export function isProgramChairRole(role) {
    return role === 4 || (typeof role === 'string' && role.toLowerCase() === 'program chair')
}

export function isDeanRole(role) {
    return role === 5 || (typeof role === 'string' && role.toLowerCase() === 'dean')
}

export function isReviewerRole(role) {
    return role === 6 || (typeof role === 'string' && role.toLowerCase().startsWith('reviewer'))
}

export function isITAdminRole(role) {
    return role === 3 || (typeof role === 'string' && role.toLowerCase() === 'it admin')
}


