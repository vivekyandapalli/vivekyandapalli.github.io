/** Shared DOM builders used by the explore sections, the inspector and resume mode. */
export const el = (tag, attrs = {}, kids = []) => {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === "text") node.textContent = v;
    else if (v !== undefined && v !== null && v !== "") node.setAttribute(k, v);
  }
  [].concat(kids).forEach((c) => c && node.append(c));
  return node;
};

export const tags = (list) =>
  list?.length ? el("ul", { class: "tags" }, list.map((t) => el("li", { text: t }))) : null;

export const layerTitle = (c, key) => c.layers.find((l) => l.key === key)?.title ?? "";

/** Unique technologies tied to a layer: used for the chips around the inspected component. */
export function techFor(c, key) {
  const set = new Set();
  c.experience.filter((e) => e.layer === key).forEach((e) => e.technologies?.forEach((t) => set.add(t)));
  c.projects.filter((p) => p.layer === key).forEach((p) => p.technologies?.forEach((t) => set.add(t)));
  c.skills.filter((s) => s.layer === key).forEach((s) => set.add(s.name));
  return [...set];
}

const inspectBtn = (onInspect) =>
  onInspect ? el("button", { class: "link-btn inspect-btn", type: "button", text: "Inspect in 3D →" }) : null;

function withInspect(li, btn, onInspect) {
  if (btn) { btn.addEventListener("click", onInspect); li.append(btn); }
  return li;
}

export function experienceItem(c, e, { onInspect } = {}) {
  const wins = (e.achievements ?? []).map((a) =>
    el("li", {}, [el("span", { text: a.text }), a.metric ? el("strong", { class: "metric", text: a.metric }) : null])
  );
  const li = el("li", { class: "item", "data-id": e.id, "data-layer": e.layer }, [
    el("p", { class: "meta", text: `${layerTitle(c, e.layer)} · ${e.start} – ${e.end}` }),
    el("h3", { text: `${e.role} · ${e.company}` }),
    e.summary ? el("p", { text: e.summary }) : null,
    wins.length ? el("ul", { class: "wins" }, wins) : null,
    tags(e.technologies),
  ]);
  return withInspect(li, inspectBtn(onInspect), onInspect);
}

export function projectItem(c, p, { onInspect } = {}) {
  const links = Object.entries(p.links ?? {}).filter(([, u]) => u)
    .map(([k, u]) => el("a", { class: "link-btn", href: u, target: "_blank", rel: "noopener", text: k === "source" ? "Source ↗" : "Live ↗" }));
  const li = el("li", { class: "item", "data-id": p.id, "data-layer": p.layer }, [
    el("p", { class: "meta", text: layerTitle(c, p.layer) }),
    el("h3", { text: p.name }),
    el("p", { text: p.summary }),
    tags(p.technologies),
    architecture(p.architecture),
    links.length ? el("div", { class: "row-links" }, links) : null,
  ]);
  return withInspect(li, inspectBtn(onInspect), onInspect);
}

// ---- Architecture diagram: an image, or an SVG generated from `flow` --------------
const NS = "http://www.w3.org/2000/svg";
const svg = (tag, attrs) => {
  const n = document.createElementNS(NS, tag);
  for (const [k, v] of Object.entries(attrs)) n.setAttribute(k, v);
  return n;
};

export function architecture(arch) {
  if (!arch || arch.enabled === false) return null;
  const fig = el("figure", { class: "arch" });
  if (arch.image) {
    fig.append(el("img", { src: arch.image, alt: arch.alt || "Architecture diagram", loading: "lazy" }));
  } else if (arch.flow?.length) {
    const w = 320, h = 34, gap = 22, n = arch.flow.length, H = n * h + (n - 1) * gap;
    const s = svg("svg", { viewBox: `0 0 ${w} ${H}`, role: "img", "aria-label": "Architecture: " + arch.flow.join(", then ") });
    arch.flow.forEach((label, i) => {
      const y = i * (h + gap);
      s.append(svg("rect", { x: 1, y: y + 1, width: w - 2, height: h - 2, rx: 8, class: "arch-node" }));
      const t = svg("text", { x: w / 2, y: y + h / 2 + 4, "text-anchor": "middle", class: "arch-label" });
      t.textContent = label;
      s.append(t);
      if (i < n - 1) {
        const b = y + h;
        s.append(svg("path", { d: `M${w / 2} ${b} v${gap - 6}`, class: "arch-line" }),
                 svg("path", { d: `M${w / 2 - 4} ${b + gap - 8} l4 6 l4 -6`, class: "arch-line" }));
      }
    });
    fig.append(s);
  } else return null;
  if (arch.description) fig.append(el("figcaption", { text: arch.description }));
  return fig;
}
