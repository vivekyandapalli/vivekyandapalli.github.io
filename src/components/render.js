const el = (tag, attrs = {}, children = []) => {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === "text") node.textContent = v;
    else if (v !== undefined && v !== null) node.setAttribute(k, v);
  }
  [].concat(children).forEach((c) => c && node.append(c));
  return node;
};

export function renderMeta(c) {
  document.title = c.site.title;
  document.querySelector('meta[name="description"]')?.setAttribute("content", c.site.description);
  document.querySelector('meta[property="og:title"]')?.setAttribute("content", c.site.title);
  document.querySelector('meta[property="og:description"]')?.setAttribute("content", c.site.description);
}

export function renderHero(c) {
  document.getElementById("hero-name").textContent = c.personal.name;
  document.getElementById("hero-title").textContent = c.personal.title;
  document.getElementById("hero-tagline").textContent = c.personal.tagline;
  document.getElementById("brand").textContent = c.personal.name;

  // Placeholder stack. Phase 2 replaces this with the Three.js scene, driven by the same layer list.
  const stack = document.getElementById("stage-stack");
  stack.replaceChildren(
    ...c.layers.map((l) =>
      el("li", { class: "slab", "data-layer": l.key }, [el("span", { text: l.title })])
    )
  );
}

export function renderNav(c) {
  const nav = document.getElementById("nav-links");
  nav.replaceChildren(
    ...[["explore", "Explore"], ["experience", "Experience"], ["projects", "Projects"], ["about", "About"], ["resume", "Resume"]]
      .map(([id, label]) => el("a", { href: `#${id}`, text: label }))
  );
  const social = document.getElementById("nav-social");
  social.replaceChildren(
    ...c.links.filter((l) => l.key !== "resume").map((l) =>
      el("a", { href: l.url, text: l.label, rel: "noopener", target: "_blank" })
    )
  );
}

const tags = (list) => el("ul", { class: "tags" }, list.map((t) => el("li", { text: t })));

export function renderSections(c) {
  const layerTitle = (k) => c.layers.find((l) => l.key === k)?.title ?? "";

  document.getElementById("layers-list").replaceChildren(
    ...c.layers.map((l) =>
      el("li", { "data-layer": l.key }, [
        el("h3", { text: l.title }),
        el("p", { text: l.summary }),
        tags(l.keywords ?? []),
      ])
    )
  );

  document.getElementById("experience-list").replaceChildren(
    ...c.experience.map((e) =>
      el("li", { "data-layer": e.layer }, [
        el("p", { class: "meta", text: `${layerTitle(e.layer)} · ${e.start} – ${e.end}` }),
        el("h3", { text: `${e.role}, ${e.company}` }),
        el("p", { text: e.summary }),
        tags(e.technologies ?? []),
      ])
    )
  );

  document.getElementById("projects-list").replaceChildren(
    ...c.projects.map((p) =>
      el("li", { "data-layer": p.layer }, [
        el("p", { class: "meta", text: layerTitle(p.layer) }),
        el("h3", { text: p.name }),
        el("p", { text: p.summary }),
        tags(p.technologies ?? []),
      ])
    )
  );

  document.getElementById("about-text").replaceChildren(
    ...c.personal.about.map((t) => el("p", { text: t }))
  );

  const resume = c.links.find((l) => l.key === "resume");
  document.getElementById("resume-links").replaceChildren(
    el("a", { class: "btn", href: `mailto:${c.personal.email}`, text: "Email me" }),
    ...(resume ? [el("a", { class: "btn ghost", href: resume.url, text: resume.label })] : [])
  );

  // Hide sections that have no content after filtering.
  for (const [id, n] of [["experience", c.experience.length], ["projects", c.projects.length]]) {
    document.getElementById(id).hidden = n === 0;
  }
}
