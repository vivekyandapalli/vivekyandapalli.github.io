import { device } from "../utils/device.js";

/**
 * Scroll reveals for the sections below the teardown, plus the timeline's progress line.
 * Skipped entirely for reduced motion; if GSAP is missing the content simply stays visible.
 */
export function initReveal() {
  const { gsap, ScrollTrigger } = window;
  if (!gsap || !ScrollTrigger || device.reducedMotion) return;
  document.documentElement.classList.add("js-reveal");

  ScrollTrigger.batch("#after [data-reveal]", {
    start: "top 90%",
    once: true,
    onEnter: (els) => gsap.to(els, { opacity: 1, y: 0, duration: 0.8, ease: "power3.out", stagger: 0.09, overwrite: true }),
  });

  const line = document.getElementById("tl-progress");
  const wrap = line?.closest(".timeline-wrap");
  if (line && wrap) {
    gsap.fromTo(line, { scaleY: 0 }, {
      scaleY: 1, ease: "none",
      scrollTrigger: { trigger: wrap, start: "top 65%", end: "bottom 65%", scrub: true },
    });
  }
}
