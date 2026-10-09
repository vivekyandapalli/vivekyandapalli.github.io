import { el, tags, layerTitle, architecture } from "./content.js";
import { device } from "../utils/device.js";

const $ = (id) => document.getElementById(id);
const pad = (n) => String(n).padStart(2, "0");
const R = "1"; // value for data-reveal (el() skips empty attribute values)
const refresh = () => window.ScrollTrigger?.refresh();

const layerPill = (c, key) =>
  el("span", { class: "layer-pill", text: layerTitle(c, key) });
function inspectButton(onClick, text = "Inspect in 3D →") {
  const b = el("button", {
    class: "link-btn inspect-btn",
    type: "button",
    text,
  });
  b.addEventListener("click", onClick);
  return b;
}

/** Page sections that sit below the 3D teardown. All content comes from the config. */
export function renderSections(c, { inspect }) {
  bands(c, inspect);
  timeline(c, inspect);
  projects(c, inspect);
  about(c);
  contact(c);
  $("experience").hidden = !c.experience.length;
  $("projects").hidden = !c.projects.length;
  document
    .querySelectorAll("#after .sec:not([hidden]) .num")
    .forEach((n, i) => {
      n.textContent = pad(i + 1);
    });
  $("footer-text").textContent =
    `© ${new Date().getFullYear()} ${c.personal.name}`;
  spotlight();
}

// ---- The stack: one band per layer ----------------------------------------------------
function bands(c, inspect) {
  $("layers-list").replaceChildren(
    ...c.layers.map((l, i) => {
      const skills = c.skills
        .filter((s) => s.layer === l.key)
        .map((s) => s.name);
      return el(
        "li",
        { class: "band spot", "data-layer": l.key, "data-reveal": R },
        [
          el("span", {
            class: "band-num",
            "aria-hidden": "true",
            text: pad(i + 1),
          }),
          el("div", { class: "band-main" }, [
            el("h3", { text: l.title }),
            el("p", { text: l.description || l.summary }),
            tags(l.keywords),
          ]),
          skills.length
            ? el("div", { class: "band-skills" }, [
                el("p", { class: "mono-label", text: "Toolbox" }),
                tags(skills),
              ])
            : null,
          inspectButton(() => inspect(l.key)),
        ],
      );
    }),
  );
}

// ---- Experience: a build log timeline, coloured by layer -------------------------------
function timeline(c, inspect) {
  const list = $("experience-list");
  list.replaceChildren(
    ...c.experience.map((e) => {
      const wins = (e.achievements ?? []).map((a) =>
        el("li", {}, [
          a.metric ? el("span", { class: "metric", text: a.metric }) : null,
          el("span", { text: a.text }),
        ]),
      );
      const card = el("article", { class: "tl-card spot" }, [
        layerPill(c, e.layer),
        el("h3", { text: e.role }),
        el("p", { class: "tl-company", text: e.company }),
        e.summary ? el("p", { class: "tl-summary", text: e.summary }) : null,
        wins.length ? el("ul", { class: "wins" }, wins) : null,
        tags(e.technologies),
        inspectButton(() => inspect(e.layer, e.id)),
      ]);
      return el(
        "li",
        { class: "tl-item", "data-layer": e.layer, "data-reveal": R },
        [
          el("p", { class: "tl-when", text: `${e.start} — ${e.end}` }),
          el("span", { class: "tl-node", "aria-hidden": "true" }),
          card,
        ],
      );
    }),
  );
  filterBar("experience-filter", c, list, ".tl-item");
}

// ---- Projects: spotlight cards --------------------------------------------------------------
function projects(c, inspect) {
  const list = $("projects-list");
  list.replaceChildren(
    ...c.projects.map((p, i) => {
      const links = Object.entries(p.links ?? {})
        .filter(([, u]) => u)
        .map(([k, u]) =>
          el("a", {
            class: "link-btn",
            href: u,
            target: "_blank",
            rel: "noopener",
            text: k === "source" ? "Source ↗" : "Live ↗",
          }),
        );
      const fig = architecture(p.architecture);
      return el(
        "li",
        {
          class:
            "proj spot" + (i === 0 && c.projects.length > 2 ? " feature" : ""),
          "data-layer": p.layer,
          "data-reveal": R,
        },
        [
          layerPill(c, p.layer),
          el("h3", { text: p.name }),
          el("p", { class: "proj-summary", text: p.summary }),
          tags(p.technologies),
          fig
            ? el("details", { class: "arch-toggle" }, [
                el("summary", { text: "Architecture" }),
                fig,
              ])
            : null,
          el("div", { class: "proj-foot" }, [
            ...links,
            inspectButton(() => inspect(p.layer, p.id)),
          ]),
        ],
      );
    }),
  );
  filterBar("projects-filter", c, list, ".proj");
}

/** Segmented control that shows only items from one layer. Hidden when there's nothing to filter. */
function filterBar(containerId, c, list, itemSelector) {
  const box = $(containerId);
  const keys = [
    ...new Set(
      [...list.querySelectorAll(itemSelector)].map((n) => n.dataset.layer),
    ),
  ].filter(Boolean);
  box.replaceChildren();
  if (keys.length < 2) return;
  box.setAttribute("role", "group");
  box.setAttribute("aria-label", "Filter by layer");
  const buttons = ["all", ...keys].map((key) => {
    const b = el("button", {
      type: "button",
      class: "fbtn",
      "aria-pressed": String(key === "all"),
      text: key === "all" ? "All" : layerTitle(c, key),
    });
    if (key !== "all") b.dataset.layer = key;
    b.addEventListener("click", () => {
      buttons.forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
      list.querySelectorAll(itemSelector).forEach((n) => {
        n.hidden = key !== "all" && n.dataset.layer !== key;
      });
      refresh();
    });
    return b;
  });
  box.append(...buttons);
}

// ---- About: statement + datasheet -------------------------------------------------------------
function about(c) {
  const p = c.personal;
  $("about-text").replaceChildren(
    el("p", { class: "lead", text: p.bio }),
    ...p.about.map((t) => el("p", { text: t })),
  );
  const rows = [
    ["Name", p.name],
    ["Role", p.title],
    ["Location", p.location],
    ["Email", p.email],
    ["Focus", c.layers.map((l) => l.title).join(" · ")],
  ].filter(([, v]) => v);
  const group = (title, items) =>
    items.length
      ? el("div", { class: "spec-group" }, [
          el("p", { class: "mono-label", text: title }),
          el(
            "ul",
            {},
            items.map((t) => el("li", { text: t })),
          ),
        ])
      : null;
  $("spec-sheet").replaceChildren(
    el("div", { class: "spec-card spot" }, [
      el("div", { class: "spec-head" }, [
        el("span", { class: "mono-label", text: "Spec sheet" }),
        el("span", { class: "led", "aria-hidden": "true" }),
      ]),
      p.profileImage?.enabled
        ? el("img", {
            class: "spec-img",
            src: p.profileImage.src,
            alt: p.profileImage.alt || p.name,
            loading: "lazy",
          })
        : null,
      el(
        "dl",
        { class: "spec-rows" },
        rows.flatMap(([k, v]) => [
          el("dt", { text: k }),
          el("dd", { text: v }),
        ]),
      ),
      group(
        "Education",
        c.education.map(
          (e) => `${e.degree} — ${e.school}, ${e.start}–${e.end}`,
        ),
      ),
      group(
        "Achievements",
        c.achievements.map((a) => a.text),
      ),
      group(
        "Certifications",
        c.certifications.map((x) =>
          [x.name, x.issuer, x.year].filter(Boolean).join(" · "),
        ),
      ),
    ]),
  );
}

// ---- Contact ------------------------------------------------------------------------------------
function contact(c) {
  const p = c.personal;
  const copy = el("button", {
    class: "copy-btn",
    type: "button",
    text: "Copy email",
  });
  const status = el("span", { class: "sr-only", role: "status" });
  copy.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(p.email);
      copy.textContent = "Copied ✓";
      status.textContent = "Email copied";
    } catch {
      copy.textContent = "Copy failed";
    }
    setTimeout(() => {
      copy.textContent = "Copy email";
      status.textContent = "";
    }, 1800);
  });
  const pdf = c.links.find((l) => l.key === "resume");
  $("contact-body").replaceChildren(
    ...[
      el("div", { class: "mail-row" }, [
        el("a", {
          class: "mail-big",
          href: `mailto:${p.email}`,
          text: p.email,
        }),
        copy,
        status,
      ]),
      p.availability?.enabled
        ? el("p", { class: "avail", text: p.availability.text })
        : null,
      el("div", { class: "pills" }, [
        ...(p.phone
          ? [
              el("a", {
                class: "pill-link",
                href: `tel:${p.phone.replace(/[^+\d]/g, "")}`,
                text: `Call ${p.phone}`,
              }),
            ]
          : []),
        ...c.links
          .filter((l) => l.key !== "resume")
          .map((l) =>
            el("a", {
              class: "pill-link",
              href: l.url,
              target: "_blank",
              rel: "noopener",
              text: `${l.label} ↗`,
            }),
          ),
        ...(pdf
          ? [
              el("a", {
                class: "pill-link",
                href: pdf.url,
                text: `${pdf.label} ↓`,
              }),
            ]
          : []),
      ]),
    ].filter(Boolean),
  );
}

/** Soft light that follows the cursor over cards (fine pointers only). */
function spotlight() {
  if (!device.finePointer) return;
  $("after").addEventListener(
    "pointermove",
    (e) => {
      const t = e.target.closest(".spot");
      if (!t) return;
      const r = t.getBoundingClientRect();
      t.style.setProperty("--mx", `${e.clientX - r.left}px`);
      t.style.setProperty("--my", `${e.clientY - r.top}px`);
    },
    { passive: true },
  );
}
