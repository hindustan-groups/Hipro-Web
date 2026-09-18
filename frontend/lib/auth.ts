import { cookies } from "next/headers";

let rawUrl = process.env.BACKEND_API_URL || "https://hipro-backend-749v.onrender.com";
if (rawUrl.includes("hipro-web-1.onrender.com") || rawUrl.includes("127.0.0.1:5000") || rawUrl.includes("localhost:5000")) {
  if (process.env.NODE_ENV === "production" || rawUrl.includes("hipro-web-1.onrender.com")) {
    rawUrl = "https://hipro-backend-749v.onrender.com";
  }
}
if (rawUrl.startsWith("https:") && !rawUrl.startsWith("https://")) {
  rawUrl = rawUrl.replace(/^https:?\/*/, "https://");
} else if (rawUrl.startsWith("http:") && !rawUrl.startsWith("http://")) {
  rawUrl = rawUrl.replace(/^http:?\/*/, "http://");
} else if (!rawUrl.startsWith("http://") && !rawUrl.startsWith("https://")) {
  rawUrl = `https://${rawUrl}`;
}
const BACKEND_URL = rawUrl.replace(/\/+$/, "");

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
