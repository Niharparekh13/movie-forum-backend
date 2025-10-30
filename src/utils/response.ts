export function ok<T>(data: T) { return { data }; }
export function error(code: string, message: string, details?: any) {
  return { error: { code, message, details } };
}
