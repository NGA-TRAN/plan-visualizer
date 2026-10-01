# Contributing to Plan Visualizer

Thank you for your interest in contributing to Plan Visualizer! This document provides guidelines and instructions for contributing to the project.

## Getting Started

### Fork the Repository

To contribute to this project, you'll need to fork the repository first:

1. Navigate to the [Plan Visualizer repository](https://github.com/NGA-TRAN/plan-visualizer)
2. Click the "Fork" button in the top-right corner
3. This creates a copy of the repository in your GitHub account

### Clone Your Fork

After forking, clone your fork to your local machine:

```bash
git clone https://github.com/YOUR_USERNAME/plan-visualizer.git
cd plan-visualizer
```

### Set Up Upstream Remote

Add the original repository as an upstream remote to keep your fork synchronized:

```bash
git remote add upstream https://github.com/NGA-TRAN/plan-visualizer.git
```

## Development Setup

### Prerequisites

- **Node.js**: Version 24 LTS (pinned in .nvmrc and package.json for nvm and Volta)
- **npm**: Comes with Node.js, or install separately
- **Git**: For version control

### Installation

1. Install dependencies:

```bash
nvm install
nvm use
npm ci
```

Volta users automatically use the version pinned in package.json and can run npm ci directly. CI reads the same version from .nvmrc.

2. Verify the installation:

```bash
npm list plan-viz @excalidraw/excalidraw
```

You should see the required packages listed.

## Development Workflow

### Running the Development Server

Start the development server with hot-reload:

```bash
npm run dev
```

The application will be available at `http://localhost:5173/` (or the next available port shown by Vite).

### Building for Production

Build the project for production:

```bash
npm run build
```

This command:

- Runs TypeScript type checking (`tsc`)
- Builds the production bundle with Vite (`vite build`)
- Outputs optimized files to the `dist/` directory

### Testing the Production Build Locally

Build and preview the production app locally:

```bash
npm run preview
```

This command:

- Runs TypeScript type checking (`tsc`)
- Builds the production bundle (`vite build`)
- Starts a preview server (`vite preview`)

The preview will be available at **http://localhost:4173/** (or the next available port shown by Vite).

> **Note**: The preview server serves the production build, which is useful for testing how the app will behave when deployed.

### Other Useful Commands

- **Type checking**: `npm run type-check` - Check TypeScript types without building
- **Linting**: `npm run lint` - Check code for linting errors
- **Formatting**: `npm run format` - Format code with Prettier

### Automated browser checks

Install the test browser once, then build and run the regression suite:

```bash
npx playwright install chromium
npm run build
npm run test:e2e
```

To use an existing Google Chrome installation locally, run
`PLAYWRIGHT_CHANNEL=chrome npm run test:e2e`. The tests start an isolated
preview on port 4177 and cover all sample plans, file/text inputs, theme
styles, exports, and the first visualization after an offline reload. Sharing
checks cover clipboard copying and fallback, exact text round-trips, automatic
diagrams on desktop/mobile, damaged or oversized links, and edits during loading.

For deployment-path verification:

```bash
GITHUB_PAGES=true npm run build
GITHUB_PAGES=true npm run test:e2e
```

### Sharing

Share links always target the public app, including when copied from localhost.
To test a local change, replace `https://nga-tran.github.io/plan-visualizer/` in
the copied link with your local app URL, keeping the entire `#plan=…` fragment.
Opening the link restores the text and renders the diagram automatically.

Links use the versioned `#plan=v1.` format: gzip-compressed UTF-8 text encoded as
URL-safe base64. They include the current plan text, not manual diagram edits.
The limits are 1 MiB of decoded text and 32,000 URL characters; file uploads allow
up to 5 MiB. Clipboard failures show a link for manual copying.

### Deployment

Pull requests targeting `master` run lint, TypeScript checks, a GitHub Pages
build, and browser tests. After merge, the workflow repeats those checks and
automatically publishes to [GitHub Pages](https://nga-tran.github.io/plan-visualizer/).
Check that the deployment job succeeds before treating a change as live.
The workflow is defined in [.github/workflows/deploy.yml](.github/workflows/deploy.yml).

### Browser data and bundle maintenance

Refresh the compatibility databases periodically with
`npm update baseline-browser-mapping caniuse-lite`, review the lockfile, and
rerun the checks above.

The browser suite limits foreground JavaScript loading before visualization
to 600 KB (uncompressed). The editor and its CSS load when the first plan is
visualized. Offline precaching intentionally still downloads the complete
app in the background, including the editor and export support.

Vite's default 500 KB chunk warnings remain enabled. Excalidraw's bundled
editor, Mermaid/ELK layout code, and font-subsetting code still exceed that
threshold. Review these separately when updating Excalidraw; splitting our
application cannot safely subdivide those prebuilt library modules. Check
startup transfer, rendering, image/scene exports, and offline behavior
before changing caching or chunk boundaries.

## Making Changes

### Create a Branch

Create a new branch for your changes:

```bash
git checkout -b feature/your-feature-name
```

Or for bug fixes:

```bash
git checkout -b fix/your-bug-description
```

### Make Your Changes

- Write clean, readable code
- Follow the existing code style
- Add comments where necessary
- Update documentation if needed

### Test Your Changes

Before submitting:

1. **Run the development server** and test your changes:

   ```bash
   npm run dev
   ```

2. **Build and preview** to ensure the production build works:

   ```bash
   npm run preview
   ```

   Then open the URL printed by Vite (normally http://localhost:4173/).

3. **Run type checking**:

   ```bash
   npm run type-check
   ```

4. **Run linting**:

   ```bash
   npm run lint
   ```

5. **Run browser tests** using the build and commands under Automated browser checks.

### Commit Your Changes

Write clear, descriptive commit messages:

```bash
git add .
git commit -m "feat: describe the new behavior"
```

Use conventional commit prefixes when appropriate:

- `feat:` for features
- `fix:` for bug fixes
- `chore:` for maintenance
- `refactor:` for code refactoring
- `docs:` for documentation changes

### Keep Your Fork Updated

Before creating a pull request, sync your fork with the upstream repository:

```bash
git fetch upstream
git checkout master
git merge upstream/master
git push origin master
```

Then update your feature branch:

```bash
git checkout feature/your-feature-name
git merge master
```

## Submitting Changes

### Push to Your Fork

Push your branch to your fork:

```bash
git push origin feature/your-feature-name
```

### Create a Pull Request

1. Go to your fork on GitHub
2. Click "New Pull Request"
3. Select your branch and target `NGA-TRAN/plan-visualizer:master`
4. Fill out the pull request template (if available) with:
   - Description of changes
   - Related issues (if any)
   - Testing steps
   - Screenshots (if applicable)

### Pull Request Guidelines

- Keep pull requests focused on a single feature or fix
- Write clear descriptions of what changed and why
- Reference related issues
- Ensure all checks pass (linting, type checking, etc.)
- Be responsive to feedback and questions

## Code Style

- Follow TypeScript best practices
- Use functional components with hooks
- Follow the existing project structure
- Use meaningful variable and function names
- Add JSDoc comments for complex functions

## Project Structure

```
plan-visualizer/
├── src/
│   ├── app/              # App configuration and routing
│   ├── features/         # Feature modules
│   ├── shared/           # Shared components and utilities
│   ├── store/            # State management
│   └── types/            # TypeScript type definitions
├── public/               # Static assets
├── tests/                # Playwright browser regression tests
├── dist/                 # Generated production build output
└── specs/                # Historical design and planning documents
```

## Questions?

If you have questions or need help:

- Open an issue on GitHub
- Check existing issues and discussions
- Review the [README.md](README.md) for project overview

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

Thank you for contributing to Plan Visualizer! 🎉
