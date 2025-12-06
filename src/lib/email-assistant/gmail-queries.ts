export const UNREAD_QUERY = "is:unread";
export const IMPORTANT_QUERY = "is:important";
export const RECENT_QUERY = "newer_than:1d";

export function buildSenderQuery(domain: string) {
  return `from:(*@${domain})`;
}

export function combineQueries(...queries: string[]) {
  const cleaned = queries.filter(Boolean);
  if (!cleaned.length) return "";
  return cleaned.join(" ");
}
