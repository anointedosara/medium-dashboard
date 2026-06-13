"use client";

import { useEffect, useLayoutEffect } from "react";
import { usePathname } from "next/navigation";

// Run before paint on the client (avoids the SSR useLayoutEffect warning).
const useIsoLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

/**
 * Scroll/entrance animations for every `.card`:
 *   - cards in view on load animate in with a small stagger,
 *   - cards below the fold fade/slide in as you scroll to them.
 * New cards (added on mount are hidden before paint to avoid any flash) are
 * processed as they appear, and everything re-scans on route change.
 */
export function ScrollReveal() {
  const pathname = usePathname();

  useIsoLayoutEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            (entry.target as HTMLElement).classList.add("in");
            io.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.05 }
    );

    let batch = 0;
    let resetTimer = 0;

    const process = (el: HTMLElement) => {
      if (el.dataset.sr) return;
      el.dataset.sr = "1";
      el.classList.add("reveal"); // hide immediately

      const r = el.getBoundingClientRect();
      const inView = r.top < (window.innerHeight || 0) - 20 && r.bottom > 0;

      if (inView) {
        // Stagger the visible cards so they cascade in.
        const delay = Math.min(batch * 70, 420);
        batch++;
        clearTimeout(resetTimer);
        resetTimer = window.setTimeout(() => (batch = 0), 500);
        window.setTimeout(() => el.classList.add("in"), delay);
      } else {
        io.observe(el);
      }
    };

    const scan = () => {
      document.querySelectorAll<HTMLElement>(".card").forEach(process);
    };

    scan();

    // Process newly-mounted cards (async data, tab switches) BEFORE paint so
    // they never flash visible — MutationObserver callbacks run pre-paint.
    const mo = new MutationObserver((mutations) => {
      for (const m of mutations) {
        m.addedNodes.forEach((node) => {
          if (!(node instanceof HTMLElement)) return;
          if (node.classList?.contains("card")) process(node);
          node.querySelectorAll?.<HTMLElement>(".card").forEach(process);
        });
      }
    });
    mo.observe(document.body, { childList: true, subtree: true });

    return () => {
      clearTimeout(resetTimer);
      io.disconnect();
      mo.disconnect();
    };
  }, [pathname]);

  return null;
}
