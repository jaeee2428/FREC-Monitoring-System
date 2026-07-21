const ROLE_NAMES = {
    1: 'Student',
    2: 'Adviser',
    3: 'Program Chair',
    4: 'Dean',
    5: 'Reviewer',
    6: 'IT Admin',
    7: 'FREC'
}

const users = [
    {
        id: 'U001',
        name: 'Maria Santos',
        email: 'm.santos@university.edu.ph',
        role_id: 1,
        role: 'Student',
        program: 'BS Computer Science',
        whitelisted: true,
    },
    {
        id: 'U002',
        name: 'Dr. Elena Reyes',
        email: 'e.reyes@university.edu.ph',
        role_id: 2,
        role: 'Adviser',
        program: null,
        whitelisted: true,
    },
    {
        id: 'U003',
        name: 'Admin Dela Rosa',
        email: 'podelapena2@up.edu.ph',
        role_id: 6,
        role: 'IT Admin',
        program: null,
        whitelisted: true,
    },
    {
        id: 'U004',
        name: 'Dr. Jose Santos',
        email: 'j.santos@university.edu.ph',
        role_id: 3,
        role: 'Program Chair',
        program: null,
        whitelisted: true,
    },
    {
        id: 'U005',
        name: 'Dr. Amalia Cruz',
        email: 'a.cruz@university.edu.ph',
        role_id: 4,
        role: 'Dean',
        program: null,
        whitelisted: true,
    },
    {
        id: 'U006',
        name: 'Prof. Ramon Dela Cruz',
        email: 'r.delacruz@university.edu.ph',
        role_id: 5,
        role: 'Reviewer',
        program: null,
        whitelisted: true,
    },
]

module.exports = { users, ROLE_NAMES };
