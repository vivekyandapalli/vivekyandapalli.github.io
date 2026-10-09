import { el, tags, experienceItem, projectItem } from "./content.js";

/** Conventional, scannable résumé view. Built from the same config as the 3D experience. */
export function renderResume(root, c) {
  const p = c.personal;
  const section = (id, title, body) =>
    body.some(Boolean)
      ? el("section", { id: `r-${id}`, class: "r-sec" }, [
          el("h2", { text: title }),
          ...body,
        ])
      : null;

  const contactItem = (label, value, href, mark, external = false) =>
    value
      ? el("li", { class: "r-contact-item" }, [
          el("span", {
            class: "r-contact-mark",
            "aria-hidden": "true",
            text: mark,
          }),
          el("span", { class: "r-contact-label", text: label }),
          href
            ? el("a", {
                class: "r-contact-value",
                href,
                ...(external ? { target: "_blank", rel: "noopener" } : {}),
                text: value,
              })
            : el("span", { class: "r-contact-value", text: value }),
        ])
      : null;
  const contact = [
    contactItem("Email", p.email, p.email ? `mailto:${p.email}` : null, "@"),
    contactItem(
      "Phone",
      p.phone,
      p.phone ? `tel:${p.phone.replace(/[^+\d]/g, "")}` : null,
      "☎",
    ),
    contactItem("Location", p.location, null, "⌖"),
    ...c.links.map((link) =>
      contactItem(
        link.key === "website" ? "Portfolio" : link.label,
        link.url.replace(/^https?:\/\//, "").replace(/\/$/, ""),
        link.url,
        "↗",
        true,
      ),
    ),
  ].filter(Boolean);

  const skills = c.layers.map((l) => {
    const names = c.skills.filter((s) => s.layer === l.key).map((s) => s.name);
    return names.length
      ? el("div", { class: "skill-group" }, [
          el("h3", { text: l.title }),
          tags(names),
        ])
      : null;
  });
  const credentials = c.certifications.map((cert) =>
    el("div", { class: "r-credential" }, [
      el("span", { class: "r-credential-mark", text: "CERTIFIED" }),
      el("div", {}, [
        el("strong", { text: cert.name }),
        cert.issuer || cert.year
          ? el("span", {
              class: "r-credential-issuer",
              text: [cert.issuer, cert.year].filter(Boolean).join(" · "),
            })
          : null,
      ]),
    ]),
  );

  root.replaceChildren(
    el("div", { class: "r-wrap" }, [
      el("header", { class: "r-head" }, [
        el("div", { class: "r-head-copy" }, [
          el("p", {
            class: "r-eyebrow",
            text: "FULL-STACK · FRONTEND · BACKEND",
          }),
          el("h1", { text: p.name }),
          el("p", { class: "r-title", text: p.title }),
          credentials.length
            ? el(
                "div",
                { class: "r-credentials", "aria-label": "Certifications" },
                credentials,
              )
            : null,
        ]),
        el("address", { class: "r-contact", "aria-label": "Contact details" }, [
          el("p", { class: "r-contact-heading", text: "CONTACT" }),
          el("ul", {}, contact),
        ]),
      ]),
      el("div", { class: "r-layout" }, [
        el("div", { class: "r-main" }, [
          section("summary", "Profile", [
            el("p", { class: "r-lede", text: p.bio }),
            ...p.about.map((t) => el("p", { text: t })),
          ]),
          section(
            "experience",
            "Experience",
            c.experience.length
              ? [
                  el(
                    "ul",
                    { class: "rows" },
                    c.experience.map((e) => experienceItem(c, e)),
                  ),
                ]
              : [],
          ),
          section(
            "projects",
            "Selected projects",
            c.projects.length
              ? [
                  el(
                    "ul",
                    { class: "rows" },
                    c.projects.map((x) => projectItem(c, x)),
                  ),
                ]
              : [],
          ),
        ]),
        el(
          "aside",
          { class: "r-aside", "aria-label": "Additional qualifications" },
          [
            section("skills", "Core skills", skills),
            section(
              "education",
              "Education",
              c.education.length
                ? [
                    el(
                      "ul",
                      { class: "rows" },
                      c.education.map((e) =>
                        el("li", { class: "item" }, [
                          el("h3", { text: e.degree }),
                          el("p", {
                            class: "meta",
                            text: `${e.school} · ${e.start} – ${e.end}`,
                          }),
                        ]),
                      ),
                    ),
                  ]
                : [],
            ),
            section(
              "achievements",
              "Achievements",
              c.achievements.length
                ? [
                    el(
                      "ul",
                      { class: "plain" },
                      c.achievements.map((a) => el("li", { text: a.text })),
                    ),
                  ]
                : [],
            ),
          ],
        ),
      ]),
    ]),
  );
}
