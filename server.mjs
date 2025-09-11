import express from "express";
import { attachRequestId } from "./middleware/attachRequestId.mjs";
import { requestLogger } from "./middleware/requestLogger.mjs";
import { errorHandler } from "./middleware/errorHandler.mjs";
import { users, projects, tasks, nextIds } from "./data/store.mjs";
import tasksRouter from "./routes/tasks.mjs";

const app = express();
const PORT = 3000;

// middleware
app.use(express.json());
app.use(attachRequestId);
app.use(requestLogger);
app.use("/tasks", tasksRouter);

// test routes
app.get("/health", (req, res) => {
    res.json({ status: "ok", requestId: req.id });
});

app.get("/", (req, res) => {
    res.send("Task Manager API — try GET /health");
});

//debug route 
app.get("/debug/state", (req, res) => {
    res.json({
        counts: {
            users: users.length,
            projects: projects.length,
            tasks: tasks.length
        },
        sample: {
            user: users[0] || null,
            project: projects[0] || null,
            task: tasks[0] || null
        },
        nextIds
    });
});


// 404 
app.use((req, res) => {
    res.status(404).json({ error: "Not found" });
});

// error handler 
app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`✅ Server listening at http://localhost:${PORT}`);
});