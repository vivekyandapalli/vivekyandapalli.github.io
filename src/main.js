import { getContent } from "./utils/config.js";
import { device } from "./utils/device.js";
import { renderMeta, renderChrome, renderAfter } from "./components/page.js";
import { renderResume } from "./components/resume.js";
import { createInspector } from "./components/inspector.js";
import { createOverlay } from "./components/overlay.js";
import { techFor } from "./components/content.js";
import { initScroll } from "./animations/scroll.js";

const content = getContent();
const $ = (s) => document.querySelector(s);
const story = $("#story"), pin = $("#pin"), canvas = $("#gl"), status = $("#gl-status");
const smoothBehavior = () => (device.reducedMotion ? "auto" : "smooth");

let scene = null, overlay = null, inspector = null;
let sceneState = "idle"; // idle | loading | ready | failed
let mode = "explore";
let inspecting = false;

// ---- static content (no 3D needed) ------------------------------------------------
renderMeta(content);
renderChrome(content);
renderResume($("#resume-view"), content);
renderAfter(content, { inspect: (key, id) => inspectFrom(key, id) });

// ---- inspection ---------------------------------------------------------------------
function inspect(key, itemId) {
  if (!scene) return;
  inspecting = true;
  document.body.classList.add("inspecting");
  scene.setFocus(key);
  inspector.open(key, itemId);
  overlay.showChips(scene, key, techFor(content, key));
}

function closeInspect() {
  if (!inspecting) return;
  inspecting = false;
  document.body.classList.remove("inspecting");
  scene?.setFocus(null);
  inspector?.close();
  overlay?.clearChips();
}

/** From a list item further down the page: jump back to the end of the teardown, then inspect. */
function inspectFrom(key, itemId) {
  if (sceneState !== "ready") return;
  window.scrollTo({ top: story.offsetTop + story.offsetHeight - innerHeight, behavior: "instant" });
  requestAnimationFrame(() => inspect(key, itemId));
}

// ---- 3D (lazy) --------------------------------------------------------------------------
async function ensureScene() {
  if (sceneState !== "idle") return;
  sceneState = "loading";
  status.hidden = false;
  try {
    const n = content.layers.length;
    story.style.height = `${(device.isMobile ? 220 : 300) + n * (device.isMobile ? 60 : 80)}vh`;
    const { createScene } = await import("./3d/scene.js");
    scene = await createScene({ canvas, layers: content.layers, modelUrl: content.model?.url });

    overlay = createOverlay({
      labelsRoot: $("#labels"), chipsRoot: $("#chips"), layers: content.layers,
      onSelect: inspect, onHover: (k) => scene.setHover(k),
    });
    inspector = createInspector({
      root: $("#inspector"), content, onClose: closeInspect, onSwitch: (k) => inspect(k),
    });
    scene.on("render", () => overlay.update(scene));
    scene.on("hover", (k) => overlay.setHover(k));
    scene.on("select", (k) => inspect(k));

    initScroll({
      story, pin, heroCopy: $("#hero-copy"), cue: $("#scroll-cue"), caption: $("#caption"),
      layers: content.layers, scene,
    });
    // Stop rendering entirely while the teardown is off-screen.
    new IntersectionObserver(([e]) => (e.isIntersecting ? scene.resume() : scene.pause())).observe(story);

    sceneState = "ready";
    pin.classList.add("ready");
    status.hidden = true;
  } catch (err) {
    console.error("[portfolio] 3D unavailable:", err);
    sceneState = "failed";
    document.body.classList.add("no3d");
    $("#resume-note").hidden = false;
    setMode("resume");
  }
}

// ---- modes ----------------------------------------------------------------------------------
function setMode(next) {
  mode = next;
  const resume = next === "resume";
  document.body.classList.toggle("mode-resume", resume);
  $("#explore-view").hidden = resume;
  $("#resume-view").hidden = !resume;
  const toggle = $("#mode-toggle");
  toggle.textContent = resume ? "Explore view" : "Resume view";
  toggle.setAttribute("aria-pressed", String(resume));
  closeInspect();
  history.replaceState(null, "", resume ? "#resume" : location.pathname + location.search);
  window.scrollTo({ top: 0, behavior: "instant" });
  if (resume) scene?.pause();
  else ensureScene().then(() => window.ScrollTrigger?.refresh());
}

function navigate(id) {
  if (id === "resume") return setMode("resume");
  if (id === "explore") {
    if (mode === "resume") setMode("explore");
    closeInspect();
    return window.scrollTo({ top: 0, behavior: smoothBehavior() });
  }
  closeInspect();
  const resumeIds = { experience: "r-experience", projects: "r-projects", about: "r-summary" };
  document.getElementById(mode === "resume" ? resumeIds[id] : id)?.scrollIntoView({ behavior: smoothBehavior() });
}

document.addEventListener("click", (e) => {
  const a = e.target.closest("[data-nav]");
  if (!a) return;
  e.preventDefault();
  a.closest("details")?.removeAttribute("open");
  navigate(a.dataset.nav);
});
$("#mode-toggle").addEventListener("click", () => setMode(mode === "resume" ? "explore" : "resume"));

// ---- boot ---------------------------------------------------------------------------------------
const startInResume = location.hash === "#resume" || device.saveData || content.layers.length === 0;
if (startInResume) {
  mode = "resume";
  document.body.classList.add("mode-resume");
  $("#explore-view").hidden = true;
  $("#resume-view").hidden = false;
  $("#mode-toggle").textContent = "Explore view";
  $("#mode-toggle").setAttribute("aria-pressed", "true");
  if (content.layers.length === 0) $("#mode-toggle").hidden = true;
} else {
  ensureScene();
}
