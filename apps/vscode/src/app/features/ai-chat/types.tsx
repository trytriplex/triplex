/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */

import { type JSX } from "react";

export type ChatRenderableChildren =
  | JSX.Element
  | string
  | ChatRenderableChildren[];

export type ChatRenderableProps<TProps extends object = object> = {
  children?: ChatRenderableChildren;
  isResolved: boolean;
} & Partial<TProps>;
