const express = require('express');
const router = express.Router();
const { OAuth2Client } = require('google-auth-library');
const jwt = require('jsonwebtoken');
const prisma = require('../lib/prisma');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// ─────────────────────────────────────────────────────────────────────────────
// AUTH ROUTES
// ─────────────────────────────────────────────────────────────────────────────

/**
 * @route   POST /api/auth/google
 * @desc    Verifies a Google OAuth ID token, checks if the account is
 *          whitelisted, and returns a signed JWT with the user's role.
 * @access  Public
 *
 * @body    { token: string }  — The Google ID token from the client sign-in
 *
 * @returns 200  { token: string, user: { id, name, email, role, program } }
 * @returns 403  { error: "Account is not whitelisted" }
 * @returns 401  { error: "Invalid or expired Google token" }
 */
router.post('/google', async (req, res) => {
    try {
        const { token } = req.body;

        if (!token) {
            return res.status(400).json({ error: "Token is required" });
        }

        // Dev bypass: token "dev_<email>" skips Google verification
        let payload;
        if (token.startsWith('dev_')) {
            const devEmail = token.replace('dev_', '');
            payload = {
                sub: 'dev_sub_' + devEmail,
                email: devEmail,
                name: 'Dev User',
            };
        } else {
            const ticket = await client.verifyIdToken({
                idToken: token,
                audience: process.env.GOOGLE_CLIENT_ID,
            });
            payload = ticket.getPayload();
        }

        const { email } = payload;

        const user = await prisma.userAccount.findUnique({
            where: { email },
            include: { role: true }
        });

        if (!user) {
            return res.status(403).json({ error: "Account is not whitelisted to access the portal." });
        }

        if (!user.whitelisted) {
            return res.status(403).json({ error: "Account is not whitelisted to access the portal." });
        }

        const jwtToken = jwt.sign(
            {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role.label,
                role_id: user.role_id,
                program: user.program,
            },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.status(200).json({
            token: jwtToken,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role.label,
                program: user.program,
            },
        });
    } catch (error) {
        console.error("Google auth error:", error);
        return res.status(401).json({ error: "Invalid or expired Google token." });
    }
});

module.exports = router;
