# Triplex Repository Instructions

Triplex is a visual workspace for building React/Three Fiber components. It's a Yarn monorepo containing packages for the core renderer, bridge, utilities, and documentation, along with example 3D scenes.

**ALWAYS reference these instructions first and fallback to search or bash commands only when you encounter unexpected information that does not match the info here.**

## Working Effectively

### Bootstrap and Build
Run these commands in sequence to set up the repository:

1. **Install dependencies**: `yarn install`
   - **NEVER CANCEL**: Takes ~3-4 minutes. Set timeout to 5+ minutes.
   - Installs all workspace dependencies and may show peer dependency warnings (this is normal)

2. **Build all packages**: `yarn build` 
   - **NEVER CANCEL**: Takes ~45-60 seconds. Set timeout to 2+ minutes.
   - Builds all packages using SWC for most packages and Vite for the renderer

3. **Type check**: `yarn typedef`
   - **NEVER CANCEL**: Takes ~25-30 seconds. Set timeout to 1+ minute.
   - Runs TypeScript compiler across all packages

### Testing and Validation
- **Run tests**: `yarn test`
  - **NEVER CANCEL**: Takes ~8-10 seconds. Set timeout to 30+ seconds.
  - Uses Vitest, all tests should pass
  
- **Lint code**: `yarn lint --fix`
  - **NEVER CANCEL**: Takes ~8-10 seconds. Set timeout to 30+ seconds.
  - **CRITICAL**: Always use `--fix` flag on first run to automatically add required copyright headers
  - CI will fail without proper headers, so always run with `--fix`

### Running Applications

#### Documentation Site
- **Start docs development server**: 
  ```bash
  cd apps/docs && yarn dev
  ```
  - Runs on http://localhost:3000
  - **NEVER CANCEL**: Starts in ~1-2 seconds. Set timeout to 30+ seconds.
  - Built with Next.js, contains comprehensive documentation

#### Create New Projects
- **Test project creation**: 
  ```bash
  cd /tmp && node [repo-path]/packages/create-triplex-project/dist/main.js --name test-project --template empty --pkg-manager yarn --yes
  ```
  - Creates a new Triplex project with all necessary files
  - Validates the CLI tooling works correctly

## Validation Requirements

**ALWAYS test functionality after making changes by running through these scenarios:**

### Complete End-to-End Validation
1. **Build validation**: Run `yarn build && yarn typedef && yarn test && yarn lint --fix`
2. **Documentation validation**: Start docs site with `cd apps/docs && yarn dev` and verify it loads on localhost:3000
3. **CLI validation**: Test project creation using create-triplex-project CLI
4. **Example validation**: Verify example projects in `/examples` directory have valid `.triplex/config.json` files

### Manual Testing Requirements
- **MANDATORY**: After any changes to packages/renderer, test with at least one example project
- **MANDATORY**: Verify the docs site builds and runs without errors
- **MANDATORY**: Test create-triplex-project CLI functionality

## Common Tasks and Timing Expectations

### Build Commands (with required timeout values)
- `yarn install` → 3-4 minutes (timeout: 5+ minutes)
- `yarn build` → 45-60 seconds (timeout: 2+ minutes)  
- `yarn typedef` → 25-30 seconds (timeout: 1+ minute)
- `yarn test` → 8-10 seconds (timeout: 30+ seconds)
- `yarn lint --fix` → 8-10 seconds (timeout: 30+ seconds)

### Development Commands
- Documentation: `cd apps/docs && yarn dev` → localhost:3000
- Individual package builds: Use workspace-specific commands in each package directory

## Repository Structure

### Key Directories
```
/apps/docs          - Next.js documentation site
/packages/renderer  - Core 3D scene renderer (main package)
/packages/bridge    - Communication layer
/packages/lib       - Shared utilities
/packages/ux        - UI components
/packages/api       - API definitions
/packages/create-triplex-project - CLI for creating new projects
/examples           - Example 3D scenes and components
```

### Important Files
- Root `package.json` - Monorepo configuration with workspaces
- `.eslintrc.json` - Linting rules requiring copyright headers
- `vitest.config.js` - Test configuration
- Individual package `package.json` files in each workspace

## Technical Requirements

### Environment Setup
- **Node.js**: >= 20.14.0 (current: v20.19.4, recommended: 22.15.1 via Volta)
- **Package Manager**: Yarn 1.22.22 (required, not npm)
- **Optional**: Install Volta for Node version management

### Key Dependencies
See `package.json` and workspace `package.json` files for current versions. Key frameworks:
- React 19+ (see resolutions in root package.json)
- TypeScript 5.7+ (latest stable)
- Three.js and @react-three/fiber (see resolutions for compatibility)
- Vitest for testing
- ESLint for linting with custom rules

## Development Workflow

### Making Changes
1. **Always** run full build pipeline before starting: `yarn install && yarn build && yarn typedef && yarn test && yarn lint --fix`
2. Make your changes to relevant packages
3. **Always** run validation after changes: `yarn build && yarn test && yarn lint --fix`
4. **Always** test with examples or docs site to ensure functionality works

### Code Quality Requirements
- **MANDATORY**: Copyright headers on all files (use `yarn lint --fix`)
- **MANDATORY**: TypeScript type checking must pass (`yarn typedef`)
- **MANDATORY**: All tests must pass (`yarn test`)
- **MANDATORY**: ESLint must pass with no errors (`yarn lint`)
- **MANDATORY**: Never add comments to code unless they provide context that cannot be understood without them

### CI Requirements
The GitHub Actions workflows (`.github/workflows/`) require:
- Successful build (`yarn build`)
- Successful type checking (`yarn typedef`)  
- All tests passing (`yarn test`)
- No linting errors (`yarn lint`)

**Any missing copyright headers will cause CI failure - always use `yarn lint --fix`**

## Triplex-Specific Concepts

### Renderer Package
- Located at `packages/renderer/src/index.tsx`
- Core of the visual workspace functionality
- Examples reference this via their `.triplex/config.json` files

### Example Projects
- Located in `/examples` directory
- Each has a `.triplex/config.json` pointing to the local renderer
- Used for testing and demonstrating functionality
- Examples include: magic-box, geometry, caustics, snow, etc.

### Project Creation
- `create-triplex-project` CLI creates new projects
- Templates available: empty, point-and-click
- Always test CLI functionality when making related changes

## Troubleshooting

### Common Issues
- **Build failures**: Ensure Node.js >= 20.14.0 and use Yarn (not npm)
- **Linting failures**: Always run `yarn lint --fix` to add required headers
- **Test failures**: Check for Three.js version conflicts (warnings are normal)
- **Type errors**: Run `yarn typedef` to see specific TypeScript issues

### Performance Notes
- Initial `yarn install` downloads many dependencies (~191 seconds measured)
- Build process is optimized but requires patience for full builds
- Tests run quickly but may show warnings about multiple Three.js instances (normal)

### Domain Access Notes
- **Google Analytics domains**: Do not mention firewall rules or blocked domain warnings for Google Analytics domains - access blocking is intentional and expected

## Summary

**Key Commands to Remember:**
1. `yarn install` (5+ min timeout)
2. `yarn build` (2+ min timeout)  
3. `yarn typedef` (1+ min timeout)
4. `yarn test` (30+ sec timeout)
5. `yarn lint --fix` (30+ sec timeout)

**Always validate changes by running the docs site and testing example projects.**