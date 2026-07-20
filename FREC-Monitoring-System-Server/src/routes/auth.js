const express = require('express');
const router = express.Router();

// ─────────────────────────────────────────────────────────────────────────────
// AUTH ROUTES
// Handled by: Jaena (PBI-148 — Auth Implementation)
//
// TODO: Jaena will replace the placeholder responses with:
//  1. Google OAuth token verification (via google-auth-library)
//  2. Whitelist check against USER_ACCOUNT.whitelisted in PostgreSQL
//  3. JWT generation and return
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
router.post('/google', (req, res) => {
    // TODO (Jaena): Verify Google token, check whitelist, return JWT
    res.status(200).json({
        message: '[PLACEHOLDER] Google auth endpoint reached.',
        receivedToken: req.body.token || null,
    });
});

module.exports = router;
