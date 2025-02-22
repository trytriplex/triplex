/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */

import { type Size } from "@react-three/fiber";
import {
  type OrthographicCamera,
  type PerspectiveCamera,
  type WebGLRenderer,
} from "three";

export function fitCamerasToViewport(
  gl: WebGLRenderer,
  cameras: (PerspectiveCamera | OrthographicCamera)[],
) {
  function callback() {
    const size: Size = {
      height: gl.domElement.clientHeight,
      left: 0,
      top: 0,
      width: gl.domElement.clientWidth,
    };

    cameras.forEach((camera) => {
      if ("isOrthographicCamera" in camera) {
        const left = size.width / -2;
        const right = size.width / 2;
        const top = size.height / 2;
        const bottom = size.height / -2;

        camera.left = left;
        camera.right = right;
        camera.top = top;
        camera.bottom = bottom;
        camera.updateProjectionMatrix();
      } else {
        camera.aspect = size.width / size.height;
        camera.updateProjectionMatrix();
      }
    });
  }

  const observer = new ResizeObserver(callback);
  observer.observe(gl.domElement);

  return () => {
    observer.disconnect();
  };
}
