export function requireJson(req, res, next) {
    const m = req.method.toUpperCase();
    if (m == "POST" || m == "PUT" || m == "PATCH") {
        const type = req.headers["content-type"] || "";
        if (!type.includes("application/json")) {
            return res.status(415).json({ error: "Content-Type must be application/json" });
        }
    }
    next();
}