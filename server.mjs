import express from "express";
import { attachRequestId } from "./middleware/attachRequestId.mjs";
import { requestLogger } from "./middleware/requestLogger.mjs";

const app = express();
const PORT = 3000;

app.use(express.json());

// middleware
app.use(attachRequestId);
app.use(requestLogger);

// test route
app.get("/health", (req, res) => {
    res.json({ status: "ok", requestId: req.id });
});

app.get("/", (req, res) => {
  res.send("Task Manager API — try GET /health");
});

// 404 for unknown routes
app.use((req, res) => {
    res.status(404).json({ err: "Not Found" })
});

app.listen(PORT, () => {
    console.log(`✅ Server listening at PORT:${PORT}`);
});