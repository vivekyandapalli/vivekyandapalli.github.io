import * as THREE from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { buildHardware } from "./hardware.js";
import { palette } from "./materials.js";
import { device, pixelRatioCap } from "../utils/device.js";

const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const lerp = (a, b, t) => a + (b - a) * t;
const smooth = (a, b, x) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
const DAMPED = ["e", "az", "el", "dist", "ty", "sx", "sy"];

function floorTexture() {
  const c = document.createElement("canvas");
  c.width = c.height = 128;
  const g = c.getContext("2d");
  const grad = g.createRadialGradient(64, 64, 2, 64, 64, 62);
  grad.addColorStop(0, "rgba(0,0,0,0.75)");
  grad.addColorStop(0.35, "rgba(0,0,0,0.45)");
  grad.addColorStop(0.6, "rgba(60,80,105,0.18)");
  grad.addColorStop(1, "rgba(60,80,105,0)");
  g.fillStyle = grad;
  g.fillRect(0, 0, 128, 128);
  return new THREE.CanvasTexture(c);
}

/**
 * Creates the teardown scene. Renders on demand: the animation loop only runs
 * while something is moving, then goes idle.
 */
export async function createScene({ canvas, layers, modelUrl }) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: !device.lowPower, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, pixelRatioCap()));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;

  const scene = new THREE.Scene();
  scene.environment = new THREE.PMREMGenerator(renderer).fromScene(new RoomEnvironment(), 0.04).texture;
  const camera = new THREE.PerspectiveCamera(28, 1, 0.1, 100);

  const key = new THREE.DirectionalLight(0xffffff, 2.2);
  key.position.set(4, 7, 5);
  const rim = new THREE.DirectionalLight(0x9bd8ff, 1.4);
  rim.position.set(-5, 3, -6);
  scene.add(key, rim, new THREE.HemisphereLight(0xaab8cc, 0x0a0c10, 0.5));

  const hw = await buildHardware(layers, { lite: device.isMobile || device.lowPower, modelUrl });
  scene.add(hw.root);
  const items = layers.map((l) => ({ key: l.key, ...hw.layers.get(l.key), op: 1, hl: 0 }));
  const n = items.length;

  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(9, 7).rotateX(-Math.PI / 2),
    new THREE.MeshBasicMaterial({ map: floorTexture(), transparent: true, depthWrite: false, toneMapped: false })
  );
  scene.add(floor);

  const pickables = [];
  hw.root.traverse((o) => { if (o.isMesh) pickables.push(o); });

  // ---- state -----------------------------------------------------------------
  const input = { progress: 0, activeIdx: -1, focus: null, hover: null, px: 0, py: 0 };
  const cur = { e: 0, az: -0.72, el: 0.52, dist: 11, ty: 0, sx: 0.17, sy: 0 };
  const size = { w: 1, h: 1 };
  const listeners = {};
  let raf = 0, running = true, last = 0;

  const tint = new THREE.Color(), white = new THREE.Color(0xffffff), keyTarget = new THREE.Color();

  function targets() {
    const p = input.progress, mob = device.isMobile;
    const fi = input.focus ? items.findIndex((i) => i.key === input.focus) : -1;
    const e = fi >= 0 ? 1 : smooth(0.12, 0.5, p);
    const yOf = (i) => ((n - 1) / 2 - i) * lerp(0.55, 1.9, e);
    const base = Math.max(11, 10.4 / (size.w / size.h));
    const t = { e };
    if (fi >= 0) {
      Object.assign(t, { az: 0.2, el: 0.62, dist: base * (mob ? 0.8 : 0.6), ty: yOf(fi), sx: mob ? 0 : -0.2, sy: mob ? 0.2 : 0 });
    } else {
      const a = input.activeIdx;
      Object.assign(t, {
        az: lerp(-0.72, mob ? -0.45 : 0.28, p),
        el: lerp(0.52, 0.4, e),
        dist: base,
        ty: a >= 0 ? yOf(a) * 0.5 * e : 0,
        sx: mob ? 0 : lerp(0.17, 0.09, e),
        sy: mob ? 0.13 : 0,
      });
      if (device.finePointer && !device.reducedMotion) { t.az += input.px * 0.05; t.el += input.py * 0.025; }
    }
    return t;
  }

  function applyLook(it) {
    for (const m of it.mats) {
      const o = (m.userData.baseOpacity ?? 1) * it.op;
      const transparent = o < 0.999 || !!m.userData.glass;
      if (m.transparent !== transparent) { m.transparent = transparent; m.needsUpdate = true; }
      m.opacity = o;
      m.depthWrite = it.op > 0.98 && !m.userData.glass;
      if (m.userData.accent) m.emissiveIntensity = 0.5 + it.hl * 0.9;
    }
  }

  /** Advances all damped values; returns true while anything is still moving. */
  function tick(dt) {
    const t = targets();
    const k = device.reducedMotion ? 1 : 1 - Math.exp(-dt * (input.focus ? 5.5 : 7));
    let moving = false;
    for (const name of DAMPED) {
      const d = t[name] - cur[name];
      if (Math.abs(d) > 0.0008) moving = true;
      cur[name] += d * k;
    }
    const spacing = lerp(0.55, 1.9, cur.e);
    items.forEach((it, i) => {
      it.group.position.y = ((n - 1) / 2 - i) * spacing;
      for (const pt of it.parts) pt.mesh.position.y = pt.base + pt.dy * cur.e;
      const opT = input.focus && input.focus !== it.key ? 0.1 : 1;
      const hlT = (input.hover === it.key ? 1 : 0) + (input.focus === it.key ? 0.5 : 0)
        + (!input.focus && input.activeIdx === i && cur.e > 0.6 ? 0.5 : 0);
      if (Math.abs(opT - it.op) > 0.002 || Math.abs(hlT - it.hl) > 0.002) moving = true;
      it.op += (opT - it.op) * k;
      it.hl += (hlT - it.hl) * k;
      applyLook(it);
    });
    floor.position.y = items[n - 1].group.position.y - 0.42;

    const lit = input.focus ?? (input.activeIdx >= 0 && cur.e > 0.6 ? items[input.activeIdx].key : null);
    keyTarget.copy(white).lerp(tint.set(lit ? palette[lit] ?? palette.default : 0xffffff), 0.22);
    if (Math.abs(key.color.r - keyTarget.r) + Math.abs(key.color.g - keyTarget.g) + Math.abs(key.color.b - keyTarget.b) > 0.004) moving = true;
    key.color.lerp(keyTarget, k);
    return moving;
  }

  function render() {
    const { w, h } = size;
    camera.aspect = w / h;
    const ce = Math.cos(cur.el);
    camera.position.set(cur.dist * ce * Math.sin(cur.az), cur.ty + cur.dist * Math.sin(cur.el), cur.dist * ce * Math.cos(cur.az));
    camera.lookAt(0, cur.ty, 0);
    camera.setViewOffset(w, h, -cur.sx * w, cur.sy * h, w, h);
    renderer.render(scene, camera);
    listeners.render?.();
  }

  function frame(t) {
    raf = 0;
    const dt = Math.min(0.05, (t - last) / 1000 || 0.016);
    last = t;
    const moving = tick(dt);
    render();
    if (moving && running) raf = requestAnimationFrame(frame);
  }
  const request = () => { if (!raf && running) raf = requestAnimationFrame(frame); };

  // ---- sizing ----------------------------------------------------------------
  const ro = new ResizeObserver(() => {
    const r = canvas.getBoundingClientRect();
    size.w = Math.max(1, Math.round(r.width));
    size.h = Math.max(1, Math.round(r.height));
    renderer.setSize(size.w, size.h, false);
    request();
  });
  ro.observe(canvas);

  // ---- picking ---------------------------------------------------------------
  const ray = new THREE.Raycaster(), ndc = new THREE.Vector2();
  function pick(x, y) {
    const r = canvas.getBoundingClientRect();
    ndc.set(((x - r.left) / r.width) * 2 - 1, -((y - r.top) / r.height) * 2 + 1);
    ray.setFromCamera(ndc, camera);
    return ray.intersectObjects(pickables, false)[0]?.object.userData.layerKey ?? null;
  }
  function setHover(k) {
    if (k === input.hover) return;
    input.hover = k;
    canvas.style.cursor = k ? "pointer" : "";
    listeners.hover?.(k);
    request();
  }
  let queued = false, evt = null;
  canvas.addEventListener("pointermove", (e) => {
    if (e.pointerType === "touch") return;
    evt = e;
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => { queued = false; setHover(pick(evt.clientX, evt.clientY)); });
  });
  canvas.addEventListener("pointerleave", () => setHover(null));
  canvas.addEventListener("click", (e) => { const k = pick(e.clientX, e.clientY); if (k) listeners.select?.(k); });
  window.addEventListener("pointermove", (e) => {
    if (!device.finePointer || device.reducedMotion) return;
    const px = (e.clientX / innerWidth - 0.5) * 2, py = (e.clientY / innerHeight - 0.5) * 2;
    if (Math.abs(px - input.px) + Math.abs(py - input.py) < 0.01) return;
    input.px = px; input.py = py;
    request();
  }, { passive: true });

  // ---- public API --------------------------------------------------------------
  return {
    setProgress(p) { input.progress = p; request(); },
    setActive(i) { input.activeIdx = i; request(); },
    setFocus(k) { input.focus = k; request(); },
    setHover(k) { if (k !== input.hover) { input.hover = k; request(); } },
    on(name, fn) { listeners[name] = fn; },
    requestRender: request,
    /** Projects a point (in a layer's local space) to canvas pixels. */
    project(layerKey, [x, y, z]) {
      const it = items.find((i) => i.key === layerKey);
      const v = new THREE.Vector3(x, y, z);
      it.group.localToWorld(v).project(camera);
      return { x: (v.x * 0.5 + 0.5) * size.w, y: (-v.y * 0.5 + 0.5) * size.h };
    },
    pause() { running = false; if (raf) cancelAnimationFrame(raf); raf = 0; },
    resume() { running = true; request(); },
  };
}
