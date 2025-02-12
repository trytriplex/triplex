/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
import tunnel from "tunnel-rat";

const Tunnel = tunnel();

export const DOM = Tunnel.In;

export const RenderDOM = Tunnel.Out;
