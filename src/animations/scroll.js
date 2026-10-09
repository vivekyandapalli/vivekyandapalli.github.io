import { device } from "../utils/device.js";

const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const smooth = (a, b, x) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };

/**
 * Maps scroll progress through #story to the teardown:
 *   0 - 0.12  assembled, hero text visible
 *   0.12 - 0.5  layers separate
 *   0.5 - 1  camera visits each layer in turn (caption changes per step)
 */
export function initScroll({ story, pin, heroCopy, cue, caption, layers, scene }) {
  const { gsap, ScrollTrigger } = window;
  if (!gsap || !ScrollTrigger) throw new Error("GSAP failed to load");
  gsap.registerPlugin(ScrollTrigger);

  const n = layers.length;
  const els = {
    index: caption.querySelector("#cap-index"), title: caption.querySelector("#cap-title"), text: caption.querySelector("#cap-text"),
  };
  let step = -2;

  function showCaption(idx) {
    gsap.killTweensOf(caption);
    if (idx < 0) {
      gsap.set(caption, { autoAlpha: 0, y: 0 });
      return;
    }
    els.index.textContent = String(idx + 1).padStart(2, "0");
    els.title.textContent = layers[idx].title;
    els.text.textContent = layers[idx].summary;
    gsap.fromTo(caption, { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, duration: device.reducedMotion ? 0 : 0.5, ease: "power2.out" });
  }

  function apply(p) {
    scene.setProgress(p);
    pin.dataset.exploded = smooth(0.12, 0.5, p) > 0.6 ? "true" : "false";
    const h = 1 - smooth(0.03, 0.15, p);
    gsap.set(heroCopy, { autoAlpha: h, y: -24 * (1 - h) });
    gsap.set(cue, { autoAlpha: h });
    const idx = p < 0.52 ? -1 : Math.min(n - 1, Math.floor((p - 0.52) / (0.48 / n)));
    if (idx !== step) { step = idx; scene.setActive(idx); showCaption(idx); if (idx >= 0) scene.playFlow(); }
  }

  const st = ScrollTrigger.create({
    trigger: story, start: "top top", end: "bottom bottom",
    onUpdate: (self) => apply(self.progress),
    onRefresh: (self) => apply(self.progress),
    onLeaveBack: () => apply(0),
  });
  apply(st.progress);
  return st;
}
