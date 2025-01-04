/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */

import { noop } from "@triplex/lib";
import { createContext } from "react";
import { type Component } from "./types";

type SetComponent = (component: Component) => void;

export const SwitchToComponentContext = createContext<SetComponent>(noop);
