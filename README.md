# Plan Visualizer

Visualize Apache DataFusion physical execution plans as interactive, color-coded diagrams, powered by [plan-viz](https://github.com/NGA-TRAN/plan_viz) and Excalidraw.

**[Open the app](https://nga-tran.github.io/plan-visualizer/)**

- Paste a plan, upload or drop a text file, or choose a single-node, custom, distributed (beta), or metrics (alpha) sample.
- Choose **Normal**, **Labels**, or **Labels + heatmap**, then click **Visualize**. Metric views let you select a metric; heatmaps offer Orange, Blue, Purple, and Spectrum palettes. Every palette uses white for measured zero; Spectrum adds six positive-color anchors while retaining linear scaling. Normal is the default.
- Edit diagrams and export PNG, SVG, or Excalidraw JSON.
- Click **Share** to copy a link that restores the plan text and selected display settings, then automatically opens its diagram. Older links still open in Normal mode.
- Use light/dark themes, desktop/mobile layouts, and offline access after the app is cached.

Share links contain compressed plan text and display settings and need no backend or account. Manual diagram edits are saved through JSON export. Very large plans must be shared as text files.

Metric interpretation is automatic by default: paste or upload a plan, choose **Labels** or **Labels + heatmap**, and click **Visualize**. The app applies supported DataFusion metric definitions and distributed task interpretation when they enable numeric comparison. These are assumed defaults, not verified producer metadata. Use **Advanced metric interpretation** to override them or turn automatic interpretation off. In manual mode, missing settings are highlighted when they would enable a heatmap. Missing values display **Not reported**; measured zero remains distinct. Display changes apply on **Visualize**, which regenerates the diagram. The two metrics samples are synthetic teaching examples.

## Run locally

Use Node.js 24 (the exact version is pinned in [.nvmrc](.nvmrc)).

```bash
npm ci
npm run dev
```

Open the URL printed by Vite (normally `http://localhost:5173/`).

See [CONTRIBUTING.md](CONTRIBUTING.md) for setup, checks, sharing limits, and deployment. Merges to `master` deploy automatically to GitHub Pages after CI passes.

[MIT license](LICENSE) · [Report an issue](https://github.com/NGA-TRAN/plan-visualizer/issues)
