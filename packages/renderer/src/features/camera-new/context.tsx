/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */

import { type default as CameraControls } from "camera-controls";
import { createContext } from "react";
import { type OrthographicCamera, type PerspectiveCamera } from "three";
import { type CanvasCamera } from "./types";

export type ActiveCameraContextValue = {
  camera: PerspectiveCamera | OrthographicCamera;
  type: CanvasCamera;
} | null;

export const ActiveCameraContext =
  createContext<ActiveCameraContextValue>(null);

export const CameraControlsContext = createContext<CameraControls | null>(null);
