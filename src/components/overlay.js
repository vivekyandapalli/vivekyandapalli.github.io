import { el } from "./content.js";

/** HTML labels and technology chips that follow 3D anchor points. Labels are real buttons (keyboard accessible). */
export function createOverlay({ labelsRoot, chipsRoot, layers, onSelect, onHover }) {
  const labels = new Map();
  layers.forEach((l, i) => {
    const b = el("button", { class: "label", type: "button", "data-layer": l.key, "aria-label": `Inspect ${l.title} layer` }, [
      el("span", { class: "idx", text: String(i + 1).padStart(2, "0") }),
      el("span", { class: "name", text: l.title }),
      el("span", { class: "dot", "aria-hidden": "true" }),
    ]);
    b.addEventListener("click", () => onSelect(l.key));
    b.addEventListener("pointerenter", () => onHover(l.key));
    b.addEventListener("pointerleave", () => onHover(null));
    b.addEventListener("focus", () => onHover(l.key));
    b.addEventListener("blur", () => onHover(null));
    labelsRoot.append(b);
    labels.set(l.key, b);
  });

  let chips = [];
  const px = (n) => n.toFixed(1);
  return {
    update(scene) {
      for (const [key, b] of labels) {
        const p = scene.project(key, [1.85, 0.12, 0]);
        b.style.transform = `translate(${px(p.x)}px,${px(p.y)}px) translate(14px,-50%)`;
      }
      for (const c of chips) {
        const p = scene.project(c.key, c.at);
        c.node.style.transform = `translate(${px(p.x)}px,${px(p.y)}px) translate(-50%,-50%)`;
      }
    },
    setHover(key) { labels.forEach((b, k) => b.classList.toggle("is-hover", k === key)); },
    showChips(scene, key, techs) {
      this.clearChips();
      const list = techs.slice(0, 8);
      chips = list.map((t, i) => {
        const a = (i / list.length) * Math.PI * 2 + 0.4;
        const node = el("span", { class: "chip", text: t });
        chipsRoot.append(node);
        requestAnimationFrame(() => node.classList.add("in"));
        return { key, at: [Math.cos(a) * 2.55, 0.25, Math.sin(a) * 1.95], node };
      });
      scene.requestRender();
    },
    clearChips() { chips.forEach((c) => c.node.remove()); chips = []; },
  };
}
