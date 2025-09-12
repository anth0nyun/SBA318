export function sortList(list, field = "id", order = "asc") {
    const dir = order == "desc" ? -1 : 1;
    const out = [...list]; // don't mutate caller
    out.sort((a, b) => {
        const av = a?.[field];
        const bv = b?.[field];

        // put undefined/null last
        const aU = av == undefined || av == null;
        const bU = bv == undefined || bv == null;
        if (aU && bU) return 0;
        if (aU) return 1;
        if (bU) return -1;

        if (av < bv) return -1 * dir;
        if (av > bv) return 1 * dir;
        return 0;
    });
    return out;
}

export function paginate(list, page = 1, limit = 10) {
    const p = Math.max(1, parseInt(page, 10) || 1);
    const l = Math.max(1, parseInt(limit, 10) || 10);
    const start = (p - 1) * l;
    const end = start + l;
    const data = list.slice(start, end);
    return {
        data,
        page: p,
        limit: l,
        total: list.length,
        pages: Math.max(1, Math.ceil(list.length / l)),
    };
}