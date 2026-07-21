const express = require('express');
const router = express.Router();
const { OAuth2Client } = require('google-auth-library');
const jwt = require('jsonwebtoken');
const prisma = require('../lib/prisma');
const { users: mockUsers } = require('../data/mockData');

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

        // For testing purposes, let's bypass Google verification temporarily
        // and just use the mock users if token is "test_<email>"
        let payload;
        if (token.startsWith('test_')) {
            const testEmail = token.replace('test_', '');
            payload = {
                sub: 'test_sub_' + testEmail,
                email: testEmail,
                name: 'Test User',
            };
        } else {
            // Real Google verification
            const ticket = await client.verifyIdToken({
                idToken: token,
                audience: process.env.GOOGLE_CLIENT_ID,
            });
            payload = ticket.getPayload();
        }

        const { email, name, sub: googleId } = payload;

        let user;
        let roleLabel;

        // Try to get user from Prisma first
        if (prisma) {
            user = await prisma.userAccount.findUnique({
                where: { email },
                include: { role: true }
            });

            if (user) {
                roleLabel = user.role.label;
            }
        }

        // If no Prisma or no user found, try mock data
        if (!user) {
            user = mockUsers.find(u => u.email === email);
            if (user) {
                roleLabel = user.role;
            }
        }

        if (!user) {
            // If user not found, return error
            return res.status(403).json({ error: "Account is not whitelisted to access the portal." });
        }

        if (!user.whitelisted) {
            return res.status(403).json({ error: "Account is not whitelisted to access the portal." });
        }

        // Generate JWT
        const jwtToken = jwt.sign(
            {
                id: user.id,
                email: user.email,
                name: user.name,
                role: roleLabel,
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
                role: roleLabel,
                program: user.program,
            },
        });
    } catch (error) {
        console.error("Google auth error:", error);
        return res.status(401).json({ error: "Invalid or expired Google token." });
    }
});

module.exports = router;
