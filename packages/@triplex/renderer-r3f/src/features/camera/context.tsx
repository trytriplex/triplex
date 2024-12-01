/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */

import { type default as CameraControlsImpl } from "camera-controls";
import { createContext, useContext } from "react";
import { type OrthographicCamera, type PerspectiveCamera } from "three";

export interface CameraContextType {
  camera: CameraType | undefined;
  controls: React.MutableRefObject<CameraControlsImpl | null>;
  isTriplexCamera: boolean;
}

export type CameraType = OrthographicCamera | PerspectiveCamera;

export function useCamera() {
  const context = useContext(CameraContext);
  return context;
}

export const CameraContext = createContext<CameraContextType>({
  camera: undefined,
  controls: { current: null },
  isTriplexCamera: true,
});
