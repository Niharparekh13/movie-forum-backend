export function ok(data) { return { data }; }
export function error(code, message, details) {
    return { error: { code, message, details } };
}
