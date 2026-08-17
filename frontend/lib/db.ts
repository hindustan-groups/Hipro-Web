
const BACKEND_URL = process.env.BACKEND_API_URL || "http://localhost:5000";

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

export async function insertOne<T>(collection: string, doc: any): Promise<T> {
  const endpoint = getEndpoint(collection);
  const res = await fetch(`${BACKEND_URL}/api/${endpoint}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(doc),
  });
  
  if (!res.ok) {
    throw new Error(`Failed to insert into ${collection}: ${res.statusText}`);
  }
  
  const json = await res.json();
  return json.data || json;
}

export async function findAll<T>(collection: string): Promise<T[]> {
  const endpoint = getEndpoint(collection);
  const res = await fetch(`${BACKEND_URL}/api/${endpoint}`, {
    cache: "no-store", // Ensure we fetch fresh data on server components
  });
  
  if (!res.ok) {
    throw new Error(`Failed to fetch ${collection}: ${res.statusText}`);
  }
  
  const json = await res.json();
  return json.data || json;
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
