import { el, tags, experienceItem, projectItem } from "./content.js";

/** The inspection panel: details for one layer, shown while the camera examines it. */
export function createInspector({ root, content: c, onClose, onSwitch }) {
  const $ = (s) => root.querySelector(s);
  const title = $("#insp-title"), kicker = $("#insp-kicker"), body = $("#insp-body"), sw = $("#insp-switch");
  let current = null, opener = null;

  $("#insp-close").addEventListener("click", () => onClose());
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && current) onClose(); });

  const block = (heading, items) => items.length
    ? el("section", { class: "insp-sec" }, [el("h3", { class: "sec-h", text: heading }), el("ul", { class: "rows" }, items)]) : null;

  function render(key) {
    const idx = c.layers.findIndex((l) => l.key === key), layer = c.layers[idx];
    const exps = c.experience.filter((e) => e.layer === key), projs = c.projects.filter((p) => p.layer === key);
    kicker.textContent = `Layer ${String(idx + 1).padStart(2, "0")} of ${String(c.layers.length).padStart(2, "0")}`;
    title.textContent = layer.title;
    body.replaceChildren(...[
      el("p", { class: "lede", text: layer.description }),
      tags(layer.keywords),
      block("Experience", exps.map((e) => experienceItem(c, e))),
      block("Projects", projs.map((p) => projectItem(c, p))),
      !exps.length && !projs.length ? el("p", { class: "muted", text: "Nothing here yet. Add items in config/portfolio.js." }) : null,
    ].filter(Boolean));
    sw.replaceChildren(...c.layers.map((l) => {
      const b = el("button", { type: "button", class: "sw", text: l.title, "aria-current": l.key === key ? "true" : "false" });
      b.addEventListener("click", () => onSwitch(l.key));
      return b;
    }));
  }

  return {
    open(key, itemId) {
      const first = !current;
      if (first) opener = document.activeElement;
      current = key;
      render(key);
      root.classList.add("open");
      root.setAttribute("aria-hidden", "false");
      body.scrollTop = 0;
      if (first) title.focus({ preventScroll: true });
      if (itemId) {
        const node = body.querySelector(`[data-id="${CSS.escape(itemId)}"]`);
        node?.classList.add("is-selected");
        node?.scrollIntoView({ block: "center" });
      }
    },
    close() {
      current = null;
      root.classList.remove("open");
      root.setAttribute("aria-hidden", "true");
      opener?.focus?.({ preventScroll: true });
      opener = null;
    },
  };
}
