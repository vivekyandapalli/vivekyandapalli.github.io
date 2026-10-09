import * as THREE from "three";

/** Accent colour per layer; the key light tints toward this when the layer is active. */
export const palette = {
  application: 0x8fe3ff,
  platform: 0x9db4ff,
  infrastructure: 0x9ff0cf,
  default: 0xb8c4d4,
};

const hasDOM = typeof document !== "undefined";

// ---- generated textures (no image files to download) ------------------------------
let plateTex = null;
function circuitTexture() {
  if (!hasDOM) return null;
  if (plateTex) return plateTex;
  const c = document.createElement("canvas");
  c.width = c.height = 512;
  const g = c.getContext("2d");
  g.fillStyle = "#262c34";
  g.fillRect(0, 0, 512, 512);
  let seed = 7;
  const rnd = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296);
  g.strokeStyle = "#323b47";
  g.fillStyle = "#3a4552";
  g.lineWidth = 2;
  for (let i = 0; i < 46; i++) {
    let x = Math.floor(rnd() * 16) * 32, y = Math.floor(rnd() * 16) * 32;
    g.beginPath();
    g.moveTo(x, y);
    for (let k = 0; k < 4; k++) {
      const step = (rnd() < 0.5 ? -1 : 1) * 32 * (1 + Math.floor(rnd() * 3));
      if (rnd() < 0.5) x += step; else y += step;
      g.lineTo(x, y);
    }
    g.stroke();
    g.beginPath();
    g.arc(x, y, 4, 0, Math.PI * 2);
    g.fill();
  }
  plateTex = new THREE.CanvasTexture(c);
  plateTex.colorSpace = THREE.SRGBColorSpace;
  plateTex.anisotropy = 4;
  return plateTex;
}

const labelTextures = new Map();
/** Text printed onto a 3D part. Text comes from the config, so it stays editable. */
export function labelMaterial(text, color = "#dfe8f2") {
  if (!hasDOM || !text) return null;
  const key = `${text}|${color}`;
  if (!labelTextures.has(key)) {
    const c = document.createElement("canvas");
    c.width = 256; c.height = 64;
    const g = c.getContext("2d");
    let size = 38;
    const font = () => `600 ${size}px "Instrument Sans", system-ui, sans-serif`;
    g.font = font();
    while (g.measureText(text).width > 236 && size > 14) { size -= 2; g.font = font(); }
    g.fillStyle = color;
    g.textAlign = "center";
    g.textBaseline = "middle";
    g.fillText(text, 128, 34);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 4;
    labelTextures.set(key, t);
  }
  const m = new THREE.MeshBasicMaterial({ map: labelTextures.get(key), transparent: true, toneMapped: false, depthWrite: false });
  m.userData.glass = true; // always transparent, never writes depth
  return m;
}

/** Each layer gets its own material instances so it can fade/glow independently. */
export function makeMaterials(accentHex) {
  const std = (color, metalness, roughness) =>
    new THREE.MeshStandardMaterial({ color, metalness, roughness, envMapIntensity: 0.9 });

  const accent = new THREE.MeshStandardMaterial({
    color: accentHex, emissive: accentHex, emissiveIntensity: 0.5, metalness: 0.2, roughness: 0.5,
  });
  accent.userData.accent = true;

  const glass = new THREE.MeshStandardMaterial({
    color: 0x9fd8ff, metalness: 0.1, roughness: 0.08, transparent: true, opacity: 0.2, depthWrite: false,
  });
  glass.userData.glass = true;

  const tex = circuitTexture();
  const plate = std(tex ? 0xffffff : 0x262c34, 0.85, 0.4);
  if (tex) plate.map = tex;

  return {
    plate,
    body: std(0x343c47, 0.8, 0.32),
    light: std(0x8e9aab, 1, 0.25),
    vent: std(0x0d1013, 0.5, 0.6),
    accent,
    glass,
  };
}
