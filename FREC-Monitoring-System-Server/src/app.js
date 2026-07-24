const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { protect } = require('./middleware/auth');

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
// Auth routes    → POST /api/auth/google (public)
app.use('/api/auth', authRoutes);

// Protected routes
app.use('/api/users', protect, userRoutes);
app.use('/api/documents', protect, documentRoutes);

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
