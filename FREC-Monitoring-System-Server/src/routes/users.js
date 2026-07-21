const express = require('express');
const router = express.Router();
// const db = require('../config/db'); for james to uncomment n setting up db

// ─────────────────────────────────────────────────────────────────────────────
// USER / WHITELIST ROUTES
// Handled by: Venice (PBI-149 — User Roles and Whitelisting)
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

router.get('/', async (req, res) => {
    try {
        const queryText = `
            SELECT u.id, u.name, u.email, u.program, u.whitelisted, r.label AS role
            FROM USER_ACCOUNT u
            JOIN ROLE r ON r.id = u.role_id
            ORDER BY u.id ASC;
        `;
        
        // const { rows } = await db.query(queryText);

        res.status(200).json({
            users: [] // Replace [] with `rows` once DB module is linked
        });
    } catch (error) {
        console.error("Error fetching users:", error);
        res.status(500).json({ error: "Server error fetching user list" });
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

router.put('/:id/whitelist', async (req, res) => {
    const { id } = req.params;
    const { whitelisted } = req.body;

    // Strict input validation
    if (typeof whitelisted !== 'boolean') {
        return res.status(400).json({ error: "'whitelisted' boolean field is required in body" });
    }

    try {
        const queryText = `
            UPDATE USER_ACCOUNT 
            SET whitelisted = $1 
            WHERE id = $2 
            RETURNING id, name, email, whitelisted;
        `;

        // const { rows } = await db.query(queryText, [whitelisted, id]);

        // if (rows.length === 0) {
        //     return res.status(404).json({ error: "User not found" });
        // }

        res.status(200).json({
            message: "User whitelist status updated successfully",
            user: { id, whitelisted } // Replace with `rows[0]` once DB is connected
        });
    } catch (error) {
        console.error("Error updating whitelist status:", error);
        res.status(500).json({ error: "Server error updating whitelist status" });
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

router.put('/:id/role', async (req, res) => {
    const { id } = req.params;
    const { role_id } = req.body;

    // Strict input validation
    if (!role_id || typeof role_id !== 'number') {
        return res.status(400).json({ error: "'role_id' numeric field is required in body" });
    }

    try {
        const queryText = `
            UPDATE USER_ACCOUNT 
            SET role_id = $1 
            WHERE id = $2 
            RETURNING id, name, email, role_id;
        `;

        // const { rows } = await db.query(queryText, [role_id, id]);

        // if (rows.length === 0) {
        //     return res.status(404).json({ error: "User not found" });
        // }

        res.status(200).json({
            message: "User role updated successfully",
            user: { id, role_id } // Replace with `rows[0]` once DB is connected
        });
    } catch (error) {
        console.error("Error updating user role:", error);
        res.status(500).json({ error: "Server error updating user role" });
    }
});

module.exports = router;
