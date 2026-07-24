const express = require('express');
const router = express.Router();
const multer = require('multer');
const { parse } = require('csv-parse/sync');
const prisma = require('../lib/prisma');

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
            cb(null, true);
        } else {
            cb(new Error('Only CSV files are allowed'));
        }
    }
});

const ROLE_LABEL_TO_ID = {
    'student': 1,
    'adviser': 2,
    'advisor': 2,
    'program chair': 3,
    'dean': 4,
    'frec': 5,
    'it admin': 6,
};

function roleToId(label = '') {
    return ROLE_LABEL_TO_ID[label.trim().toLowerCase()] ?? 1;
}

async function generateUniqueId(email, maxLength = 10) {
    const base = email.trim().toLowerCase();
    for (let len = maxLength; len <= 32; len++) {
        const shortId = 'U-' + Buffer.from(base).toString('base64').replace(/[^a-zA-Z0-9]/g, '').slice(0, len).toUpperCase();
        const exists = await prisma.userAccount.findUnique({ where: { id: shortId } });
        if (!exists) return shortId;
    }
    const fallback = 'U-' + Buffer.from(base + Date.now()).toString('base64').replace(/[^a-zA-Z0-9]/g, '').slice(0, 10).toUpperCase();
    return fallback;
}

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/users
// ─────────────────────────────────────────────────────────────────────────────
router.get('/', async (req, res) => {
    try {
        const users = await prisma.userAccount.findMany({
            orderBy: { id: 'asc' },
            include: { role: true },
        });

        res.status(200).json({
            users: users.map(u => ({
                id: u.id,
                name: u.name,
                email: u.email,
                role: u.role.label,
                role_id: u.role_id,
                program: u.program,
                whitelisted: u.whitelisted,
            })),
        });
    } catch (err) {
        console.error('GET /api/users error:', err);
        res.status(500).json({ error: 'Server error fetching user list' });
    }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/users/:id
// ─────────────────────────────────────────────────────────────────────────────
router.get('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const user = await prisma.userAccount.findUnique({
            where: { id },
            include: {
                role: true,
                studentAdvisers: { include: { adviser: { select: { id: true, name: true } } } },
                adviserStudents: { include: { student: { select: { id: true, name: true } } } },
            },
        });

        if (!user) return res.status(404).json({ error: 'User not found' });

        res.status(200).json({
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role.label,
            role_id: user.role_id,
            program: user.program,
            whitelisted: user.whitelisted,
            advisers: user.studentAdvisers?.map(a => ({ id: a.adviser.id, name: a.adviser.name })) || [],
            students: user.adviserStudents?.map(s => ({ id: s.student.id, name: s.student.name })) || [],
        });
    } catch (err) {
        console.error('GET /api/users/:id error:', err);
        res.status(500).json({ error: 'Server error fetching user' });
    }
});

// ─────────────────────────────────────────────────────────────────────────────
// PUT /api/users/:id
// Body: { name?, email?, program? }
// ─────────────────────────────────────────────────────────────────────────────
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { name, email, program } = req.body;

    try {
        const data = {};
        if (name !== undefined) data.name = name;
        if (email !== undefined) data.email = email;
        if (program !== undefined) data.program = program;

        const user = await prisma.userAccount.update({
            where: { id },
            data,
            include: { role: true },
        });

        res.status(200).json({
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role.label,
            role_id: user.role_id,
            program: user.program,
            whitelisted: user.whitelisted,
        });
    } catch (err) {
        if (err.code === 'P2025') return res.status(404).json({ error: 'User not found' });
        console.error('PUT /api/users/:id error:', err);
        res.status(500).json({ error: 'Server error updating user' });
    }
});

// ─────────────────────────────────────────────────────────────────────────────
// DELETE /api/users/:id
// ─────────────────────────────────────────────────────────────────────────────
router.delete('/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const user = await prisma.userAccount.findUnique({ where: { id } });
        if (!user) return res.status(404).json({ error: 'User not found' });

        await prisma.studentAdviser.deleteMany({
            where: { OR: [{ student_id: id }, { adviser_id: id }] },
        });
        await prisma.documentHistory.deleteMany({ where: { actor_id: id } });
        await prisma.document.deleteMany({
            where: { OR: [{ student_id: id }, { adviser_id: id }] },
        });
        await prisma.userAccount.delete({ where: { id } });

        res.status(200).json({ message: 'User deleted', id });
    } catch (err) {
        console.error('DELETE /api/users/:id error:', err);
        res.status(500).json({ error: 'Server error deleting user' });
    }
});

// ─────────────────────────────────────────────────────────────────────────────
// PUT /api/users/:id/whitelist
// ─────────────────────────────────────────────────────────────────────────────
router.put('/:id/whitelist', async (req, res) => {
    const { id } = req.params;
    const { whitelisted } = req.body;

    if (typeof whitelisted !== 'boolean') {
        return res.status(400).json({ error: "'whitelisted' boolean field is required in body" });
    }

    try {
        const user = await prisma.userAccount.update({
            where: { id },
            data: { whitelisted },
        });

        res.status(200).json({
            message: 'User whitelist status updated successfully',
            user: { id: user.id, name: user.name, email: user.email, whitelisted: user.whitelisted },
        });
    } catch (err) {
        if (err.code === 'P2025') {
            return res.status(404).json({ error: 'User not found' });
        }
        console.error('PUT /api/users/:id/whitelist error:', err);
        res.status(500).json({ error: 'Server error updating whitelist status' });
    }
});

// ─────────────────────────────────────────────────────────────────────────────
// PUT /api/users/:id/role
// ─────────────────────────────────────────────────────────────────────────────
router.put('/:id/role', async (req, res) => {
    const { id } = req.params;
    const { role_id } = req.body;

    if (![1, 2, 3, 4, 5, 6].includes(role_id)) {
        return res.status(400).json({ error: "'role_id' must be a valid current role ID" });
    }

    try {
        const user = await prisma.userAccount.update({
            where: { id },
            data: { role_id },
            include: { role: true },
        });

        res.status(200).json({
            message: 'User role updated successfully',
            user: { id: user.id, name: user.name, email: user.email, role: user.role.label, role_id: user.role_id },
        });
    } catch (err) {
        if (err.code === 'P2025') {
            return res.status(404).json({ error: 'User not found' });
        }
        console.error('PUT /api/users/:id/role error:', err);
        res.status(500).json({ error: 'Server error updating user role' });
    }
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/users/import
// ─────────────────────────────────────────────────────────────────────────────
router.post('/import', (req, res) => {
    upload.single('file')(req, res, async (err) => {
        if (err) {
            console.error('Multer/busboy error:', err);
            if (err instanceof multer.MulterError) {
                if (err.code === 'LIMIT_FILE_SIZE') {
                    return res.status(400).json({ error: 'File too large. Maximum size is 5MB.' });
                }
                return res.status(400).json({ error: `Upload error: ${err.message}` });
            }
            return res.status(400).json({ error: err.message || 'File upload failed' });
        }

        if (!req.file) {
            return res.status(400).json({ error: 'No CSV file uploaded. Use field name "file".' });
        }

        let rows;
        try {
            rows = parse(req.file.buffer.toString('utf8'), {
                columns: header => header.map(h => h.trim().toLowerCase()),
                skip_empty_lines: true,
                trim: true,
            });
        } catch (parseErr) {
            return res.status(400).json({ error: 'Failed to parse CSV: ' + parseErr.message });
        }

        if (!rows.length) {
            return res.status(400).json({ error: 'CSV file is empty.' });
        }

        const required = ['name', 'email'];
        const missing = required.filter(col => !(col in rows[0]));
        if (missing.length) {
            return res.status(400).json({ error: `CSV is missing required columns: ${missing.join(', ')}` });
        }

        const results = [];
        const skipped = [];

        for (const row of rows) {
            const email = (row.email || '').trim().toLowerCase();
            const name = (row.name || '').trim();

            if (!email || !name) {
                skipped.push({ row, reason: 'Missing name or email' });
                continue;
            }

            const role_id = roleToId(row.role || '');
            const program = (row.program || '').trim() || null;

            try {
                const shortId = await generateUniqueId(email);

                const user = await prisma.userAccount.upsert({
                    where: { email },
                    update: { name, role_id, program, whitelisted: true },
                    create: { id: shortId, name, email, role_id, program, whitelisted: true },
                    include: { role: true },
                });
                results.push({
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role.label,
                    role_id: user.role_id,
                    program: user.program,
                    whitelisted: user.whitelisted,
                });
            } catch (upsertErr) {
                skipped.push({ row, reason: upsertErr.message });
            }
        }

        res.status(200).json({
            message: `Import complete. ${results.length} user(s) imported/updated, ${skipped.length} skipped.`,
            imported: results.length,
            skipped: skipped.length,
            users: results,
            errors: skipped,
        });
    });
});

module.exports = router;
