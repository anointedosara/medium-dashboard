"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * Adds scroll-reveal animations to every `.card` on the page:
 *   - cards already in view on load show immediately (no flash),
 *   - cards below the fold fade/slide in as you scroll to them.
 * Re-scans on route change and when new cards mount (async data).
 */
export function ScrollReveal() {
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("in");
            io.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.08 }
    );

    const process = (el: HTMLElement) => {
      if (el.dataset.sr) return;
      el.dataset.sr = "1";
      const r = el.getBoundingClientRect();
      const inView = r.top < (window.innerHeight || 0) && r.bottom > 0;
      el.classList.add("reveal");
      if (inView) {
        // Show right away — applied in the same frame, so no animation/flash.
        el.classList.add("in");
      } else {
        io.observe(el);
      }
    };

    const scan = () => {
      document.querySelectorAll<HTMLElement>(".card").forEach(process);
    };

    scan();

    // Catch cards added later (data loads, tab switches, modals).
    let raf = 0;
    const mo = new MutationObserver(() => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(scan);
    });
    mo.observe(document.body, { childList: true, subtree: true });

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      mo.disconnect();
    };
  }, [pathname]);

  return null;
}
