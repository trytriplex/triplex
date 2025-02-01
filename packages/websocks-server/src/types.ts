/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
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
