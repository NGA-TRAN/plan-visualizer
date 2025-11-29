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

- **Node.js**: Version 20 or higher
- **npm**: Comes with Node.js, or install separately
- **Git**: For version control

### Installation

1. Install dependencies:

```bash
npm install
```

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

The application will be available at `http://localhost:4174` (or the next available port).

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

After building, preview the production build locally:

```bash
npm run preview
```

This command:
- Runs TypeScript type checking (`tsc`)
- Builds the production bundle (`vite build`)
- Starts a preview server (`vite preview`)

The application will be available at **http://localhost:4174/** (or the next available port).

> **Note**: The preview server serves the production build, which is useful for testing how the app will behave when deployed.

### Other Useful Commands

- **Type checking**: `npm run type-check` - Check TypeScript types without building
- **Linting**: `npm run lint` - Check code for linting errors
- **Formatting**: `npm run format` - Format code with Prettier

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
   npm run build
   npm run preview
   ```
   Then test at http://localhost:4174/

3. **Run type checking**:
   ```bash
   npm run type-check
   ```

4. **Run linting**:
   ```bash
   npm run lint
   ```

### Commit Your Changes

Write clear, descriptive commit messages:

```bash
git add .
git commit -m "Add: description of your changes"
```

Use conventional commit prefixes when appropriate:
- `Add:` for new features
- `Fix:` for bug fixes
- `Update:` for updates to existing features
- `Refactor:` for code refactoring
- `Docs:` for documentation changes

### Keep Your Fork Updated

Before creating a pull request, sync your fork with the upstream repository:

```bash
git fetch upstream
git checkout main
git merge upstream/main
git push origin main
```

Then update your feature branch:

```bash
git checkout feature/your-feature-name
git merge main
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
3. Select your branch
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
├── dist/                 # Production build output
└── specs/                # Project specifications
```

## Questions?

If you have questions or need help:

- Open an issue on GitHub
- Check existing issues and discussions
- Review the [README.md](README.md) for project overview

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

Thank you for contributing to Plan Visualizer! 🎉