export function asList<T>(value: readonly T[] | null | undefined): readonly T[] {
  return Array.isArray(value) ? value : [];
}

export function normalize(value: unknown): string {
  return String(value ?? "").toLowerCase().replace(/\s+/g, " ").trim();
}

export function redactSecrets(value: unknown): string {
  return String(value ?? "")
    .replace(/\b(?:sk|pk|rk|ak|ghp|gho|github_pat)_[A-Za-z0-9_-]{8,}/g, "[redacted]")
    .replace(/\b(?:sk|pk|rk|ak)-[A-Za-z0-9_-]{12,}/g, "[redacted]")
    .replace(/((?:api[_-]?key|access[_-]?token|refresh[_-]?token|token|secret|password)\s*[:=]\s*)\S+/gi, "$1[redacted]")
    .replace(/\bBearer\s+[A-Za-z0-9._-]{8,}/gi, "Bearer [redacted]");
}

export function textOf(value: unknown): string {
  const text = redactSecrets(value)
    .replace(/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g, "[redacted]")
    .replace(/\s+/g, " ")
    .trim();
  return text === "[redacted]" ? "" : text;
}

export function clipText(text: string, max: number): string {
  const compact = text.replace(/\s+/g, " ").trim();
  return compact.length <= max ? compact : compact.slice(0, max).replace(/[\s,，。；;、]+$/g, "") + "…";
}

export function hostnameOf(value: unknown): string {
  const match = String(value ?? "").trim().match(/^https?:\/\/([^/?#]+)/i);
  return match?.[1].replace(/:\d+$/, "").replace(/^www\./i, "").toLowerCase() ?? "";
}

export function safeUrl(value: unknown): string {
  const url = redactSecrets(value).trim();
  if (!/^https?:\/\//i.test(url) || /[\s<>"'\\]|javascript:/i.test(url)) return "";
  try {
    const parsed = new URL(url);
    if (parsed.username || parsed.password) return "";
    return url;
  } catch {
    return "";
  }
}

export function linkLabel(href: string): string {
  const host = hostnameOf(href);
  return host ? "打开 " + host : "打开链接";
}

export function beijingTime(text: string): string {
  return text.includes("北京") ? text : text + "（北京时间）";
}
