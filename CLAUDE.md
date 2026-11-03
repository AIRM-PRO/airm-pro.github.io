# airm-pro.github.io (repo AIRM-PRO/airm-pro.github.io)

Static GitHub Pages site for WebXR games, no custom domain yet (to add one later: a `CNAME` file plus DNS records). Branch `main`, deployed from the repo root.

- `index.html`: landing page linking the games. Polish UI.
- `bravr/`: Orbital Brawl. Notes in `bravr/CLAUDE.md`, `CONTEXT.md`, `BACKLOG.md`.
- `skrzydla/`: Skrzydła. Notes in `skrzydla/CLAUDE.md`.
- `ninjalingo/`: NinjaLingo, English UI. Notes in `ninjalingo/CLAUDE.md`, `CONTEXT.md`, `BACKLOG.md`.
- `_config.yml` keeps the developer notes off the published site.

Each game: one `index.html`, three.js r128 from a CDN, no build. Assets sit in the game's folder (`bravr/robot.glb`, `bravr/pope.glb`; NinjaLingo's models, audio and word list). Bump the game's version in its `h1` with every push.

WebXR needs HTTPS: keep "Enforce HTTPS" on in the repo's Pages settings. Game settings and history are stored in the browser's localStorage, which is per domain, so records from jknowak.pl did not carry over.

Repo-level workflow: edit, test locally (`python3 -m http.server` from the repo root, open `/bravr/` or `/skrzydla/`; Playwright with swiftshader works, see each game's notes), commit, push to `main`.
