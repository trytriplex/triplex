# {app_name}

- [Koota](https://github.com/pmndrs/koota) for state management, powering the core behavior loop.
- [Vite](https://vitejs.dev/) for bundling and running the game outside of Triplex.
- [React Three Fiber](https://github.com/pmndrs/react-three-fiber) for rendering 3D components.
- [TypeScript](https://www.typescriptlang.org/) for type safety and better developer experience.

## Introduction

This point & click starter template is built on-top of Koota, a state management library that encourages you to separate behavior from your React component markup and is a great way to build components that needs to know about all other "things" in the world in a structured way without relying on traditional React composition patterns.

### React Components as entities

You'll find most of the React components in this template are very light-weight. For example the `Controller` React component found in `src/entities/controller/index.tsx` only:

- Renders a Three.js group; then
- Spawns itself as an entity in the Koota world with a bunch of "traits" (in an effect)

If these React components were rendered by themselves, well, nothing happens! That's where "system" functions come into play.

### Core behavior loop

The core behavior loop is defined in the `KootaSystems` React component found in `src/providers.tsx`. Every frame each system function is called in sequence meaning the order of functions are important!

Going back to the `Controller` React component, the point and click behavior is spread into a few different system functions:

- `velocityTowardsTarget(world, delta)` — Given a target entity found in the world, update all entities that have Controllable, Position, and Velocity traits to have their velocity move towards the target.
- `positionFromVelocity(world, delta)` — Update all entities that have Position and Velocity traits to have their position updated based on their current velocity.

Each system function is made to be small and composable so you can easily build up behavior by adding (or removing) traits on entities.

Try modifying some and see what happens!

### Files of interest

- `/.triplex/config.json` — Triplex configuration.
- `/.triplex/providers.tsx` — [React component providers](/docs/building-your-scene/providers) are declared here. The global provider declares the Koota world, and the canvas provider declares the Koota systems. Props declared on providers can be controlled through the UI!
- `/src`
  - `/entities` — React components that are registered as entities in the Koota world. These components can be used in the scene and will be updated every frame.
  - `/levels` — React components that are considered "levels" in the game sense. These are the primary ones you'll be developing against inside Triplex.
  - `/shared` — Shared Koota systems, traits, and math functions.
  - `app.tsx` — Root of the React app.
  - `providers.tsx` — Providers declared here are used in both `app.tsx `and `/.triplex/providers.tsx`.

## Deployments

This template comes with out-of-the-box [GitHub pages deployments](https://pages.github.com/). For every commit to the default branch a deployment will be initiated.

To successfully deploy you'll need to enable GitHub pages for your repository:

1. Visit your GitHub repository settings
1. Find the "Pages" page
1. Change `source` to `GitHub Actions`
1. You're ready! ✅
