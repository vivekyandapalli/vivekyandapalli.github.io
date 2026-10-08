import { el, tags, experienceItem, projectItem } from "./content.js";

const $ = (id) => document.getElementById(id);

export function renderMeta(c) {
  document.title = c.site.title;
  const set = (sel, attr, val) => document.querySelector(sel)?.setAttribute(attr, val);
  set('meta[name="description"]', "content", c.site.description);
  set('meta[property="og:title"]', "content", c.site.title);
  set('meta[property="og:description"]', "content", c.site.description);
  if (c.site.url) { set('meta[property="og:url"]', "content", c.site.url); set('link[rel="canonical"]', "href", c.site.url); }
  if (c.site.image) {
    const url = new URL(c.site.image, c.site.url || location.href).href;
    document.head.append(el("meta", { property: "og:image", content: url }), el("meta", { name: "twitter:image", content: url }));
  }
}

export function renderChrome(c) {
  $("brand").textContent = c.personal.name;
  $("hero-name").textContent = c.personal.name;
  $("hero-title").textContent = c.personal.title;
  $("hero-tagline").textContent = c.personal.tagline;

  const items = [["explore", "Explore"], ["experience", "Experience"], ["projects", "Projects"], ["about", "About"], ["resume", "Resume"]]
    .filter(([id]) => (id !== "experience" || c.experience.length) && (id !== "projects" || c.projects.length));
  const link = ([id, label]) => el("a", { href: `#${id}`, "data-nav": id, text: label });
  const social = c.links.filter((l) => l.key !== "resume")
    .map((l) => el("a", { href: l.url, text: l.label, rel: "noopener", target: "_blank" }));

  $("nav-links").replaceChildren(...items.map(link));
  $("nav-social").replaceChildren(...social.map((a) => a.cloneNode(true)));
  $("menu-links").replaceChildren(...items.map(link), ...social);
}

/** Sections below the 3D story. `inspect(layerKey, itemId)` flies the camera to that layer. */
export function renderAfter(c, { inspect }) {
  $("layers-list").replaceChildren(...c.layers.map((l) => {
    const btn = el("button", { class: "link-btn inspect-btn", type: "button", text: `Inspect ${l.title} →` });
    btn.addEventListener("click", () => inspect(l.key));
    return el("li", { class: "card", "data-layer": l.key }, [
      el("h3", { text: l.title }), el("p", { text: l.summary }), tags(l.keywords), btn,
    ]);
  }));
  $("experience-list").replaceChildren(...c.experience.map((e) => experienceItem(c, e, { onInspect: () => inspect(e.layer, e.id) })));
  $("projects-list").replaceChildren(...c.projects.map((p) => projectItem(c, p, { onInspect: () => inspect(p.layer, p.id) })));
  $("about-text").replaceChildren(el("p", { text: c.personal.bio }), ...c.personal.about.map((t) => el("p", { text: t })));
  $("experience").hidden = !c.experience.length;
  $("projects").hidden = !c.projects.length;

  const pdf = c.links.find((l) => l.key === "resume");
  $("contact-links").replaceChildren(
    el("a", { class: "btn", href: `mailto:${c.personal.email}`, text: "Email me" }),
    ...(pdf ? [el("a", { class: "btn ghost", href: pdf.url, text: pdf.label })] : []),
    ...c.links.filter((l) => l.key !== "resume").map((l) => el("a", { class: "btn ghost", href: l.url, target: "_blank", rel: "noopener", text: l.label }))
  );
  $("footer-text").textContent = `© ${new Date().getFullYear()} ${c.personal.name}`;
}
