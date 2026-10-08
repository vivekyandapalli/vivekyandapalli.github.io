const reduce = matchMedia("(prefers-reduced-motion: reduce)");

export const device = {
  get reducedMotion() { return reduce.matches; },
  isMobile: matchMedia("(max-width: 760px)").matches,
  finePointer: matchMedia("(pointer: fine)").matches,
  saveData: !!navigator.connection?.saveData,
  lowPower: (navigator.hardwareConcurrency || 8) <= 4 || (navigator.deviceMemory || 8) <= 4,
};

/** Cap the device pixel ratio: the biggest single lever on GPU cost. */
export function pixelRatioCap() {
  if (device.lowPower) return 1.25;
  return device.isMobile ? 1.5 : 2;
}
