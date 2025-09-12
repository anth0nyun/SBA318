// routes/projects.mjs
import { Router } from "express";
import { projects, tasks, nextIds } from "../data/store.mjs";
import { requireJson } from "../middleware/requireJson.mjs";


const router = Router();

// GET all projects
router.get("/", (req, res) => {
    res.json(projects);
});

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

// GET all projects
router.get("/", (req, res) => {
    res.json(projects);
});

// GET one project
router.get("/:id", validateNumericId, (req, res) => {
    const idx = findIndexById(projects, req.idNum);
    if (idx === -1) return res.status(404).json({ error: "Project not found" });
    res.json(projects[idx]);
});

// POST create project
router.post("/", requireJson, (req, res) => {
    const { name } = req.body;
    if (!name || typeof name !== "string") {
        return res.status(400).json({ error: "Project name is required (string)" });
    }
    const newProject = { id: nextIds.project++, name: name.trim() };
    projects.push(newProject);
    res.status(201).json(newProject);
});

// PATCH
router.patch("/:id", validateNumericId, requireJson, (req, res) => {
    const idx = findIndexById(projects, req.idNum);
    if (idx == -1) return res.status(404).json({ error: "Project not found" });

    const allowed = new Set(["name"]);
    const updates = {};
    for (const [k, v] of Object.entries(req.body || {})) {
        if (allowed.has(k)) updates[k] = v;
    }
    if (updates.name != null) {
        if (typeof updates.name !== "string" || !updates.name.trim()) {
            return res.status(400).json({ error: "name must be a non-empty string" });
        }
        updates.name = updates.name.trim();
    }
    if (Object.keys(updates).length == 0) {
        return res.status(400).json({ error: "No valid fields to update" });
    }

    Object.assign(projects[idx], updates);
    res.json(projects[idx]);
});

// PUT 
router.put("/:id", validateNumericId, requireJson, (req, res) => {
    const idx = findIndexById(projects, req.idNum);
    if (idx == -1) return res.status(404).json({ error: "Project not found" });

    const { name } = req.body || {};
    if (!name || typeof name !== "string" || !name.trim()) {
        return res.status(400).json({ error: "Project name is required (string)" });
    }
    projects[idx] = { id: req.idNum, name: name.trim() };
    res.json(projects[idx]);
});


// DELETE /projects/:id 
router.delete("/:id", validateNumericId, (req, res) => {
    const id = req.idNum;

    // find project index
    let idx = -1;
    for (let i = 0; i < projects.length; i++) {
        if (projects[i].id == id) { idx = i; break; }
    }
    if (idx == -1) return res.status(404).json({ error: "Project not found" });

    const [deleted] = projects.splice(idx, 1);

    // clear project ref on tasks
    let clearedCount = 0;
    for (let i = 0; i < tasks.length; i++) {
        if (tasks[i].projectId == id) {
            tasks[i].projectId = null;
            clearedCount++;
        }
    }

    res.json({
        deleted,
        effects: { tasksClearedProject: clearedCount }
    });
});

export default router;
