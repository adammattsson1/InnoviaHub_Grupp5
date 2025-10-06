import type { Resource } from "@/types/resource";

//Get APU url
const BASE = import.meta.env.VITE_API_BASE_URL;

//Getting recourses from endpoint
export async function fetchResources(token: string): Promise<Resource[]> {
  const res = await fetch(`http://localhost:5296/api/resources`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  console.log("fetchResources status:", res.status);

  if (!res.ok) {

  const text = await res.text();
  throw new Error(`Kunde inte hämta resurser: ${res.status} - ${text}`);

  }
  return res.json();
}