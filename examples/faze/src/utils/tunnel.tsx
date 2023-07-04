/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import tunnel from "tunnel-rat";

const Tunnel = tunnel();

export const DOM = Tunnel.In;

export const RenderDOM = Tunnel.Out;
