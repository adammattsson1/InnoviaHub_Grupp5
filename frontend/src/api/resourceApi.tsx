import type { Resource } from "@/types/resource";

// URL for API
const API_URL = import.meta.env.VITE_API_URL;

//Getting recourses from endpoint
export async function fetchResources(token: string): Promise<Resource[]> {
  const res = await fetch(`${API_URL}/api/resources`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  console.log("fetchResources status:", res.status);

  if (!res.ok) {

  const text = await res.text();
  throw new Error(`Kunde inte hämta resurser: ${res.status} - ${text}`);

  }
  return res.json();
}