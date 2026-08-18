
let rawUrl = process.env.BACKEND_API_URL || "https://hipro-web-1.onrender.com";
if (rawUrl.startsWith("https:") && !rawUrl.startsWith("https://")) {
  rawUrl = rawUrl.replace(/^https:?\/*/, "https://");
} else if (rawUrl.startsWith("http:") && !rawUrl.startsWith("http://")) {
  rawUrl = rawUrl.replace(/^http:?\/*/, "http://");
} else if (!rawUrl.startsWith("http://") && !rawUrl.startsWith("https://")) {
  rawUrl = `https://${rawUrl}`;
}
const BACKEND_URL = rawUrl.replace(/\/+$/, "");

function getEndpoint(collection: string): string {
  switch (collection) {
    case "contacts": return "contact";
    case "quotes": return "quote";
    case "admin-users":
    case "adminUsers": return "admin-users";
    default: return collection; 
  }
}

export async function readDB<T>(collection: string): Promise<T[]> {
  return await findAll<T>(collection);
}

export async function writeDB<T>(collection: string, data: T[]): Promise<void> {
  // Stub for backward compatibility
}

export async function insertOne<T>(collection: string, doc: any): Promise<T | null> {
  const endpoint = getEndpoint(collection);
  try {
    const res = await fetch(`${BACKEND_URL}/api/${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(doc),
    });
    
    if (!res.ok) {
      console.error(`Failed to insert into ${collection}: ${res.statusText}`);
      return null;
    }
    
    const json = await res.json();
    return json.data || json;
  } catch (err) {
    console.error(`Network error inserting into ${collection}:`, err);
    return null;
  }
}

export async function findAll<T>(collection: string): Promise<T[]> {
  const endpoint = getEndpoint(collection);
  try {
    const res = await fetch(`${BACKEND_URL}/api/${endpoint}`, {
      cache: "no-store", // Ensure fresh data on server components
    });
    
    if (!res.ok) {
      console.error(`Failed to fetch ${collection}: ${res.statusText}`);
      return [];
    }
    
    const json = await res.json();
    if (json.data) {
      if (Array.isArray(json.data)) return json.data;
      if (typeof json.data === "object" && json.data !== null) return [json.data];
    }
    if (Array.isArray(json)) return json;
    if (typeof json === "object" && json !== null) return [json];
    return [];
  } catch (err) {
    console.error(`Network error fetching ${collection}:`, err);
    return [];
  }
}

export async function findById<T>(collection: string, id: string): Promise<T | null> {
  const items = await findAll<any>(collection);
  return items.find((item: any) => item.id === id) || null;
}

export async function updateOne<T>(collection: string, id: string, updates: any): Promise<T | null> {
  const endpoint = getEndpoint(collection);
  const useParamId = ["team", "admin-users", "adminUsers"].includes(endpoint);
  
  const url = useParamId 
    ? `${BACKEND_URL}/api/${endpoint}/${id}` 
    : `${BACKEND_URL}/api/${endpoint}`;
    
  const body = useParamId ? updates : { id, ...updates };

  const res = await fetch(url, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  
  if (!res.ok) {
    console.error(`updateOne error in ${collection} (id: ${id}): ${res.statusText}`);
    return null;
  }
  
  const json = await res.json();
  return json.data || json;
}

export async function deleteOne(collection: string, id: string): Promise<boolean> {
  const endpoint = getEndpoint(collection);
  const useParamId = ["team", "admin-users", "adminUsers"].includes(endpoint);
  
  const url = useParamId 
    ? `${BACKEND_URL}/api/${endpoint}/${id}` 
    : `${BACKEND_URL}/api/${endpoint}`;
    
  const body = useParamId ? undefined : { id };

  const res = await fetch(url, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  
  return res.ok;
}
