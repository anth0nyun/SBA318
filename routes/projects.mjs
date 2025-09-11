// routes/projects.mjs
import { Router } from "express";
import { projects, tasks } from "../data/store.mjs";
import { nextIds } from "../data/store.mjs";

const router = Router();

// GET all projects
router.get("/", (req, res) => {
    res.json(projects);
});


router.post("/", (req, res) => {
    const { name } = req.body;

    if (!name || typeof name !== "string") {
        return res.status(400).json({ error: "Project name is required (string)" });
    }

    const newProject = { id: nextIds.project++, name: name.trim() };
    projects.push(newProject);

    res.status(201).json(newProject);
});


// DELETE /projects/:id
router.delete("/:id", (req, res) => {
    const id = Number(req.params.id);

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
