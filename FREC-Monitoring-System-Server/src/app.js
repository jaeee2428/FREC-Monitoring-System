const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const documentRoutes = require('./routes/documents');

const app = express();

// ─── Middleware ────────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'ok', message: 'CertTrack API is running.' });
});

// ─── Routes ───────────────────────────────────────────────────────────────────
// Auth routes    → POST /api/auth/google
app.use('/api/auth', authRoutes);

// User routes    → GET  /api/users
//               → PUT  /api/users/:id/whitelist
app.use('/api/users', userRoutes);

// Document routes → POST /api/documents
//                → GET  /api/documents
//                → GET  /api/documents/:id
//                → PUT  /api/documents/:id/mode
//                → PUT  /api/documents/:id/approve
//                → PUT  /api/documents/:id/disapprove
app.use('/api/documents', documentRoutes);

// ─── 404 Catch-All ────────────────────────────────────────────────────────────
app.use((req, res) => {
    res.status(404).json({ error: `Route ${req.originalUrl} not found.` });
});

// ─── Global Error Handler ─────────────────────────────────────────────────────
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.status || 500).json({ error: err.message || 'Internal Server Error' });
});

module.exports = app;
