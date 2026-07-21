export const ROLE_NAMES = {
    1: 'Student',
    2: 'Adviser',
    3: 'Program Chair',
    4: 'Dean',
    5: 'Reviewer',
    6: 'IT Admin',
    7: 'FREC'
}

export const accounts = [
    {
        initials: 'MS',
        id: 'U001',
        name: 'Maria Santos',
        email: 'm.santos@university.edu.ph',
        role: 1,
        program: 'BS Computer Science',
        whitelisted: true,
    },
    {
        initials: 'DE',
        id: 'U002',
        name: 'Dr. Elena Reyes',
        email: 'e.reyes@university.edu.ph',
        role: 2,
        whitelisted: true,
    },
    {
        initials: 'AD',
        id: 'U003',
        name: 'Admin Dela Rosa',
        email: 'podelapena2@up.edu.ph',
        role: 6,
        whitelisted: true,
    },
    {
        initials: 'DJ',
        id: 'U004',
        name: 'Dr. Jose Santos',
        email: 'j.santos@university.edu.ph',
        role: 3,
        whitelisted: true,
    },
    {
        initials: 'DA',
        id: 'U005',
        name: 'Dr. Amalia Cruz',
        email: 'a.cruz@university.edu.ph',
        role: 4,
        whitelisted: true,
    },
    {
        initials: 'PR',
        id: 'U006',
        name: 'Prof. Ramon Dela Cruz',
        email: 'r.delacruz@university.edu.ph',
        role: 5,
        whitelisted: true,
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
    return role === 3 || (typeof role === 'string' && role.toLowerCase() === 'program chair')
}

export function isDeanRole(role) {
    return role === 4 || (typeof role === 'string' && role.toLowerCase() === 'dean')
}

export function isReviewerRole(role) {
    return role === 5 || (typeof role === 'string' && role.toLowerCase().startsWith('reviewer'))
}

export function isITAdminRole(role) {
    return role === 6 || (typeof role === 'string' && role.toLowerCase() === 'it admin')
}
