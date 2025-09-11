import { Router } from "express";
import { tasks, nextIds } from "../data/store.mjs";

const router = Router();

// Helper function to find index by number id
function findIndexById(arr, id) {
    const target = Number(id);
    for (let i = 0; i < arr.length; i++) {
        if (arr[i].id === target) return i;
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
    if (typeof search === "string" && search.trim() !== "") {
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
  if (idx === -1) return res.status(404).json({ error: "Task not found" });
  res.json(tasks[idx]);
});