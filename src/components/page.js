import { el } from "./content.js";

const $ = (id) => document.getElementById(id);

export function renderMeta(c) {
  document.title = c.site.title;
  const set = (sel, attr, val) =>
    document.querySelector(sel)?.setAttribute(attr, val);
  set('meta[name="description"]', "content", c.site.description);
  set('meta[property="og:title"]', "content", c.site.title);
  set('meta[property="og:description"]', "content", c.site.description);
  if (c.site.url) {
    set('meta[property="og:url"]', "content", c.site.url);
    set('link[rel="canonical"]', "href", c.site.url);
  }
  if (c.site.image) {
    const url = new URL(c.site.image, c.site.url || location.href).href;
    document.head.append(
      el("meta", { property: "og:image", content: url }),
      el("meta", { name: "twitter:image", content: url }),
    );
  }
}

export function renderChrome(c) {
  const initials = c.personal.name
    .trim()
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  $("brand").setAttribute("aria-label", `${c.personal.name} — home`);
  $("brand").replaceChildren(
    el("span", { class: "brand-mark", "aria-hidden": "true", text: initials }),
    el("span", { class: "brand-name", text: c.personal.name }),
  );
  $("hero-name").textContent = c.personal.name;
  $("hero-title").textContent = c.personal.title;
  $("hero-tagline").textContent = c.personal.tagline;

  const items = [
    ["explore", "Explore"],
    ["experience", "Experience"],
    ["projects", "Projects"],
    ["about", "About"],
    ["resume", "Resume"],
  ].filter(
    ([id]) =>
      (id !== "experience" || c.experience.length) &&
      (id !== "projects" || c.projects.length),
  );
  const link = ([id, label]) =>
    el("a", { href: `#${id}`, "data-nav": id, text: label });
  const social = c.links
    .filter((l) => l.key !== "resume")
    .map((l) =>
      el("a", {
        href: l.url,
        text: l.label,
        rel: "noopener",
        target: "_blank",
      }),
    );

  $("nav-links").replaceChildren(...items.map(link));
  $("nav-social").replaceChildren(...social.map((a) => a.cloneNode(true)));
  $("menu-links").replaceChildren(...items.map(link), ...social);
}
