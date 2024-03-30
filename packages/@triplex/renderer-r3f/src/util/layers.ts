/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { Layers } from "three";

export const EDITOR_LAYER_INDEX = 31;
export const editorLayer = new Layers();
editorLayer.set(EDITOR_LAYER_INDEX);

export const HIDDEN_LAYER_INDEX = 30;
export const hiddenLayer = new Layers();
hiddenLayer.set(HIDDEN_LAYER_INDEX);
