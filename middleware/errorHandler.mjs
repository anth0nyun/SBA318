export function errorHandler(err, req, res, next) {

    const status = Number(err.status) || 500;
    const message = err.message || "Server error";

    console.error(`[${req.id}] ERROR:`, status, message);

    res.status(status).json({
        error: message,
        requestId: req.id
    });
};