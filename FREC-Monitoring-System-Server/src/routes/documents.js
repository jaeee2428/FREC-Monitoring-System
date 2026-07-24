const express = require('express');
const router = express.Router();
const prisma = require('../lib/prisma');

// ─── State Machine ────────────────────────────────────────────────────────────
// | Current Status          | Actor Role    | Mode    | Next Status            |
// |-------------------------|---------------|---------|------------------------|
// | SUBMITTED               | Adviser       | 1,2,3   | FORWARDED-FREC         |
// | FORWARDED-FREC          | FREC          | 1,2,3   | AWAITING_CHAIR_REVIEW  |
// | AWAITING_CHAIR_REVIEW   | Program Chair | 1       | COMPLETED              |
// | AWAITING_CHAIR_REVIEW   | Program Chair | 2 or 3  | FORWARDED-DEAN         |
// | FORWARDED-DEAN          | Dean          | 2       | COMPLETED              |
// | FORWARDED-DEAN          | Dean          | 3       | DEAN ENDORSED          |
// | DEAN ENDORSED           | FREC          | 3       | FOR REVIEW             |
// | FOR REVIEW              | FREC          | 3       | COMPLETED              |
// Any role → DISAPPROVE → DISAPPROVED (terminal)
// ─────────────────────────────────────────────────────────────────────────────

function nextDocId() {
    const year = new Date().getFullYear();
    const rand = Math.floor(1000 + Math.random() * 9000);
    return `DOC-${year}-${rand}`;
}

function serializeDoc(d) {
    return {
        id: d.id,
        title: d.title,
        student: d.student?.name || null,
        adviser: d.adviser?.name || null,
        mode: d.mode,
        status: d.status,
        submittedDate: d.submitted_date,
        updatedDate: d.updated_date,
        driveLink: d.drive_link || null,
        remarks: d.remarks || null,
    };
}

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/documents
// Student submits a new document.
// Body: { title, driveLink, studentId, adviserId? }
// ─────────────────────────────────────────────────────────────────────────────
router.post('/', async (req, res) => {
    const { title, driveLink, studentId, adviserId } = req.body;

    if (!title || !studentId) {
        return res.status(400).json({ error: 'title and studentId are required' });
    }

    try {
        const student = await prisma.userAccount.findUnique({ where: { id: studentId } });
        if (!student) {
            return res.status(404).json({ error: 'Student account not found' });
        }

        let resolvedAdviserId = adviserId || null;
        if (!resolvedAdviserId) {
            const assignment = await prisma.studentAdviser.findFirst({
                where: { student_id: studentId },
            });
            if (assignment) {
                resolvedAdviserId = assignment.adviser_id;
            }
        }
        if (!resolvedAdviserId) {
            const defaultAdviser = await prisma.userAccount.findFirst({
                where: { role_id: 2, whitelisted: true },
            });
            resolvedAdviserId = defaultAdviser?.id || null;
        }

        const now = new Date();
        const docId = nextDocId();

        const document = await prisma.document.create({
            data: {
                id: docId,
                title,
                student_id: studentId,
                adviser_id: resolvedAdviserId,
                status: 'SUBMITTED',
                mode: null,
                submitted_date: now,
                updated_date: now,
                drive_link: driveLink || null,
                remarks: null,
            },
        });

        await prisma.documentHistory.create({
            data: {
                document_id: docId,
                status: 'SUBMITTED',
                actor_id: studentId,
                remarks: driveLink
                    ? `Submitted via Google Drive: ${driveLink}`
                    : 'Document submitted',
            },
        });

        res.status(201).json({
            id: document.id,
            title: document.title,
            status: document.status,
            mode: document.mode,
            submittedDate: document.submitted_date,
            driveLink: document.drive_link || null,
            remarks: document.remarks || null,
        });
    } catch (err) {
        console.error('POST /api/documents error:', err);
        res.status(500).json({ error: 'Server error creating document' });
    }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/documents?studentId=&adviserId=&role=
// Returns documents filtered by context.
// ─────────────────────────────────────────────────────────────────────────────
router.get('/', async (req, res) => {
    const { studentId, adviserId, role } = req.query;

    try {
        let where = { deleted_at: null };

        if (studentId) {
            where.student_id = studentId;
        } else if (role && (role.toLowerCase() === 'adviser' || role.toLowerCase() === 'advisor')) {
            if (adviserId) {
                where.OR = [
                    { status: 'SUBMITTED' },
                    { adviser_id: adviserId },
                ];
            } else {
                where.status = 'SUBMITTED';
            }
        } else if (adviserId) {
            where.adviser_id = adviserId;
        }

        const docs = await prisma.document.findMany({
            where,
            orderBy: { submitted_date: 'desc' },
            include: {
                student: { select: { name: true } },
                adviser: { select: { name: true } },
            },
        });

        res.status(200).json({ documents: docs.map(serializeDoc) });
    } catch (err) {
        console.error('GET /api/documents error:', err);
        res.status(500).json({ error: 'Server error fetching documents' });
    }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/documents/:id
// ─────────────────────────────────────────────────────────────────────────────
router.get('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const doc = await prisma.document.findUnique({
            where: { id },
            include: {
                student: { select: { name: true } },
                adviser: { select: { name: true } },
                history: {
                    orderBy: { created_at: 'asc' },
                    include: { actor: { select: { name: true } } },
                },
            },
        });

        if (!doc) return res.status(404).json({ error: 'Document not found' });

        res.status(200).json({
            ...serializeDoc(doc),
            history: doc.history.map(h => ({
                status: h.status,
                actorName: h.actor?.name || 'Unknown',
                remarks: h.remarks,
                createdAt: h.created_at,
            })),
        });
    } catch (err) {
        console.error('GET /api/documents/:id error:', err);
        res.status(500).json({ error: 'Server error fetching document' });
    }
});

// ─────────────────────────────────────────────────────────────────────────────
// PUT /api/documents/:id
// Body: { title?, driveLink? }
// ─────────────────────────────────────────────────────────────────────────────
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { title, driveLink } = req.body;

    try {
        const doc = await prisma.document.findUnique({ where: { id } });
        if (!doc) return res.status(404).json({ error: 'Document not found' });

        const data = { updated_date: new Date() };
        if (title !== undefined) data.title = title;
        if (driveLink !== undefined) data.drive_link = driveLink;

        const updated = await prisma.document.update({ where: { id }, data });

        res.status(200).json(serializeDoc(updated));
    } catch (err) {
        if (err.code === 'P2025') return res.status(404).json({ error: 'Document not found' });
        console.error('PUT /api/documents/:id error:', err);
        res.status(500).json({ error: 'Server error updating document' });
    }
});

// ─────────────────────────────────────────────────────────────────────────────
// DELETE /api/documents/:id (soft delete)
// ─────────────────────────────────────────────────────────────────────────────
router.delete('/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const doc = await prisma.document.findUnique({ where: { id } });
        if (!doc) return res.status(404).json({ error: 'Document not found' });

        await prisma.document.update({
            where: { id },
            data: { deleted_at: new Date(), status: 'CANCELLED', updated_date: new Date() },
        });

        res.status(200).json({ message: 'Document cancelled', id });
    } catch (err) {
        console.error('DELETE /api/documents/:id error:', err);
        res.status(500).json({ error: 'Server error deleting document' });
    }
});

// ─────────────────────────────────────────────────────────────────────────────
// PUT /api/documents/:id/mode
// Body: { mode: 1|2|3 }
// ─────────────────────────────────────────────────────────────────────────────
router.put('/:id/mode', async (req, res) => {
    const { id } = req.params;
    const { mode } = req.body;

    if (![1, 2, 3].includes(Number(mode))) {
        return res.status(400).json({ error: 'mode must be 1, 2, or 3' });
    }

    try {
        const doc = await prisma.document.update({
            where: { id },
            data: { mode: Number(mode), updated_date: new Date() },
        });
        res.status(200).json({ id: doc.id, mode: doc.mode });
    } catch (err) {
        if (err.code === 'P2025') return res.status(404).json({ error: 'Document not found' });
        console.error('PUT /api/documents/:id/mode error:', err);
        res.status(500).json({ error: 'Server error updating mode' });
    }
});

// ─────────────────────────────────────────────────────────────────────────────
// PUT /api/documents/:id/approve
// Body: { actorId, role, remarks? }
// ─────────────────────────────────────────────────────────────────────────────
router.put('/:id/approve', async (req, res) => {
    const { id } = req.params;
    const { actorId, role, remarks } = req.body;

    if (!actorId || !role) {
        return res.status(400).json({ error: 'actorId and role are required' });
    }

    try {
        const doc = await prisma.document.findUnique({ where: { id } });
        if (!doc) return res.status(404).json({ error: 'Document not found' });

        const r = role.toLowerCase();
        const { status, mode } = doc;
        let nextStatus;

        if (r === 'adviser' && status === 'SUBMITTED') {
            nextStatus = 'FORWARDED-FREC';
        } else if (r === 'frec' && status === 'FORWARDED-FREC') {
            nextStatus = 'AWAITING_CHAIR_REVIEW';
        } else if (r === 'program chair' && status === 'AWAITING_CHAIR_REVIEW') {
            nextStatus = mode === 1 ? 'COMPLETED' : 'FORWARDED-DEAN';
        } else if (r === 'dean' && status === 'FORWARDED-DEAN') {
            nextStatus = mode === 2 ? 'COMPLETED' : 'DEAN ENDORSED';
        } else if (r === 'frec' && status === 'DEAN ENDORSED' && mode === 3) {
            nextStatus = 'FOR REVIEW';
        } else if (r === 'frec' && status === 'FOR REVIEW' && mode === 3) {
            nextStatus = 'COMPLETED';
        } else {
            return res.status(400).json({
                error: `Cannot approve from status "${status}" with role "${role}"`,
            });
        }

        const updated = await prisma.document.update({
            where: { id },
            data: { status: nextStatus, updated_date: new Date() },
        });

        await prisma.documentHistory.create({
            data: {
                document_id: id,
                status: nextStatus,
                actor_id: actorId,
                remarks: remarks || null,
            },
        });

        res.status(200).json({
            id,
            previousStatus: status,
            nextStatus,
            remarks: remarks || null,
        });
    } catch (err) {
        if (err.code === 'P2025') return res.status(404).json({ error: 'Document not found' });
        console.error('PUT /api/documents/:id/approve error:', err);
        res.status(500).json({ error: 'Server error approving document' });
    }
});

// ─────────────────────────────────────────────────────────────────────────────
// PUT /api/documents/:id/disapprove
// Body: { actorId, remarks }
// ─────────────────────────────────────────────────────────────────────────────
router.put('/:id/disapprove', async (req, res) => {
    const { id } = req.params;
    const { actorId, remarks } = req.body;

    if (!actorId) return res.status(400).json({ error: 'actorId is required' });
    if (!remarks) return res.status(400).json({ error: 'remarks are required when disapproving' });

    try {
        await prisma.document.update({
            where: { id },
            data: { status: 'DISAPPROVED', updated_date: new Date() },
        });

        await prisma.documentHistory.create({
            data: {
                document_id: id,
                status: 'DISAPPROVED',
                actor_id: actorId,
                remarks,
            },
        });

        res.status(200).json({ id, status: 'DISAPPROVED', remarks });
    } catch (err) {
        if (err.code === 'P2025') return res.status(404).json({ error: 'Document not found' });
        console.error('PUT /api/documents/:id/disapprove error:', err);
        res.status(500).json({ error: 'Server error disapproving document' });
    }
});

module.exports = router;
