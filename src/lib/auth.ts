/**
 * Authentication helpers built on Node's crypto (no external deps):
 *   - scrypt password hashing with per-user salt
 *   - stateless HMAC-signed session tokens stored in an httpOnly cookie
 */
import crypto from "crypto";
import { cookies, headers } from "next/headers";
import { getStore, newId, type Doc } from "./db";

const SECRET =
  process.env.AUTH_SECRET ||
  "dev-insecure-secret-change-me-in-production-0123456789";

export const SESSION_COOKIE = "medium_session";
const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

/* ------------------------------ passwords ------------------------------ */

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const derived = crypto.scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${derived}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const derived = crypto.scryptSync(password, salt, 64).toString("hex");
  const a = Buffer.from(hash, "hex");
  const b = Buffer.from(derived, "hex");
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

/* ------------------------------ tokens ------------------------------ */

function sign(payload: string): string {
  return crypto.createHmac("sha256", SECRET).update(payload).digest("base64url");
}

export function createToken(userId: string, sessionId: string): string {
  const exp = Math.floor(Date.now() / 1000) + SESSION_MAX_AGE;
  const payload = `${userId}.${sessionId}.${exp}`;
  const body = Buffer.from(payload).toString("base64url");
  return `${body}.${sign(body)}`;
}

/** Returns the userId + sessionId encoded in a valid, unexpired token, or null. */
export function verifyToken(token: string): { userId: string; sessionId: string } | null {
  const [body, sig] = token.split(".");
  if (!body || !sig) return null;
  const expected = sign(body);
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  const [userId, sessionId, exp] = Buffer.from(body, "base64url").toString().split(".");
  if (!userId || !sessionId || !exp) return null;
  if (Number(exp) < Math.floor(Date.now() / 1000)) return null;
  return { userId, sessionId };
}

/* ------------------------------ cookie session ------------------------------ */

/** Parses a User-Agent string into a human-readable device / browser / OS. */
export function parseUserAgent(ua: string): { device: string; browser: string; os: string } {
  const u = ua || "";

  let os = "Unknown OS";
  if (/iPhone/.test(u)) os = "iOS";
  else if (/iPad/.test(u)) os = "iPadOS";
  else if (/Android/.test(u)) os = "Android";
  else if (/Windows NT/.test(u)) os = "Windows";
  else if (/Mac OS X|Macintosh/.test(u)) os = "macOS";
  else if (/CrOS/.test(u)) os = "ChromeOS";
  else if (/Linux/.test(u)) os = "Linux";

  let browser = "Browser";
  if (/Edg\//.test(u)) browser = "Edge";
  else if (/OPR\/|Opera/.test(u)) browser = "Opera";
  else if (/SamsungBrowser/.test(u)) browser = "Samsung Internet";
  else if (/Firefox\//.test(u)) browser = "Firefox";
  else if (/Chrome\//.test(u)) browser = "Chrome";
  else if (/Safari\//.test(u)) browser = "Safari";

  let device: string;
  if (/iPhone/.test(u)) device = "iPhone";
  else if (/iPad/.test(u)) device = "iPad";
  else if (/Android/.test(u)) {
    const m = u.match(/Android[^;)]*;\s*([^;)]+?)(?:\s+Build|;|\))/);
    device = m ? m[1].trim() : "Android device";
  } else {
    device = `${browser} on ${os}`;
  }

  return { device, browser, os };
}

/** Best-effort client IP + location label from request headers. */
async function clientLocation(): Promise<{ ip: string; location: string }> {
  const h = await headers();
  const fwd = h.get("x-forwarded-for") || "";
  const ip = (fwd.split(",")[0] || h.get("x-real-ip") || "").trim();
  const city = h.get("x-vercel-ip-city");
  const country = h.get("x-vercel-ip-country");
  let location = "Local session";
  if (city || country) location = [decodeURIComponent(city || ""), country].filter(Boolean).join(", ");
  else if (ip && !/^(::1|127\.|::ffff:127\.)/.test(ip)) location = ip;
  return { ip: ip || "127.0.0.1", location };
}

/**
 * Creates a server-side session record for this device and sets the cookie.
 * The token now carries the sessionId so each device is individually revocable.
 */
export async function startSession(userId: string): Promise<string> {
  const sessionId = newId();
  const h = await headers();
  const ua = h.get("user-agent") || "";
  const { device, browser, os } = parseUserAgent(ua);
  const { ip, location } = await clientLocation();
  const now = new Date().toISOString();

  const db = await getStore();
  await db.collection("sessions").insertOne({
    _id: sessionId,
    userId,
    device,
    browser,
    os,
    ip,
    location,
    userAgent: ua,
    createdAt: now,
    lastSeenAt: now,
  });

  const store = await cookies();
  store.set(SESSION_COOKIE, createToken(userId, sessionId), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });

  // Record the sign-in (with the device it happened on) on the activity timeline.
  await logActivity(userId, "Signed in", `${device} · ${location}`);
  return sessionId;
}

/** Removes the current session record (if any) and clears the cookie. */
export async function clearSessionCookie(): Promise<void> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (token) {
    const decoded = verifyToken(token);
    if (decoded) {
      try {
        const db = await getStore();
        await db.collection("sessions").deleteOne({ _id: decoded.sessionId });
      } catch {
        // best-effort
      }
    }
  }
  store.delete(SESSION_COOKIE);
}

/** The sessionId of the request's current session, or null. */
export async function getCurrentSessionId(): Promise<string | null> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return verifyToken(token)?.sessionId ?? null;
}

/** Public-safe shape of a user (no password hash). */
export type PublicUser = {
  _id: string;
  fullName: string;
  email: string;
  avatar?: string;
  role?: string;
  bio?: string;
  username?: string;
  phone?: string;
  city?: string;
  country?: string;
  zip?: string;
  timezone?: string;
  plan?: string;
  createdAt?: string;
};

export function toPublicUser(doc: Doc): PublicUser {
  const { password, ...rest } = doc as Record<string, unknown>;
  void password;
  return rest as PublicUser;
}

/** Reads the session cookie and returns the current user, or null. */
export async function getCurrentUser(): Promise<PublicUser | null> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const decoded = verifyToken(token);
  if (!decoded) return null;
  const db = await getStore();

  // The session record must still exist — this is what makes "sign out from
  // this/all devices" actually revoke access on the affected devices.
  const session = await db.collection("sessions").findOne({ _id: decoded.sessionId });
  if (!session) return null;

  const user = await db.collection("users").findOne({ _id: decoded.userId });
  if (!user) return null;

  // Keep the device's "last active" timestamp fresh — but throttle the write to
  // at most once a minute. Writing on every request rewrites the whole store
  // (file store) and noticeably slows down navigation and API calls.
  try {
    const last = Date.parse(String(session.lastSeenAt ?? "")) || 0;
    if (Date.now() - last > 60_000) {
      await db.collection("sessions").updateOne(
        { _id: decoded.sessionId },
        { lastSeenAt: new Date().toISOString() }
      );
    }
  } catch {
    // non-critical
  }

  return toPublicUser(user);
}

/** Records an activity entry against a user (best-effort, per-user history). */
export async function logActivity(
  userId: string,
  action: string,
  detail?: string
): Promise<void> {
  try {
    const db = await getStore();
    const createdAt = new Date().toISOString();
    await db.collection("activities").insertOne({
      userId,
      action,
      detail: detail ?? "",
      createdAt,
    });
    // Every logged action also becomes an in-app notification (unread by default).
    await db.collection("notifications").insertOne({
      userId,
      title: action,
      body: detail ?? "",
      read: false,
      createdAt,
    });
  } catch {
    // Activity logging is non-critical; never block the main flow.
  }
}
