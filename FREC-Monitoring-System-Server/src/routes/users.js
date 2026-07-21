const express = require('express');
const router = express.Router();
const multer = require('multer');
const csv = require('csv-parser');
const { Readable } = require('stream');
const prisma = require('../db');

// ─────────────────────────────────────────────────────────────────────────────
// USER / WHITELIST ROUTES
// Handled by: Venice (PBI-149 — User Roles and Whitelisting)
//
// TODO: Jaena will add the `protect` and `authorizeRoles` middleware calls
//       to restrict these endpoints to IT Admin only.
// ─────────────────────────────────────────────────────────────────────────────

// ─── Multer (in-memory file storage for CSV parsing) ─────────────────────────
const upload = multer({ storage: multer.memoryStorage() });

// ─── CSV Role Code Map ────────────────────────────────────────────────────────
// CSV import intentionally accepts only role codes 1-4 for this PBI:
// 1 = Student, 2 = Adviser, 3 = Program Chair, 4 = Dean.
// Header names are treated case-insensitively.
const ROLE_MAP = {
    '1': 1, '01': 1,
    '2': 2, '02': 2,
    '3': 3, '03': 3,
    '4': 4, '04': 4,
};

function normalizeCsvHeader(header) {
    return String(header || '').trim().toLowerCase().replace(/\s+/g, '_');
}

function parseRoleCode(raw) {
    if (!raw) return null;
    const normalized = String(raw).trim().toLowerCase();
    return ROLE_MAP[normalized] ?? null;
}

function normalizeHeader(header) {
    return header.trim().toLowerCase().replace(/\s+/g, '_');
}

function getCsvValue(row, field) {
    return row[field] || row[field.replace('_', ' ')] || '';
}

function validateCsvHeaders(row) {
    const headers = Object.keys(row).map(normalizeHeader);
    const required = ['name', 'email', 'role_code'];
    return required.filter((header) => !headers.includes(header));
}

/**
 * @route   GET /api/users
 * @desc    Returns a list of all registered user accounts.
 *          Used by IT Admin to view and audit the accounts table.
 * @access  Private — IT Admin only
 *
 * @returns 200  { users: [ { id, name, email, role, program, whitelisted } ] }
 */
router.get('/', async (req, res, next) => {
    try {
        const users = await prisma.userAccount.findMany({
            orderBy: { name: 'asc' },
            include: { role: true },
        });

        const formatted = users.map(u => ({
            id: u.id,
            name: u.name,
            email: u.email,
            role: u.role.label,
            role_id: u.role_id,
            program: u.program,
            whitelisted: u.whitelisted,
        }));

        res.status(200).json({ users: formatted });
    } catch (error) {
        next(error);
    }
});

/**
 * @route   PUT /api/users/:id/whitelist
 * @desc    Toggles the whitelisted status of a user account.
 *          Used by IT Admin to grant or revoke access to the portal.
 * @access  Private — IT Admin only
 *
 * @params  id          — The USER_ACCOUNT.id of the target user
 * @body    { whitelisted: boolean }
 *
 * @returns 200  { message: string, user: { id, whitelisted } }
 * @returns 404  { error: "User not found" }
 */
router.put('/:id/whitelist', async (req, res, next) => {
    const { id } = req.params;
    const { whitelisted } = req.body;

    if (typeof whitelisted !== 'boolean') {
        return res.status(400).json({ error: "'whitelisted' boolean field is required in body" });
    }

    try {
        const updated = await prisma.userAccount.update({
            where: { id },
            data: { whitelisted },
        });

        res.status(200).json({
            message: 'User whitelist status updated successfully',
            user: { id: updated.id, whitelisted: updated.whitelisted },
        });
    } catch (error) {
        if (error.code === 'P2025') {
            return res.status(404).json({ error: 'User not found' });
        }
        next(error);
    }
});

/**
 * @route   PUT /api/users/:id/role
 * @desc    Updates the assigned role of a user account.
 *          Used by IT Admin to grant or re-assign user roles.
 * @access  Private — IT Admin only
 *
 * @params  id          — The USER_ACCOUNT.id of the target user
 * @body    { role_id: number }
 *
 * @returns 200  { message: string, user: { id, role_id } }
 * @returns 400  { error: string }
 * @returns 404  { error: "User not found" }
 */
router.put('/:id/role', async (req, res, next) => {
    const { id } = req.params;
    const { role_id } = req.body;

    if (!role_id || typeof role_id !== 'number') {
        return res.status(400).json({ error: "'role_id' numeric field is required in body" });
    }

    try {
        const updated = await prisma.userAccount.update({
            where: { id },
            data: { role_id },
        });

        res.status(200).json({
            message: 'User role updated successfully',
            user: { id: updated.id, role_id: updated.role_id },
        });
    } catch (error) {
        if (error.code === 'P2025') {
            return res.status(404).json({ error: 'User not found' });
        }
        next(error);
    }
});

/**
 * @route   POST /api/users/upload-csv
 * @desc    Accepts a CSV file (multipart/form-data, field name: "file")
 *          with columns: name, email, role code
 *          Bulk creates / updates user accounts in PostgreSQL and whitelists them.
 *          Role code accepts: 1, 2, 3, 4. Header matching is case-insensitive.
 * @access  Private — IT Admin only
 *
 * @body    multipart/form-data  { file: <csv file> }
 *
 * @returns 200  { message, importedCount, skippedCount, errors: [ { row, reason } ] }
 * @returns 400  { error: string }
 */
router.post('/upload-csv', upload.single('file'), async (req, res, next) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No CSV file uploaded. Send the file as multipart/form-data with field name "file".' });
    }

    const ext = (req.file.originalname || '').split('.').pop().toLowerCase();
    if (ext !== 'csv') {
        return res.status(400).json({ error: 'Only .csv files are accepted.' });
    }

    const rows = [];
    const errors = [];

    try {
        await new Promise((resolve, reject) => {
            const stream = Readable.from(req.file.buffer.toString('utf-8'));
            stream
                .pipe(csv({ mapHeaders: ({ header }) => normalizeHeader(header) }))
                .on('data', (row) => rows.push(row))
                .on('error', reject)
                .on('end', resolve);
        });

        const missingHeaders = rows[0] ? validateCsvHeaders(rows[0]) : ['name', 'email', 'role_code'];
        if (missingHeaders.length) {
            return res.status(400).json({
                error: `Missing required column(s): ${missingHeaders.join(', ')}.`,
            });
        }

        const valid = [];
        rows.forEach((row, idx) => {
            const name = getCsvValue(row, 'name').trim();
            const email = getCsvValue(row, 'email').trim().toLowerCase();
            const roleRaw = getCsvValue(row, 'role_code');
            const roleId = parseRoleCode(roleRaw);

            const rowLabel = `Row ${idx + 2}`; // +2: 1 for header, 1-indexed
            if (!name) {
                errors.push({ row: rowLabel, reason: 'Missing name' });
                return;
            }
            if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                errors.push({ row: rowLabel, reason: 'Missing or invalid email' });
                return;
            }
            if (!roleId) {
                errors.push({ row: rowLabel, reason: `Invalid role code "${roleRaw}". Use 1, 2, 3, or 4.` });
                return;
            }
            valid.push({ name, email, role_id: roleId, program: null });
        });

        let importedCount = 0;
        for (const user of valid) {
            // Generate a short user ID from timestamp + random
            const userId = `U-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`.toUpperCase();

            await prisma.userAccount.upsert({
                where: { email: user.email },
                update: { name: user.name, role_id: user.role_id, program: user.program, whitelisted: true },
                create: {
                    id: userId,
                    name: user.name,
                    email: user.email,
                    role_id: user.role_id,
                    program: user.program,
                    whitelisted: true,
                },
            });
            importedCount++;
        }

        res.status(200).json({
            message: `CSV processed successfully. ${importedCount} user(s) imported and whitelisted.`,
            importedCount,
            skippedCount: errors.length,
            errors,
        });
    } catch (err) {
        next(err);
    }
});

/**
 * @route   POST /api/users/preview-csv
 * @desc    Parses a CSV file and returns a preview of the parsed rows without saving.
 *          Used by the IT Admin frontend to show a confirmation table before import.
 * @access  Private — IT Admin only
 *
 * @body    multipart/form-data  { file: <csv file> }
 *
 * @returns 200  { preview: [ { name, email, role_id, roleName, valid, error? } ] }
 */
router.post('/preview-csv', upload.single('file'), async (req, res, next) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No CSV file uploaded.' });
    }

    const ext = (req.file.originalname || '').split('.').pop().toLowerCase();
    if (ext !== 'csv') {
        return res.status(400).json({ error: 'Only .csv files are accepted.' });
    }

    const ROLE_LABELS = { 1: 'Student', 2: 'Adviser', 3: 'Program Chair', 4: 'Dean' };
    const rows = [];

    try {
        await new Promise((resolve, reject) => {
            const stream = Readable.from(req.file.buffer.toString('utf-8'));
            stream
                .pipe(csv({ mapHeaders: ({ header }) => normalizeHeader(header) }))
                .on('data', (row) => rows.push(row))
                .on('error', reject)
                .on('end', resolve);
        });

        const missingHeaders = rows[0] ? validateCsvHeaders(rows[0]) : ['name', 'email', 'role_code'];
        if (missingHeaders.length) {
            return res.status(400).json({
                error: `Missing required column(s): ${missingHeaders.join(', ')}.`,
            });
        }

        const preview = rows.map((row, idx) => {
            const name = getCsvValue(row, 'name').trim();
            const email = getCsvValue(row, 'email').trim().toLowerCase();
            const roleRaw = getCsvValue(row, 'role_code');
            const roleId = parseRoleCode(roleRaw);

            const errors = [];
            if (!name) errors.push('Missing name');
            if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.push('Missing or invalid email');
            if (!roleId) errors.push(`Invalid role code "${roleRaw}"`);

            return {
                name: name || '—',
                email: email || '—',
                role_id: roleId,
                roleName: roleId ? ROLE_LABELS[roleId] : 'Unknown',
                valid: errors.length === 0,
                error: errors.length > 0 ? errors.join('; ') : null,
            };
        });

        res.status(200).json({ preview, totalRows: preview.length, validCount: preview.filter(r => r.valid).length });
    } catch (err) {
        next(err);
    }
});

module.exports = router;
