import { getContent } from "./utils/config.js";
import { renderMeta, renderHero, renderNav, renderSections } from "./components/render.js";

const content = getContent();
renderMeta(content);
renderNav(content);
renderHero(content);
renderSections(content);
// Phase 2: import and start the 3D scene here, passing `content.layers`.
