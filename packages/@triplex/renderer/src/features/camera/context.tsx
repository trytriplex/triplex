/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */

import { type default as CameraControlsImpl } from "camera-controls";
import { createContext, useContext } from "react";
import { type OrthographicCamera, type PerspectiveCamera } from "three";

export interface CameraContextType {
  camera: CameraType | null;
  controls: CameraControlsImpl | null;
  isTriplexCamera: boolean;
}

export type CameraType = OrthographicCamera | PerspectiveCamera;

export function useCamera() {
  const context = useContext(CameraContext);
  return context;
}

export const CameraContext = createContext<CameraContextType>({
  camera: null,
  controls: null,
  isTriplexCamera: true,
});
