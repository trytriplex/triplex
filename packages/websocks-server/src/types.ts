/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
import { type WebSocket } from "ws";

export interface AliveWebSocket extends WebSocket {
  isAlive: boolean;
}

export type RouteHandler = (
  path: string,
) => ((ws: WebSocket) => Promise<void>) | false;

export type UnionToIntersection<U> = (
  U extends unknown ? (k: U) => void : never
) extends (k: infer I) => void
  ? I
  : never;

export interface RouteOpts {
  defer?: boolean;
}

export type ValidateShape<T, Shape> = T extends Shape
  ? Exclude<keyof T, keyof Shape> extends never
    ? T
    : never
  : never;

export type ExtractParams<TRoute extends string> =
  TRoute extends `${infer TStart}/${infer TEnd}`
    ? ExtractParams<TStart> & ExtractParams<TEnd>
    : TRoute extends `:${infer TParam}`
      ? { [P in TParam]: string }
      : // eslint-disable-next-line @typescript-eslint/ban-types
        {};

export type RouteParams<TRoute extends string> =
  ValidateShape<
    ExtractParams<TRoute>,
    // eslint-disable-next-line @typescript-eslint/ban-types
    {}
  > extends never
    ? ExtractParams<TRoute>
    : never;
