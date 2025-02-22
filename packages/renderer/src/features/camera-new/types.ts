/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */

import { type OrthographicCamera, type PerspectiveCamera } from "three";

export type CanvasCamera = "editor" | "default";

export type EditorCameraType = "perspective" | "orthographic";

export type CameraType = PerspectiveCamera | OrthographicCamera;
