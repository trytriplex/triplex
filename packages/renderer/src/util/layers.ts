/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
import { Layers } from "three";

export const DEFAULT_LAYER_INDEX = 0;
export const defaultLayer = new Layers();

export const EDITOR_LAYER_INDEX = 31;
export const editorLayer = new Layers();
editorLayer.set(EDITOR_LAYER_INDEX);

export const HIDDEN_LAYER_INDEX = 30;
export const hiddenLayer = new Layers();
hiddenLayer.set(HIDDEN_LAYER_INDEX);

export const SELECTION_LAYER_INDEX = 29;
export const selectionLayer = new Layers();
selectionLayer.set(SELECTION_LAYER_INDEX);

export const HOVER_LAYER_INDEX = 28;
export const hoverLayer = new Layers();
hoverLayer.set(HOVER_LAYER_INDEX);

export const allLayers = new Layers();
allLayers.enableAll();
