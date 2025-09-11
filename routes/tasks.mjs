import { Router } from "express";
import { tasks, nextIds } from "../data/store.mjs";

const router = Router();

// custom middleware validate :id is a number
function validateNumericId(req, res, next) {
    const num = Number(req.params.id);
    if (Number.isNaN(num)) {
        return res.status(400).json({ error: "Invalid id" });
    }
    req.idNum = num;
    next();
}

// helper function to find index by number id
function findIndexById(arr, id) {
    const target = Number(id);
    for (let i = 0; i < arr.length; i++) {
        if (arr[i].id == target) return i;
    }
    return -1;
}

// GET /tasks
router.get("/", (req, res) => {
    const { completed, priority, projectId, assignedTo, search } = req.query;

    let result = [];
    for (let i = 0; i < tasks.length; i++) result.push(tasks[i]);

    // completed filter expects true or false
    if (completed == "true" || completed == "false") {
        const want = completed == "true";
        const filtered = [];
        for (let i = 0; i < result.length; i++) {
            if (result[i].completed == want) filtered.push(result[i]);
        }
        result = filtered;
    }

    // text search in title
    if (typeof search == "string" && search.trim() !== "") {
        const q = search.toLowerCase();
        const filtered = [];
        for (let i = 0; i < result.length; i++) {
            const t = (result[i].title || "").toLowerCase();
            if (t.includes(q)) filtered.push(result[i]);
        }
        result = filtered;
    }

    res.json(result);
});

// GET /tasks/:id
router.get("/:id", validateNumericId, (req, res) => {
    const idx = findIndexById(tasks, req.idNum);
    if (idx == -1) return res.status(404).json({ error: "Task not found" });
    res.json(tasks[idx]);
});

// POST /tasks (create)
router.post("/", (req, res) => {
    const { title, priority, dueDate, projectId, assignedTo } = req.body;

    if (!title || typeof title !== "string") {
        return res.status(400).json({ error: "Title is required (string)" });
    }

    const newTask = {
        id: nextIds.task++,
        title: title.trim(),
        completed: false,
        priority: typeof priority == "string" ? priority : undefined, // "low"|"med"|"high"
        dueDate: typeof dueDate == "string" ? dueDate : undefined,
        projectId: projectId !== undefined && projectId !== "" ? Number(projectId) : undefined,
        assignedTo: assignedTo !== undefined && assignedTo !== "" ? Number(assignedTo) : undefined
    };

    tasks.push(newTask);
    res.status(201).json(newTask);
});

// PATCH /tasks/:id
router.patch("/:id", validateNumericId, (req, res) => {
    const idx = findIndexById(tasks, req.idNum);
    if (idx == -1) return res.status(404).json({ error: "Task not found" });

    const allowed = new Set(["title", "completed", "priority", "projectId", "assignedTo", "dueDate"]);
    const updates = {};
    for (const [k, v] of Object.entries(req.body || {})) {
        if (allowed.has(k)) updates[k] = v;
    }
    if (Object.keys(updates).length == 0) {
        return res.status(400).json({ error: "No valid fields to update" });
    }

    // validation
    if (updates.completed != null && typeof updates.completed !== "boolean") {
        return res.status(400).json({ error: "completed must be boolean" });
    }
    if (updates.projectId != null) updates.projectId = Number(updates.projectId);
    if (updates.assignedTo != null) updates.assignedTo = Number(updates.assignedTo);

    tasks[idx] = { ...tasks[idx], ...updates };
    res.json(tasks[idx]);
});

// PUT 
router.put("/:id", validateNumericId, (req, res) => {
    const idx = findIndexById(tasks, req.idNum);
    if (idx == -1) return res.status(404).json({ error: "Task not found" });

    const { title, completed, priority, projectId, assignedTo, dueDate } = req.body || {};

    if (typeof title !== "string" || typeof completed !== "boolean" || typeof priority !== "string") {
        return res.status(400).json({ error: "PUT requires title (string), completed (boolean), priority (string)" });
    }

    tasks[idx] = {
        id: req.idNum,
        title: title.trim(),
        completed,
        priority,
        projectId: projectId != null && projectId !== "" ? Number(projectId) : undefined,
        assignedTo: assignedTo != null && assignedTo !== "" ? Number(assignedTo) : undefined,
        dueDate: typeof dueDate === "string" ? dueDate : undefined
    };

    res.json(tasks[idx]);
});

// DELETE /tasks/:id
router.delete("/:id", validateNumericId, (req, res) => {
    const idx = findIndexById(tasks, req.idNum);
    if (idx == -1) return res.status(404).json({ error: "Task not found" });
    tasks.splice(idx, 1);
    res.json({ message: "Task deleted" });
});

export default router;