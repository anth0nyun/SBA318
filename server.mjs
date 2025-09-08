import express from "express";

const app = express();

const PORT = 3000;

// test route
app.get("/health", (req, res) => {
    res.json({ status: "ok", message: "Task Manager baseline is working" })
});

// 404 for unknown routes
app.use((req, res) => {
    res.status(404).json({ err: "Not Found" })
});

app.listen(PORT, () => {
    console.log(`✅ Server listening at PORT:${PORT}`);
});