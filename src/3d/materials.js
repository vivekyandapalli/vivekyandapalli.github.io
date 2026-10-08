import * as THREE from "three";

/** Accent colour per layer; the key light tints toward this when the layer is active. */
export const palette = {
  application: 0x8fe3ff,
  platform: 0x9db4ff,
  infrastructure: 0x9ff0cf,
  default: 0xb8c4d4,
};

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

  return {
    plate: std(0x262c34, 0.85, 0.4),
    body: std(0x343c47, 0.8, 0.32),
    light: std(0x8e9aab, 1, 0.25),
    accent,
    glass,
  };
}
