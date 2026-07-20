const express = require('express');
const router = express.Router();

// ─────────────────────────────────────────────────────────────────────────────
// USER / WHITELIST ROUTES
// Handled by: Venice (PBI-149 — User Roles and Whitelisting)
//
// TODO: Venice will replace the placeholder responses with:
//  1. PostgreSQL queries against USER_ACCOUNT and ROLE tables
//  2. Role assignment logic
//  3. Whitelist toggle (USER_ACCOUNT.whitelisted = true/false)
//
// TODO: Jaena will add the `protect` and `authorizeRoles` middleware calls
//       to restrict these endpoints to IT Admin only.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * @route   GET /api/users
 * @desc    Returns a list of all registered user accounts.
 *          Used by IT Admin to view and audit the accounts table.
 * @access  Private — IT Admin only
 *
 * @returns 200  { users: [ { id, name, email, role, program, whitelisted } ] }
 */
router.get('/', (req, res) => {
    // TODO (Venice): Query SELECT * FROM user_account JOIN role ON role.id = user_account.role_id
    res.status(200).json({
        message: '[PLACEHOLDER] GET /api/users reached.',
        users: [],
    });
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
router.put('/:id/whitelist', (req, res) => {
    const { id } = req.params;
    const { whitelisted } = req.body;
    // TODO (Venice): UPDATE user_account SET whitelisted = $1 WHERE id = $2
    res.status(200).json({
        message: `[PLACEHOLDER] PUT /api/users/${id}/whitelist reached.`,
        userId: id,
        whitelisted: whitelisted ?? null,
    });
});

module.exports = router;
