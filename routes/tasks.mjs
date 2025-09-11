import { Router } from "express";
import { tasks, nextIds } from "../data/store.mjs";

const router = Router();

// Helper function to find index by number id
function findIndexById(arr, id) {
    const target = Number(id);
    for (let i = 0; i < arr.length; i++) {
        if (arr[i].id == target) return i;
    }
    return -1;
}

// GET
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

// GET
router.get("/:id", (req, res) => {
    const idx = findIndexById(tasks, req.params.id);
    if (idx == -1) return res.status(404).json({ error: "Task not found" });
    res.json(tasks[idx]);
});

// POST /tasks  (create)
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

// PATCH
router.patch("/:id", (req, res, next) => {
    const id = req.params.id;
    const task = tasks.find((t) => t.id == id);

    if (!task) return next();

    // Only update provided fields
    Object.assign(task, req.body);
    res.json(task);
});

// PUT 
router.put("/:id", (req, res, next) => {
    const id = req.params.id;
    const index = tasks.findIndex((t) => t.id == id);

    if (index == -1) return next();

    const { title, projectId = null, assignedTo = null, completed = false } = req.body;

    tasks[index] = {
        id: Number(id),
        title,
        projectId,
        assignedTo,
        completed: Boolean(completed),
    };

    res.json(tasks[index]);
});

// DELETE /tasks/:id
router.delete("/:id", (req, res) => {
    const idx = findIndexById(tasks, req.params.id);
    if (idx == -1) return res.status(404).json({ error: "Task not found" });

    tasks.splice(idx, 1);
    res.json({ message: "Task deleted" });
});

export default router;