import api from "./api";

let cache: Record<string, any> | null = null;

export async function getSiteContent(): Promise<Record<string, any>> {
  if (cache) return cache;
  try {
    const res = await api.get("/site-content");
    cache = res.data;
    return res.data;
  } catch {
    return {};
  }
}

export function clearContentCache() {
  cache = null;
}