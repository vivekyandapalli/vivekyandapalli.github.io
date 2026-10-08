import { el, tags, experienceItem, projectItem } from "./content.js";

/** Conventional, scannable résumé view. Built from the same config as the 3D experience. */
export function renderResume(root, c) {
  const p = c.personal;
  const section = (id, title, body) => body.some(Boolean)
    ? el("section", { id: `r-${id}`, class: "r-sec" }, [el("h2", { text: title }), ...body]) : null;

  const contact = [
    el("a", { href: `mailto:${p.email}`, text: p.email }),
    p.location ? el("span", { text: p.location }) : null,
    ...c.links.map((l) => el("a", { href: l.url, target: "_blank", rel: "noopener", text: l.label })),
  ].filter(Boolean);

  const skills = c.layers.map((l) => {
    const names = c.skills.filter((s) => s.layer === l.key).map((s) => s.name);
    return names.length ? el("div", { class: "skill-group" }, [el("h3", { text: l.title }), tags(names)]) : null;
  });

  root.replaceChildren(el("div", { class: "r-wrap" }, [
    el("header", { class: "r-head" }, [
      el("h1", { text: p.name }), el("p", { class: "r-title", text: p.title }), el("p", { class: "r-contact" }, contact),
    ]),
    section("summary", "Summary", [el("p", { text: p.bio }), ...p.about.map((t) => el("p", { text: t }))]),
    section("experience", "Experience", [el("ul", { class: "rows" }, c.experience.map((e) => experienceItem(c, e)))]),
    section("projects", "Projects", [el("ul", { class: "rows" }, c.projects.map((x) => projectItem(c, x)))]),
    section("skills", "Skills", skills),
    section("education", "Education", [el("ul", { class: "rows" }, c.education.map((e) =>
      el("li", { class: "item" }, [el("h3", { text: e.degree }), el("p", { class: "meta", text: `${e.school} · ${e.start} – ${e.end}` })])))]),
    section("achievements", "Achievements", [el("ul", { class: "plain" }, c.achievements.map((a) => el("li", { text: a.text })))]),
    section("certifications", "Certifications", [el("ul", { class: "plain" }, c.certifications.map((x) =>
      el("li", {}, [x.url ? el("a", { href: x.url, text: x.name, target: "_blank", rel: "noopener" }) : el("span", { text: x.name }),
        el("span", { class: "meta", text: ` · ${x.issuer ?? ""} ${x.year ?? ""}` })])))]),
    section("contact", "Contact", [el("p", { class: "r-contact" }, contact)]),
  ]));
}
