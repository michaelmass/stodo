export const trimPrefix = (value: string, prefix: string): string => (value.startsWith(prefix) ? value.substring(prefix.length) : value)
