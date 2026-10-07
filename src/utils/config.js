import { portfolio } from "../../config/portfolio.js";

const isOn = (item) => item && item.enabled !== false;

/** Returns portfolio with every disabled item filtered out. All UI/3D code reads from here. */
export function getContent() {
  const p = portfolio;
  const layers = Object.entries(p.layers)
    .filter(([, l]) => isOn(l))
    .map(([key, l]) => ({ key, ...l }));
  const live = new Set(layers.map((l) => l.key));
  const byLayer = (item) => !item.layer || live.has(item.layer);
  const links = Object.entries(p.links)
    .filter(([, l]) => isOn(l))
    .map(([key, l]) => ({ key, ...l }));

  return {
    ...p,
    layers,
    links,
    experience: p.experience.filter(isOn).filter(byLayer),
    projects: p.projects.filter(isOn).filter(byLayer),
    skills: p.skills.filter(isOn).filter(byLayer),
    education: p.education.filter(isOn),
    achievements: p.achievements.filter(isOn),
    certifications: p.certifications.filter(isOn),
  };
}
