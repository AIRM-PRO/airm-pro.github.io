# airm.pro (repo AIRM-PRO/airm.github.io)

Static GitHub Pages site for WebXR games, custom domain `airm.pro` (`CNAME` file). Branch `main`, deployed from the repo root.

- `index.html`: landing page linking the games. Polish UI.
- `bravr/`: Orbital Brawl. Notes in `bravr/CLAUDE.md`, `CONTEXT.md`, `BACKLOG.md`.
- `skrzydla/`: Skrzydła. Notes in `skrzydla/CLAUDE.md`.
- `_config.yml` keeps the developer notes off the published site.

Each game: one self-contained `index.html`, three.js r128 from a CDN, no build. Bump the game's version in its `h1` with every push.

WebXR needs HTTPS: keep "Enforce HTTPS" on in the repo's Pages settings. Game settings and history are stored in the browser's localStorage, which is per domain, so records from jknowak.pl did not carry over.

Repo-level workflow: edit, test locally (`python3 -m http.server` from the repo root, open `/bravr/` or `/skrzydla/`; Playwright with swiftshader works, see each game's notes), commit, push to `main`.
