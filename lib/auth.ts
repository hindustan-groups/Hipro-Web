import { cookies } from "next/headers";

const BACKEND_URL = process.env.BACKEND_API_URL || "http://localhost:5000";

export async function createSession(userId: string) {
  // Unused in frontend after Express migration, stub for compiling
}

export async function getSessionUser() {
  const sessionId = cookies().get("admin_session")?.value;
  if (!sessionId) return null;

  try {
    const res = await fetch(`${BACKEND_URL}/api/auth/me`, {
      headers: {
        Cookie: `admin_session=${sessionId}`,
      },
      cache: "no-store",
    });

    if (!res.ok) return null;
    
    const json = await res.json();
    return json.success ? json.data : null;
  } catch (error) {
    console.error("getSessionUser error:", error);
    return null;
  }
}

export async function logout() {
  const sessionId = cookies().get("admin_session")?.value;
  if (sessionId) {
    try {
      await fetch(`${BACKEND_URL}/api/auth/logout`, {
        method: "POST",
        headers: {
          Cookie: `admin_session=${sessionId}`,
        },
      });
    } catch (error) {
      console.error("logout error:", error);
    }
  }
  cookies().delete("admin_session");
}
