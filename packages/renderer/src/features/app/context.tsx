/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */

import { noop } from "@triplex/lib";
import { createContext } from "react";
import { type Component } from "./types";

type SetComponent = (component: Component) => void;

export const SwitchToComponentContext = createContext<SetComponent>(noop);
