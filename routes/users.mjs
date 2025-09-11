import { Router } from "express";
import { users, tasks } from "../data/store.mjs";

const router = Router();

// GET all users 
router.get("/", (req, res) => {
    res.json(users);
});

// DELETE /users/:id
router.delete("/:id", (req, res) => {
    const id = Number(req.params.id);

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