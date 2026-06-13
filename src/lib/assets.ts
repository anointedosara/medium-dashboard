/**
 * Centralized image sources. These match the look of the reference designs
 * using free-licensed equivalents. To use your own exact assets, drop files
 * into /public and point these at e.g. "/hero.png".
 */

// Friendly professional portrait for the auth screens (Unsplash, free license).
// Drop your own exact asset at public/auth-hero.png to override.
export const AUTH_HERO =
  "https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=800&q=80";

// Deterministic realistic avatar for a given seed (name/email/id).
export function avatarFor(seed: string): string {
  const n = Math.abs(hash(seed)) % 99;
  const gender = hash(seed) % 2 === 0 ? "men" : "women";
  return `https://randomuser.me/api/portraits/${gender}/${n}.jpg`;
}

function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h << 5) - h + s.charCodeAt(i);
  return h;
}
