# Engineering Teardown Portfolio

Phase 1: structure, navigation, hero, styling and the content config. Three.js arrives in Phase 2.

## Run locally
ES modules need a web server (opening index.html directly won't work):

    python3 -m http.server 8000     # then open http://localhost:8000

## Edit content
Everything lives in `config/portfolio.js`. Set `enabled: false` on any layer, project,
experience, link, etc. to hide it. Items marked [PLACEHOLDER] are samples to replace.

## Deploy
Push to a repo named `YOUR_USERNAME.github.io`, then Settings → Pages → Deploy from branch → `main` / root.
