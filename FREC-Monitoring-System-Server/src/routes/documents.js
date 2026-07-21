const express = require('express');
const router = express.Router();
const prisma = require('../db');

// ─────────────────────────────────────────────────────────────────────────────
// DOCUMENT ROUTES — PBI-147 (Trishia)
//
// This file defines all API endpoints related to document submission,
// querying, mode assignment, and the certification workflow state transitions.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * @route   POST /api/documents
 * @desc    Student submits a new document for certification tracking.
 *          Creates a DOCUMENT record with status "SUBMITTED" and mode null.
 *          Requires a valid Google Drive link.
 *          Also inserts an initial DOCUMENT_HISTORY entry.
 * @access  Private — Student only
 *
 * @body    { title: string, adviserId?: string, driveLink: string }
 *
 * @returns 201  { id, title, driveLink, status: "SUBMITTED", mode: null, submittedDate }
 * @returns 400  { error: string }
 */
router.post('/', async (req, res, next) => {
    try {
        const { title, adviserId, studentId, driveLink, drive_link } = req.body;
        const finalDriveLink = driveLink || drive_link;

        const effectiveStudentId = studentId || (req.user ? req.user.id : "U001");
        const effectiveAdviserId = adviserId || "U002";

        if (!title || !finalDriveLink) {
            return res.status(400).json({ error: "title and driveLink (Google Drive link) are required" });
        }

        // Google Drive / Docs URL regex validation
        const gdriveRegex = /^(https?:\/\/)?(drive|docs)\.google\.com\/.+$/i;
        if (!gdriveRegex.test(finalDriveLink.trim())) {
            return res.status(400).json({ error: "Invalid document link. Please provide a valid Google Drive link (e.g., https://drive.google.com/...)" });
        }

        const docId = `DOC-${Date.now()}`;
        const newDoc = await prisma.document.create({
            data: {
                id: docId,
                title: title.trim(),
                drive_link: finalDriveLink.trim(),
                student_id: effectiveStudentId,
                adviser_id: effectiveAdviserId,
                status: 'SUBMITTED',
                submitted_date: new Date(),
                updated_date: new Date(),
                history: {
                    create: {
                        status: 'SUBMITTED',
                        actor_id: effectiveStudentId,
                        remarks: `Document submitted via Google Drive: ${finalDriveLink.trim()}`
                    }
                }
            },
            include: {
                student: true,
                adviser: true
            }
        });

        res.status(201).json({
            id: newDoc.id,
            title: newDoc.title,
            driveLink: newDoc.drive_link,
            status: newDoc.status,
            mode: newDoc.mode,
            submittedDate: newDoc.submitted_date,
            student: newDoc.student ? newDoc.student.name : "Maria Santos",
            adviser: newDoc.adviser ? newDoc.adviser.name : "Dr. Elena Reyes"
        });
    } catch (error) {
        next(error);
    }
});


/**
 * @route   GET /api/documents
 * @desc    Returns a filtered list of documents based on the requesting user's role.
 * @access  Private — All roles
 *
 * @returns 200  { documents: [ { id, title, driveLink, student, adviser, mode, status, updatedDate } ] }
 */
router.get('/', async (req, res, next) => {
    try {
        const documents = await prisma.document.findMany({
            orderBy: { submitted_date: 'desc' },
            include: {
                student: { select: { id: true, name: true, email: true } },
                adviser: { select: { id: true, name: true, email: true } },
            }
        });

        const formatted = documents.map(doc => ({
            id: doc.id,
            title: doc.title,
            driveLink: doc.drive_link,
            student: doc.student ? doc.student.name : "Unknown",
            adviser: doc.adviser ? doc.adviser.name : "Unassigned",
            mode: doc.mode,
            status: doc.status,
            submittedDate: doc.submitted_date,
            updatedDate: doc.updated_date,
            remarks: doc.remarks
        }));

        res.status(200).json({ documents: formatted });
    } catch (error) {
        next(error);
    }
});


/**
 * @route   GET /api/documents/:id
 * @desc    Returns full details of a single document including its
 *          complete DOCUMENT_HISTORY audit log (who acted, when, what status).
 * @access  Private — Any participant associated with the document
 *
 * @params  id — The DOCUMENT.id (e.g. "DOC-2026-9021")
 *
 * @returns 200  { ...documentFields, history: [ { status, actorName, remarks, createdAt } ] }
 * @returns 404  { error: "Document not found" }
 */
router.get('/:id', (req, res) => {
    const { id } = req.params;
    // TODO (James): SELECT document.*, document_history.*
    //               FROM document
    //               LEFT JOIN document_history ON document_history.document_id = document.id
    //               WHERE document.id = $1
    res.status(200).json({
        message: `[PLACEHOLDER] GET /api/documents/${id} reached.`,
        document: null,
        history: [],
    });
});


/**
 * @route   PUT /api/documents/:id/mode
 * @desc    Adviser assigns or updates the certification routing mode (1, 2, or 3).
 *          Must be set before the Adviser can approve and forward to FREC.
 * @access  Private — Adviser only
 *
 * @params  id          — The DOCUMENT.id
 * @body    { mode: 1 | 2 | 3 }
 *
 * @returns 200  { id, mode }
 * @returns 400  { error: "mode must be 1, 2, or 3" }
 * @returns 404  { error: "Document not found" }
 */
router.put('/:id/mode', (req, res) => {
    const { id } = req.params;
    const { mode } = req.body;
    // TODO (James): UPDATE document SET mode = $1, updated_date = NOW() WHERE id = $2
    res.status(200).json({
        message: `[PLACEHOLDER] PUT /api/documents/${id}/mode reached.`,
        documentId: id,
        mode: mode ?? null,
    });
});


/**
 * @route   PUT /api/documents/:id/approve
 * @desc    Advances the document to the next status in the certification workflow.
 *          The next status is determined automatically by the actor's role and
 *          the document's current mode (see state machine table above).
 *          Also inserts a new DOCUMENT_HISTORY record for each transition.
 * @access  Private — Adviser, Reviewer (FREC), Program Chair, Dean
 *
 * @params  id          — The DOCUMENT.id
 * @body    { remarks?: string }
 *
 * @returns 200  { id, previousStatus, nextStatus, remarks }
 * @returns 400  { error: "Cannot approve from current status with this role" }
 * @returns 404  { error: "Document not found" }
 */
router.put('/:id/approve', (req, res) => {
    const { id } = req.params;
    const { remarks } = req.body;

    // TODO (James + Jaena): Fetch the document's current status and mode from DB.
    //   Then apply the state machine logic below:
    //
    // const role = req.user.role;       // injected by Jaena's auth middleware
    // const { status, mode } = document; // fetched from DB by James
    //
    // let nextStatus;
    // if (role === 'Adviser' && status === 'SUBMITTED') {
    //     nextStatus = 'FORWARDED-FREC';
    // } else if (role === 'Reviewer' && status === 'FORWARDED-FREC') {
    //     nextStatus = 'AWAITING_CHAIR_REVIEW';
    // } else if (role === 'Program Chair' && status === 'AWAITING_CHAIR_REVIEW') {
    //     nextStatus = mode === 1 ? 'COMPLETED' : 'FORWARDED-DEAN';
    // } else if (role === 'Dean' && status === 'FORWARDED-DEAN') {
    //     nextStatus = mode === 2 ? 'COMPLETED' : 'DEAN ENDORSED';
    // } else if (role === 'Reviewer' && status === 'DEAN ENDORSED' && mode === 3) {
    //     nextStatus = 'FOR REVIEW';
    // } else if (role === 'Reviewer' && status === 'FOR REVIEW' && mode === 3) {
    //     nextStatus = 'COMPLETED';
    // } else {
    //     return res.status(400).json({ error: 'Cannot approve from current status with this role' });
    // }
    //
    // UPDATE document SET status = nextStatus, updated_date = NOW() WHERE id = $1
    // INSERT INTO document_history (document_id, status, actor_id, remarks)
    //   VALUES ($1, nextStatus, req.user.id, remarks)

    res.status(200).json({
        message: `[PLACEHOLDER] PUT /api/documents/${id}/approve reached.`,
        documentId: id,
        remarks: remarks || null,
    });
});


/**
 * @route   PUT /api/documents/:id/disapprove
 * @desc    Rejects the document at the current stage, halting the workflow.
 *          Sets the document status to "DISAPPROVED" (terminal state).
 *          Also inserts a DOCUMENT_HISTORY record with the actor's remarks.
 * @access  Private — Adviser, Reviewer (FREC), Program Chair, Dean
 *
 * @params  id          — The DOCUMENT.id
 * @body    { remarks: string }  — Reason for disapproval (required)
 *
 * @returns 200  { id, status: "DISAPPROVED", remarks }
 * @returns 400  { error: "remarks are required when disapproving" }
 * @returns 404  { error: "Document not found" }
 */
router.put('/:id/disapprove', (req, res) => {
    const { id } = req.params;
    const { remarks } = req.body;
    // TODO (James): UPDATE document SET status = 'DISAPPROVED', updated_date = NOW() WHERE id = $1
    // TODO (James): INSERT INTO document_history (document_id, status, actor_id, remarks)
    //               VALUES ($1, 'DISAPPROVED', req.user.id, remarks)
    res.status(200).json({
        message: `[PLACEHOLDER] PUT /api/documents/${id}/disapprove reached.`,
        documentId: id,
        status: 'DISAPPROVED',
        remarks: remarks || null,
    });
});


module.exports = router;
