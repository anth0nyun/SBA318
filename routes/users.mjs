import { Router } from "express";
import { users, tasks } from "../data/store.mjs";
import { requireJson } from "../middleware/requireJson.mjs";

const router = Router();

// custom middleware validate :id is a number
function validateNumericId(req, res, next) {
    const n = Number(req.params.id);
    if (Number.isNaN(n)) return res.status(400).json({ error: "Invalid id" });
    req.idNum = n;
    next();
}

// helper function to find index by number id
function findIndexById(arr, id) {
    for (let i = 0; i < arr.length; i++) if (arr[i].id == id) return i;
    return -1;
}

// GET all users 
router.get("/", (req, res) => {
    res.json(users);
});

// GET one user
router.get("/:id", validateNumericId, (req, res) => {
    const idx = findIndexById(users, req.idNum);
    if (idx == -1) return res.status(404).json({ error: "User not found" });
    res.json(users[idx]);
});

// POST create user
router.post("/", requireJson, (req, res) => {
    const { name, username, email } = req.body;
    if (!name || !username || !email) {
        return res.status(400).json({ error: "name, username, email required" });
    }
    // simple check for unique username
    for (let i = 0; i < users.length; i++) {
        if (users[i].username == username) {
            return res.status(400).json({ error: "Username taken" });
        }
    }
    const newUser = { id: nextIds.user++, name, username, email };
    users.push(newUser);
    res.status(201).json(newUser);
});

// PATCH 
router.patch("/:id", validateNumericId, requireJson, (req, res) => {
    const idx = findIndexById(users, req.idNum);
    if (idx == -1) return res.status(404).json({ error: "User not found" });

    const { username } = req.body || {};
    if (username && username !== users[idx].username) {
        // ensure new username not used by someone else
        for (let i = 0; i < users.length; i++) {
            if (i !== idx && users[i].username == username) {
                return res.status(400).json({ error: "Username taken" });
            }
        }
    }

    // only update provided fields
    const allowed = new Set(["name", "username", "email"]);
    const updates = {};
    for (const [k, v] of Object.entries(req.body || {})) {
        if (allowed.has(k)) updates[k] = v;
    }
    if (Object.keys(updates).length == 0) {
        return res.status(400).json({ error: "No valid fields to update" });
    }

    Object.assign(users[idx], updates);
    res.json(users[idx]);
});

// PUT 
router.put("/:id", validateNumericId, requireJson, (req, res) => {
    const idx = findIndexById(users, req.idNum);
    if (idx == -1) return res.status(404).json({ error: "User not found" });

    const { name, username, email } = req.body || {};
    if (!name || !username || !email) {
        return res.status(400).json({ error: "name, username, email required" });
    }
    // ensure username unique among others
    for (let i = 0; i < users.length; i++) {
        if (i !== idx && users[i].username == username) {
            return res.status(400).json({ error: "Username taken" });
        }
    }

    users[idx] = { id: req.idNum, name, username, email };
    res.json(users[idx]);
});

// DELETE /users/:id  
router.delete("/:id", validateNumericId, (req, res) => {
    const id = req.idNum;

    // find user index
    let idx = -1;
    for (let i = 0; i < users.length; i++) {
        if (users[i].id == id) { idx = i; break; }
    }
    if (idx == -1) return res.status(404).json({ error: "User not found" });

    const [deleted] = users.splice(idx, 1);

    // unassign tasks
    let unassignedCount = 0;
    for (let i = 0; i < tasks.length; i++) {
        if (tasks[i].assignedTo == id) {
            tasks[i].assignedTo = null;
            unassignedCount++;
        }
    }

    res.json({
        deleted,
        effects: { tasksUnassigned: unassignedCount }
    });
});

export default router;