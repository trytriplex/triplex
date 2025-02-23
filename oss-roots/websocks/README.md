# Websocks

[![Discord](https://img.shields.io/badge/dynamic/json?url=https%3A%2F%2Fdiscord.com%2Fapi%2Finvites%2FnBzRBUEs4b%3Fwith_counts%3Dtrue&query=%24.approximate_member_count&style=flat&colorA=000000&colorB=000000&label=discord&logo=&logoColor=000000)](https://discord.gg/nBzRBUEs4b) [![GitHub Sponsors](https://img.shields.io/github/sponsors/itsdouges?style=flat&colorA=000000&colorB=000000&label=sponsor&logo=&logoColor=000000)](https://github.com/sponsors/itsdouges)

## Installation

```bash
npm i @triplex/websocks-server @triplex/websocks-client
```

## Usage

### Create the server

```ts
// 1. Create the websocks server
import { createWSServer } from "@triplex/websocks-server";

const wss = createWSServer();

// 2. Define routes
const routes = wss.collectTypes([
  wss.route(
    "/rng/:max",
    ({ max }) => Math.round(Math.random() * Number(max)),
    (push) => {
      setInterval(() => {
        // Every 1s push a new value to the client.
        push();
      }, 1000);
    },
  ),
]);

// 3. Define events
const events = wss.collectTypes([
  tws.event<"ping", { timestamp: number }>("ping", (send) => {
    setInterval(() => {
      send({ timestamp: Date.now() });
    }, 1000);
  }),
]);

// 4. Start listening
wss.listen(3000);

// 5. Export types to use with the client
export type Routes = typeof routes;
export type Events = typeof events;
```

### Create the client

```tsx
// 1. Import the server types
import { createWSEvents } from "@triplex/websocks-client/events";
import { createWSHooks } from "@triplex/websocks-client/react";
import { type Events, type Routes } from "./server";

// 2. Declare the clients
const { preloadSubscription, useSubscription } = createWSHooks<Routes>({
  url: "ws://localhost:3000",
});

const { on } = createWSEvents<Events>({
  url: "ws://localhost:3000",
});

// 3. Preload data
preloadSubscription("/rng/:max", { max: 100 });

// 4. Subscribe to the data
function Component() {
  const value = useSubscription("/rng/:max", { max: 100 });
  return <div>{value}</div>;
}

on("ping", ({ timestamp }) => {
  console.log(timestamp);
});
```

## API

### `createWSServer()`

Creates a typed websocket server.

#### Returns

| Name | Description |
| --- | --- |
| `close()` | Closes the server. |
| `collectTypes(TEvents[] \| TRoutes[])` | Collects types from `event()` and `route()`. |
| `route(path: string, callback: Function, initialize: Function)` | Creates a route. |
| `event(eventName: string, initialize: Function)` | Creates an event. |
| `listen(port: number)` | Listens to the declared port. |

### `createWSHooks(options: Options | () => Options)`

Creates a routes client using types from the server that returns React hooks.

#### Returns

| Name | Description |
| --- | --- |
| `clearQuery(path: string, args: TArgs)` | Clears the query from the cache. |
| `preloadSubscription(path: string, args: TArgs)` | Preloads the subscription. |
| `useSubscription(path: string, args: TArgs)` | Returns the value of a preloaded subscription. |
| `useLazySubscription(path: string, args: TArgs)` | Returns the value of a subscription. |

### `createWSEvents(options: Options | () => Options)`

Creates an events client using types from the server.

#### Returns

| Name                                        | Description         |
| ------------------------------------------- | ------------------- |
| `on(eventName: string, callback: Function)` | Listen to an event. |
