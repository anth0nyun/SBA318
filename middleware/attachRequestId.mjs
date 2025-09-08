let counter = 1;

export function attachRequestId(req, res, next) {
    req.id = counter++
    next();
}