import * as THREE from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { makeMaterials, labelMaterial, palette } from "./materials.js";

export const PLATE = { w: 3.4, d: 2.4 };

const geoCache = new Map();
function rbox(w, h, d, r = 0.04) {
  const key = [w, h, d, r].join();
  if (!geoCache.has(key)) {
    const radius = Math.min(r, Math.min(w, h, d) / 2 - 0.002);
    geoCache.set(key, new RoundedBoxGeometry(w, h, d, 2, radius));
  }
  return geoCache.get(key);
}
const box = (w, h, d) => new THREE.BoxGeometry(w, h, d);

/**
 * Helpers for assembling a layer. `dy` makes a part float upward as the layer
 * explodes; parts further along the list separate slightly later (staggered peel).
 */
function kit(group, m) {
  const parts = [];
  const add = (geo, mat, x, y, z, dy = 0) => {
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(x, y, z);
    group.add(mesh);
    if (dy) parts.push({ mesh, base: y, dy, st: Math.min(0.4, parts.length * 0.02) });
    return mesh;
  };
  /** Text lying flat on a part. Width `w`; height is w/4. */
  const label = (text, x, y, z, w, dy = 0, color) => {
    const mat = labelMaterial(text, color);
    if (!mat) return null;
    const mesh = add(new THREE.PlaneGeometry(w, w / 4).rotateX(-Math.PI / 2), mat, x, y, z, dy);
    mesh.renderOrder = 2; // always drawn after the part underneath, never depends on camera distance
    return mesh;
  };
  const base = (h = 0.12) => {
    add(rbox(PLATE.w, h, PLATE.d, 0.06), m.plate, 0, 0, 0);
    for (const sx of [-1, 1]) for (const sz of [-1, 1])
      add(new THREE.CylinderGeometry(0.045, 0.045, 0.025, 10), m.light, sx * (PLATE.w / 2 - 0.15), h / 2 + 0.012, sz * (PLATE.d / 2 - 0.15));
  };
  return { parts, add, label, base };
}

const kw = (layer, i, fallback) => layer?.keywords?.[i] ?? fallback;
const ACCENT_TEXT = "#bfeeff";

// ---- APPLICATION: a UI window, a dashboard and a component tree ---------------------
function application(group, m, { layer }) {
  const { parts, add, label, base } = kit(group, m);
  base();
  add(rbox(3.0, 0.05, 2.0, 0.05), m.body, 0, 0.1, 0, 0.1);                       // window
  add(rbox(3.0, 0.03, 0.2, 0.02), m.plate, 0, 0.14, -0.9, 0.14);                  // title bar
  [-1.36, -1.26, -1.16].forEach((x, i) => add(new THREE.SphereGeometry(0.035, 12, 8), i ? m.light : m.accent, x, 0.17, -0.9, 0.16));
  add(rbox(1.6, 0.02, 0.09, 0.01), m.light, 0.1, 0.155, -0.9, 0.15);              // address bar
  add(rbox(0.5, 0.03, 1.5, 0.02), m.plate, -1.25, 0.14, 0.05, 0.2);               // sidebar
  [-0.4, -0.15, 0.1].forEach((z, i) => add(rbox(0.34, 0.015, 0.08, 0.006), m.light, -1.25, 0.16, z, 0.22 + i * 0.01));
  [-0.5, 0.3, 1.1].forEach((x, i) => {                                             // cards
    add(rbox(0.7, 0.04, 0.55, 0.02), m.plate, x, 0.15, -0.35, 0.26 + i * 0.05);
    label(kw(layer, i, ["Interface", "Product", "UX"][i]), x, 0.175, -0.35, 0.62, 0.26 + i * 0.05, ACCENT_TEXT);
  });
  [0.1, 0.18, 0.13, 0.24].forEach((h, i) =>                                        // chart
    add(box(0.12, h, 0.12), m.accent, -0.4 + i * 0.2, 0.125 + h / 2, 0.58, 0.3 + i * 0.02));
  add(rbox(0.45, 0.04, 0.18, 0.05), m.accent, 1.1, 0.17, 0.82, 0.36);             // button
  add(box(0.14, 0.04, 0.14), m.accent, 0.7, 0.16, 0.3, 0.34);                     // component tree
  add(box(0.02, 0.02, 0.2), m.light, 0.7, 0.16, 0.4, 0.34);
  add(box(0.36, 0.02, 0.02), m.light, 0.7, 0.16, 0.5, 0.34);
  [0.52, 0.88].forEach((x) => {
    add(box(0.02, 0.02, 0.12), m.light, x, 0.16, 0.56, 0.34);
    add(box(0.12, 0.04, 0.12), m.body, x, 0.16, 0.66, 0.34);
  });
  return { parts, flow: [1.1, 0.22, 0.82] };
}

// ---- PLATFORM: gateway, services, database, message queue ---------------------------
function platform(group, m, { layer }) {
  const { parts, add, label, base } = kit(group, m);
  base();
  add(rbox(1.9, 0.14, 0.5, 0.05), m.body, 0, 0.12, 0.85, 0.08);                   // gateway
  add(box(1.9, 0.02, 0.04), m.accent, 0, 0.2, 1.08, 0.08);
  label(kw(layer, 0, "APIs"), 0, 0.2, 0.85, 0.9, 0.08, ACCENT_TEXT);
  [-1.0, 0, 1.0].forEach((x, i) => {                                               // services
    add(rbox(0.78, 0.16, 0.62, 0.04), m.body, x, 0.13, -0.05, 0.16 + i * 0.05);
    add(new THREE.SphereGeometry(0.03, 10, 8), m.accent, x + 0.28, 0.225, -0.25, 0.16 + i * 0.05);
  });
  label(kw(layer, 2, "Services"), 0, 0.215, -0.05, 0.7, 0.21, ACCENT_TEXT);
  [0.11, 0.2, 0.29].forEach((y, i) =>                                              // database
    add(new THREE.CylinderGeometry(0.38, 0.38, 0.09, 28), i === 2 ? m.light : m.body, -1.0, y, -0.85, 0.02 + i * 0.05));
  label(kw(layer, 1, "Data"), -1.0, 0.345, -0.85, 0.62, 0.12, "#0d1013");
  for (let i = 0; i < 6; i++)                                                      // queue
    add(rbox(0.22, 0.1, 0.14, 0.02), i % 2 ? m.accent : m.body, -0.2 + i * 0.28, 0.11, -0.85, 0.06 + i * 0.01);
  label(kw(layer, 3, "Messaging"), 0.5, 0.065, -1.1, 0.8, 0, "#8d98a7");
  [-1, 0, 1].forEach((x) => add(box(0.025, 0.012, 0.35), m.accent, x, 0.066, 0.42));      // wiring
  [-1.0, 0.5].forEach((x) => add(box(0.025, 0.012, 0.3), m.accent, x, 0.066, -0.52));
  return { parts, flow: [0, 0.22, 0.85] };
}

// ---- INFRASTRUCTURE: cluster of containers, CI/CD pipeline, observability -----------
function infrastructure(group, m, { layer, lite }) {
  const { parts, add, label, base } = kit(group, m);
  base(0.26);
  add(rbox(PLATE.w - 0.3, 0.04, PLATE.d - 0.5, 0.02), m.body, 0, 0.15, 0, 0.05);   // deck
  for (let i = 0; i < (lite ? 6 : 10); i++) add(box(0.1, 0.02, 0.03), m.vent, -0.9 + i * 0.2, 0.132, -1.07);
  [[-1.0, -0.6], [-0.25, -0.6], [0.5, -0.6], [-1.0, 0.05], [-0.25, 0.05], [0.5, 0.05]].forEach(([x, z], i) => {
    const dy = 0.1 + (i % 3) * 0.03;                                               // containers
    add(rbox(0.62, 0.2, 0.5, 0.04), m.body, x, 0.27, z, dy);
    add(rbox(0.5, 0.02, 0.06, 0.01), m.accent, x, 0.38, z + 0.2, dy);
    if (i === 1) label(kw(layer, 1, "Kubernetes"), x, 0.385, z - 0.04, 0.58, dy, ACCENT_TEXT);
    if (i === 2) label(kw(layer, 2, "Docker"), x, 0.385, z - 0.04, 0.58, dy, ACCENT_TEXT);
    if (i === 3) label(kw(layer, 0, "Cloud"), x, 0.385, z - 0.04, 0.58, dy, ACCENT_TEXT);
  });
  [["BUILD", -1.1], ["TEST", -0.4], ["DEPLOY", 0.3]].forEach(([text, x], i) => {   // pipeline
    add(rbox(0.5, 0.1, 0.3, 0.03), i === 2 ? m.accent : m.plate, x, 0.2, 0.85, 0.05);
    label(text, x, 0.255, 0.85, 0.44, 0.05, i === 2 ? "#06141a" : "#dfe8f2");
  });
  [-0.75, -0.05].forEach((x) => add(box(0.2, 0.014, 0.03), m.accent, x, 0.2, 0.85, 0.05));
  add(rbox(0.55, 0.04, 0.8, 0.02), m.body, 1.35, 0.19, -0.3, 0.08);                // observability
  [0.12, 0.26, 0.18].forEach((h, i) => add(box(0.1, h, 0.1), m.accent, 1.2 + i * 0.15, 0.21 + h / 2, -0.3, 0.12));
  label(kw(layer, 4, "Observability"), 1.35, 0.215, -0.62, 0.52, 0.08, "#8d98a7");
  return { parts, flow: [-0.25, 0.42, 0.05] };
}

const BUILDERS = { application, platform, infrastructure };

// ---- Assembly -------------------------------------------------------------------------------
function finalize(key, group, parts, flow = [0, 0.2, 0]) {
  const mats = new Set();
  group.traverse((o) => {
    if (!o.isMesh) return;
    o.userData.layerKey = key;
    (Array.isArray(o.material) ? o.material : [o.material]).forEach((mm) => mats.add(mm));
  });
  // Transparent from the start so fading never switches render pass or recompiles a shader.
  // Solid parts keep depthWrite so overlapping parts can't show through each other mid-fade.
  mats.forEach((mm) => {
    mm.userData.baseOpacity = mm.opacity;
    mm.transparent = true;
    mm.depthWrite = !mm.userData.glass;
  });
  // Invisible hit proxy: makes hover/tap forgiving without affecting rendering.
  const hit = new THREE.Mesh(
    new THREE.BoxGeometry(PLATE.w + 0.3, 0.7, PLATE.d + 0.3),
    new THREE.MeshBasicMaterial({ visible: false })
  );
  hit.position.y = 0.18;
  hit.userData.layerKey = key;
  group.add(hit);
  return { group, parts, mats: [...mats], flow };
}

async function loadModel(url, layers) {
  const { GLTFLoader } = await import("three/addons/loaders/GLTFLoader.js");
  const gltf = await new GLTFLoader().loadAsync(url);
  const map = new Map();
  for (const l of layers) {
    const node = gltf.scene.getObjectByName(l.key);
    if (!node) throw new Error(`GLB has no node named "${l.key}"`);
    const group = new THREE.Group();
    group.add(node);
    node.traverse((o) => { if (o.isMesh) o.material = o.material.clone(); });
    map.set(l.key, finalize(l.key, group, []));
  }
  return map;
}

export async function buildHardware(layers, { lite = false, modelUrl = "" } = {}) {
  const root = new THREE.Group();
  let custom = null;
  if (modelUrl) {
    try { custom = await loadModel(modelUrl, layers); }
    catch (err) { console.warn("[3d] Using the built-in model instead:", err.message); }
  }
  const out = new Map();
  for (const l of layers) {
    let entry = custom?.get(l.key);
    if (!entry) {
      const group = new THREE.Group();
      const mats = makeMaterials(palette[l.key] ?? palette.default);
      const { parts, flow } = (BUILDERS[l.key] ?? platform)(group, mats, { lite, layer: l });
      entry = finalize(l.key, group, parts, flow);
    }
    root.add(entry.group);
    out.set(l.key, entry);
  }
  return { root, layers: out };
}
