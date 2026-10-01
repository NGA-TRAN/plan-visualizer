# Plan Visualizer

Visualize Apache DataFusion physical execution plans as interactive, color-coded diagrams, powered by [plan-viz](https://github.com/NGA-TRAN/plan_viz) and Excalidraw.

**[Open the app](https://nga-tran.github.io/plan-visualizer/)**

- Paste a plan, upload or drop a text file, or choose from ten samples, then click **Visualize**.
- Edit diagrams and export PNG, SVG, or Excalidraw JSON.
- Click **Share** to copy a link that restores the plan text and automatically opens its diagram.
- Use light/dark themes, desktop/mobile layouts, and offline access after the app is cached.

Share links contain compressed plan text and need no backend or account. Manual diagram edits are saved through JSON export. Very large plans must be shared as text files.

## Run locally

Use Node.js 24 (the exact version is pinned in [.nvmrc](.nvmrc)).

```bash
npm ci
npm run dev
```

Open the URL printed by Vite (normally `http://localhost:5173/`).

See [CONTRIBUTING.md](CONTRIBUTING.md) for setup, checks, sharing limits, and deployment. Merges to `master` deploy automatically to GitHub Pages after CI passes.

[MIT license](LICENSE) · [Report an issue](https://github.com/NGA-TRAN/plan-visualizer/issues)
