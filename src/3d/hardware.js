import * as THREE from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { makeMaterials, palette } from "./materials.js";

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

/** `add` places a mesh; `dy` > 0 makes it float upward as the layer explodes. */
function kit(group) {
  const parts = [];
  const add = (geo, mat, x, y, z, dy = 0) => {
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(x, y, z);
    group.add(mesh);
    if (dy) parts.push({ mesh, base: y, dy });
    return mesh;
  };
  return { parts, add };
}

// ---- Layer builders ---------------------------------------------------------
function application(group, m) {
  const { parts, add } = kit(group);
  const { w, d } = PLATE;
  add(rbox(w, 0.12, d, 0.06), m.plate, 0, 0, 0);
  add(rbox(w - 0.3, 0.035, d - 0.3, 0.03), m.glass, 0, 0.1, 0, 0.1);
  add(rbox(2.7, 0.03, 0.16, 0.012), m.accent, 0, 0.15, -0.82, 0.22);
  [-1.0, 0, 1.0].forEach((x, i) => add(rbox(0.82, 0.05, 0.62, 0.02), m.body, x, 0.15, -0.15, 0.3 + i * 0.05));
  add(rbox(2.4, 0.025, 0.1, 0.01), m.light, 0, 0.14, 0.62, 0.2);
  add(rbox(1.7, 0.025, 0.1, 0.01), m.light, -0.35, 0.14, 0.82, 0.24);
  add(rbox(0.5, 0.03, 0.2, 0.04), m.accent, 1.15, 0.15, 0.75, 0.3);
  return { parts };
}

function platform(group, m) {
  const { parts, add } = kit(group);
  const { w, d } = PLATE;
  add(rbox(w, 0.12, d, 0.06), m.plate, 0, 0, 0);
  // traces: [x, z, length, horizontal?]
  [[-1.1, -0.9, 1.0, 1], [-1.1, 0.9, 1.3, 1], [0.4, -0.45, 1.2, 1], [-0.9, 0.0, 1.1, 0], [0.55, 0.3, 1.0, 0], [-1.3, 0.0, 1.3, 0]]
    .forEach(([x, z, len, h]) => add(new THREE.BoxGeometry(h ? len : 0.022, 0.012, h ? 0.022 : len), m.accent, x, 0.066, z));
  add(rbox(0.95, 0.1, 0.95, 0.03), m.body, -0.35, 0.11, 0, 0.05);
  add(rbox(0.72, 0.035, 0.72, 0.02), m.light, -0.35, 0.19, 0, 0.2);
  add(rbox(0.2, 0.012, 0.2, 0.005), m.accent, -0.35, 0.215, 0, 0.24);
  [[-1.3, -0.7], [-1.3, 0.7], [0.4, -0.75], [0.4, 0.75]].forEach(([x, z]) => add(rbox(0.4, 0.07, 0.4, 0.02), m.body, x, 0.1, z, 0.08));
  for (let i = 0; i < 4; i++) add(rbox(0.09, 0.34, 1.3, 0.02), m.body, 1.0 + i * 0.17, 0.2, 0, 0.05 + i * 0.03);
  return { parts };
}

function infrastructure(group, m, { lite }) {
  const { parts, add } = kit(group);
  const { w, d } = PLATE;
  add(rbox(w, 0.3, d, 0.07), m.plate, 0, 0, 0);
  add(rbox(w - 0.2, 0.02, d - 0.2, 0.02), m.body, 0, 0.16, 0, 0.05);
  [[-0.9, 0.45], [0.15, 0.45]].forEach(([x, z]) => {
    add(new THREE.CylinderGeometry(0.4, 0.4, 0.06, 32), m.body, x, 0.2, z, 0.12);
    add(new THREE.TorusGeometry(0.4, 0.03, 8, 32), m.light, x, 0.2, z, 0.12).rotation.x = Math.PI / 2;
    add(new THREE.CylinderGeometry(0.12, 0.12, 0.08, 16), m.accent, x, 0.22, z, 0.16);
  });
  const fins = lite ? 8 : 16;
  const finMesh = new THREE.InstancedMesh(new THREE.BoxGeometry(0.04, 0.2, 1.1), m.light, fins);
  const dummy = new THREE.Object3D();
  for (let i = 0; i < fins; i++) {
    dummy.position.set(0.95 + i * (1.45 / fins) * 0.95, 0, 0.2);
    dummy.updateMatrix();
    finMesh.setMatrixAt(i, dummy.matrix);
  }
  finMesh.position.set(0, 0.27, 0);
  group.add(finMesh);
  parts.push({ mesh: finMesh, base: 0.27, dy: 0.1 });
  for (let i = 0; i < 4; i++) {
    const x = -1.2 + i * 0.64;
    add(rbox(0.58, 0.18, 0.42, 0.03), m.body, x, 0.22, -0.75, 0.07 + i * 0.02);
    add(new THREE.SphereGeometry(0.028, 12, 8), m.accent, x + 0.2, 0.22, -0.97, 0.07 + i * 0.02);
  }
  return { parts };
}

const BUILDERS = { application, platform, infrastructure };

// ---- Assembly ---------------------------------------------------------------
function finalize(key, group, parts) {
  const mats = new Set();
  group.traverse((o) => {
    if (!o.isMesh) return;
    o.userData.layerKey = key;
    (Array.isArray(o.material) ? o.material : [o.material]).forEach((mm) => mats.add(mm));
  });
  mats.forEach((mm) => { mm.userData.baseOpacity = mm.opacity; });
  // Invisible hit proxy: makes hover/tap forgiving without affecting rendering.
  const hit = new THREE.Mesh(
    new THREE.BoxGeometry(PLATE.w + 0.3, 0.7, PLATE.d + 0.3),
    new THREE.MeshBasicMaterial({ visible: false })
  );
  hit.position.y = 0.18;
  hit.userData.layerKey = key;
  group.add(hit);
  return { group, parts, mats: [...mats] };
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
      const { parts } = (BUILDERS[l.key] ?? platform)(group, mats, { lite });
      entry = finalize(l.key, group, parts);
    }
    root.add(entry.group);
    out.set(l.key, entry);
  }
  return { root, layers: out };
}
