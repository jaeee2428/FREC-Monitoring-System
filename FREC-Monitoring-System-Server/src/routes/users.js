const express = require('express');
const router = express.Router();
const multer = require('multer');
const { parse } = require('csv-parse/sync');
const prisma = require('../lib/prisma');

// Multer: store uploaded CSV in memory
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        // Only accept CSV files
        if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
            cb(null, true);
        } else {
            cb(new Error('Only CSV files are allowed'));
        }
    }
});

// Role label → id map (mirrors the ROLE seed)
const ROLE_LABEL_TO_ID = {
    'student': 1,
    'adviser': 2,
    'advisor': 2,
    'program chair': 3,
    'dean': 4,
    'reviewer': 5,
    'it admin': 6,
    'frec': 7,
};

function roleToId(label = '') {
    return ROLE_LABEL_TO_ID[label.trim().toLowerCase()] ?? 1; // default → Student
}

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/users
// Returns every user account with their role label.
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
// PUT /api/users/:id/whitelist
// Toggles whitelisted status for a user.
// Body: { whitelisted: boolean }
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
            message: `User whitelist status updated successfully`,
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
// Updates role assignment for a user.
// Body: { role_id: number }
// ─────────────────────────────────────────────────────────────────────────────
router.put('/:id/role', async (req, res) => {
    const { id } = req.params;
    const { role_id } = req.body;

    if (!role_id || typeof role_id !== 'number') {
        return res.status(400).json({ error: "'role_id' numeric field is required in body" });
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
// Accepts a multipart CSV upload.
// CSV columns (case-insensitive headers): name, email, role, program
// All imported users are whitelisted by default.
// Existing emails are updated (upsert); new ones are created.
// Returns: { imported, skipped, users[] }
// ─────────────────────────────────────────────────────────────────────────────
router.post('/import', (req, res) => {
    upload.single('file')(req, res, async (err) => {
        // Handle multer/busboy errors gracefully
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

            // Generate a deterministic short ID from email
            const shortId = 'U-' + Buffer.from(email).toString('base64').replace(/[^a-zA-Z0-9]/g, '').slice(0, 10).toUpperCase();

            try {
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
