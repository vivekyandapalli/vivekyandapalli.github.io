import { el, tags } from "./content.js";

/** The inspection panel: details for one layer, shown while the camera examines it. */
export function createInspector({ root, content: c, onClose, onSwitch }) {
  const $ = (s) => root.querySelector(s);
  const title = $("#insp-title"),
    kicker = $("#insp-kicker"),
    body = $("#insp-body"),
    sw = $("#insp-switch");
  let current = null,
    opener = null;

  $("#insp-close").addEventListener("click", () => onClose());
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && current) onClose();
  });

  const highlights = (items = []) =>
    items.length
      ? el("section", { class: "insp-sec" }, [
          el("h3", { class: "sec-h", text: "What I do" }),
          el(
            "ul",
            { class: "insp-highlights" },
            items.map((text) =>
              el("li", {}, [
                el("span", {
                  class: "insp-highlight-mark",
                  "aria-hidden": "true",
                  text: "↗",
                }),
                el("span", { text }),
              ]),
            ),
          ),
        ])
      : null;

  const experience = (items) =>
    items.length
      ? el("section", { class: "insp-sec insp-experience" }, [
          el("h3", {
            class: "sec-h",
            text: `Experience · ${items.length} ${items.length === 1 ? "role" : "roles"}`,
          }),
          el(
            "ul",
            { class: "insp-roles" },
            items.map((item) =>
              el("li", { class: "insp-role-card" }, [
                el("div", { class: "insp-role-head" }, [
                  el("div", {}, [
                    el("strong", { text: item.role }),
                    el("span", { text: item.company }),
                  ]),
                  el("time", { text: `${item.start}–${item.end}` }),
                ]),
                item.summary
                  ? el("p", { class: "insp-role-summary", text: item.summary })
                  : null,
                item.achievements?.length
                  ? el("details", { class: "insp-role-more" }, [
                      el("summary", {
                        text: `Responsibilities · ${item.achievements.length}`,
                      }),
                      el(
                        "ul",
                        { class: "insp-role-achievements" },
                        item.achievements.map((achievement) =>
                          el("li", {}, [
                            el("span", { text: achievement.text }),
                            achievement.metric
                              ? el("strong", {
                                  class: "metric",
                                  text: achievement.metric,
                                })
                              : null,
                          ]),
                        ),
                      ),
                    ])
                  : null,
              ]),
            ),
          ),
        ])
      : null;

  function render(key) {
    const idx = c.layers.findIndex((l) => l.key === key),
      layer = c.layers[idx];
    const exps = c.experience.filter((e) => e.layer === key),
      projs = c.projects.filter((p) => p.layer === key);
    const toolbox = c.skills.filter((s) => s.layer === key).map((s) => s.name);
    kicker.textContent = `Layer ${String(idx + 1).padStart(2, "0")} of ${String(c.layers.length).padStart(2, "0")}`;
    title.textContent = layer.title;
    root.dataset.layer = key;
    body.replaceChildren(
      ...[
        el("p", {
          class: "lede insp-intro",
          text: layer.description || layer.summary,
        }),
        highlights(layer.highlights),
        toolbox.length
          ? el("section", { class: "insp-sec" }, [
              el("h3", { class: "sec-h", text: "Toolbox" }),
              tags(toolbox),
            ])
          : tags(layer.keywords),
        experience(exps),
        projs.length
          ? el("section", { class: "insp-sec insp-related" }, [
              el("h3", { class: "sec-h", text: "Related work" }),
              el(
                "ul",
                { class: "insp-roles" },
                projs.map((project) =>
                  el("li", { class: "insp-project" }, [
                    el("strong", { text: project.name }),
                    el("span", { text: project.summary }),
                  ]),
                ),
              ),
            ])
          : null,
      ].filter(Boolean),
    );
    sw.replaceChildren(
      ...c.layers.map((l) => {
        const b = el("button", {
          type: "button",
          class: "sw",
          text: l.title,
          "aria-current": l.key === key ? "true" : "false",
        });
        b.addEventListener("click", () => onSwitch(l.key));
        return b;
      }),
    );
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
      body.classList.remove("swap");
      void body.offsetWidth; // restart the fade
      body.classList.add("swap");
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
