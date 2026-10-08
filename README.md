# Engineering Teardown Portfolio

An interactive 3D exploded-hardware portfolio (Three.js + GSAP) with a conventional résumé mode.
Static site: vanilla HTML/CSS/JS, no build step, deploys straight to GitHub Pages.

## Run locally
ES modules need a server (opening `index.html` directly won't work):

    python3 -m http.server 8000      # open http://localhost:8000

## Deploy (GitHub Pages)
1. Create a **public** repo named `YOUR_USERNAME.github.io`.
2. Push the contents of this folder (so `index.html` is at the repo root).
3. Settings → Pages → Deploy from a branch → `main` / `/ (root)`.
4. Live at `https://YOUR_USERNAME.github.io/` after a minute or two.

## Edit your content: `config/portfolio.js` only
Everything personal lives there. `[PLACEHOLDER]` text is sample content to replace.

| To… | Do this |
|---|---|
| Hide a layer | `layers.infrastructure.enabled = false` (its slab, label, items and skills disappear) |
| Add a project | Copy a block in `projects`, give it a unique `id` and a `layer` |
| Remove / hide a project | Delete the block, or set `enabled: false` |
| Add experience | Copy a block in `experience`; use `achievements: [{ text, metric }]` |
| Add a diagram | Project `architecture`: `{ enabled: true, image: "public/images/x.png" }` or `flow: ["A","B","C"]` |
| Resume PDF | Put it at `public/resume.pdf`, set `links.resume.enabled = true` |
| Social preview | Add `public/images/og.png` (1200×630), set `site.image` |

Also update `<title>` and the meta description in `index.html`; crawlers that don't run JavaScript read those.

## Replace the 3D model
By default the hardware is built in code (`src/3d/hardware.js`). To use your own model:
1. Export a `.glb` with three top-level nodes named exactly `application`, `platform`, `infrastructure`,
   each centred at the origin and about 3.4 × 2.4 units wide.
2. Save it to `public/models/hardware.glb` and set `model.url` in the config.
If anything is missing the site falls back to the built-in model (see the browser console).
Compress with `gltf-transform optimize` (Draco/meshopt, WebP textures) before committing.

## Structure
    config/portfolio.js     all personal data
    src/utils/config.js     filters out disabled items
    src/3d/                 scene, materials, hardware (no personal data)
    src/animations/scroll.js  scroll → teardown mapping (GSAP ScrollTrigger)
    src/components/         page, inspector, overlay (labels), resume, shared builders
    src/main.js             wiring, modes, lazy loading

## Performance and accessibility notes
Renders on demand (idle when nothing moves), pauses off-screen, DPR capped (2 / 1.5 mobile / 1.25 low-power),
Three.js loaded lazily, `prefers-reduced-motion` removes camera easing and parallax, Save-Data starts in résumé mode,
and layer labels are real buttons. Share `https://YOUR_USERNAME.github.io/#resume` to link straight to résumé mode.
