import { useEffect, useRef } from "react";

const surfaces =
  ".menu-button, .module-card, .window-shell, .launcher, .modal, .glass, .profile-entry, .settings-group";

export function usePointerGlow(screen: string, disabled: boolean) {
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const container = root.current;
    if (!container || disabled) return;
    const touched = new Set<HTMLElement>();
    let active: HTMLElement | null = null;
    let frame = 0;
    let latest: { target: HTMLElement; x: number; y: number } | null = null;
    const clear = () => {
      cancelAnimationFrame(frame);
      frame = 0;
      latest = null;
      active?.classList.remove("glow-active");
      active = null;
    };
    const paint = () => {
      frame = 0;
      if (!latest || !latest.target.isConnected) {
        clear();
        return;
      }
      const { target, x, y } = latest;
      const bounds = target.getBoundingClientRect();
      if (!bounds.width || !bounds.height) return;
      if (
        x < bounds.left ||
        x > bounds.left + bounds.width ||
        y < bounds.top ||
        y > bounds.top + bounds.height
      ) {
        clear();
        return;
      }
      if (active !== target) {
        active?.classList.remove("glow-active");
        active = target;
      }
      if (!touched.has(target)) {
        if (getComputedStyle(target).position === "static")
          target.classList.add("glow-positioned");
        target.classList.add("pointer-glow");
        touched.add(target);
      }
      // Percentages stay correct at any UI scale, including CSS zoom.
      target.style.setProperty(
        "--pointer-x",
        `${Math.max(0, Math.min(100, ((x - bounds.left) / bounds.width) * 100))}%`,
      );
      target.style.setProperty(
        "--pointer-y",
        `${Math.max(0, Math.min(100, ((y - bounds.top) / bounds.height) * 100))}%`,
      );
      target.classList.add("glow-active");
    };
    const move = (event: PointerEvent) => {
      if (event.pointerType === "touch") {
        clear();
        return;
      }
      const target =
        event.target instanceof Element
          ? event.target.closest<HTMLElement>(surfaces)
          : null;
      if (!target || !container.contains(target)) {
        clear();
        return;
      }
      latest = { target, x: event.clientX, y: event.clientY };
      if (!frame) frame = requestAnimationFrame(paint);
    };
    container.addEventListener("pointermove", move, { passive: true });
    container.addEventListener("pointerleave", clear);
    container.addEventListener("pointercancel", clear);
    container.addEventListener("scroll", clear, true);
    window.addEventListener("blur", clear);
    return () => {
      clear();
      container.removeEventListener("pointermove", move);
      container.removeEventListener("pointerleave", clear);
      container.removeEventListener("pointercancel", clear);
      container.removeEventListener("scroll", clear, true);
      window.removeEventListener("blur", clear);
      for (const target of touched) {
        target.classList.remove(
          "pointer-glow",
          "glow-positioned",
          "glow-active",
        );
        target.style.removeProperty("--pointer-x");
        target.style.removeProperty("--pointer-y");
      }
    };
  }, [screen, disabled]);
  return root;
}
