import { cookies } from "next/headers";

let rawUrl = process.env.BACKEND_API_URL || "https://hipro-backend-749v.onrender.com";
if (rawUrl.includes("hipro-web-1.onrender.com")) {
  rawUrl = "https://hipro-backend-749v.onrender.com";
}
if (rawUrl.startsWith("https:") && !rawUrl.startsWith("https://")) {
  rawUrl = rawUrl.replace(/^https:?\/*/, "https://");
} else if (rawUrl.startsWith("http:") && !rawUrl.startsWith("http://")) {
  rawUrl = rawUrl.replace(/^http:?\/*/, "http://");
} else if (!rawUrl.startsWith("http://") && !rawUrl.startsWith("https://")) {
  rawUrl = `https://${rawUrl}`;
}
const BACKEND_URL = rawUrl.replace(/\/+$/, "");

interface CachedSession {
  user: any;
  timestamp: number;
}
const sessionCache = new Map<string, CachedSession>();
const SESSION_TTL_MS = 60 * 1000; // 60 seconds

export async function createSession(userId: string) {
  // Unused in frontend after Express migration, stub for compiling
}

export async function getSessionUser() {
  const sessionId = cookies().get("admin_session")?.value;
  if (!sessionId) return null;

  // 1. Check in-memory session cache for instant 0ms server component resolution
  const cached = sessionCache.get(sessionId);
  if (cached && Date.now() - cached.timestamp < SESSION_TTL_MS) {
    return cached.user;
  }

  try {
    const res = await fetch(`${BACKEND_URL}/api/auth/me`, {
      headers: {
        Cookie: `admin_session=${sessionId}`,
      },
      cache: "no-store",
    });

    if (!res.ok) {
      sessionCache.delete(sessionId);
      return null;
    }
    
    const json = await res.json();
    if (json.success && json.data) {
      sessionCache.set(sessionId, { user: json.data, timestamp: Date.now() });
      return json.data;
    }
    sessionCache.delete(sessionId);
    return null;
  } catch (error) {
    console.error("getSessionUser error:", error);
    // Transient network glitch fallback: use cached session if within 5 minutes
    if (cached && Date.now() - cached.timestamp < 5 * 60 * 1000) {
      return cached.user;
    }
    return null;
  }
}

export async function logout() {
  const sessionId = cookies().get("admin_session")?.value;
  if (sessionId) {
    sessionCache.delete(sessionId);
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
