// ============================================================================
// Ceylon Wall Decor — GSAP Configuration & Animation Presets
// ============================================================================

import gsap from "gsap";

// Safe initialization on client side
if (typeof window !== "undefined") {
  gsap.config({
    autoSleep: 60,
    force3D: true,
  });
}

export { gsap };

export const ANIMATION_PRESETS = {
  pageHeader: {
    opacity: 0,
    y: -10,
    duration: 0.35,
    ease: "power2.out",
  },
  cardEntrance: {
    opacity: 0,
    y: 16,
    duration: 0.45,
    ease: "power2.out",
  },
  staggerRow: {
    opacity: 0,
    y: 12,
    stagger: 0.04,
    duration: 0.35,
    ease: "power2.out",
  },
};
