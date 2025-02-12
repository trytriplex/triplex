/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */

export const globalPropsExclusions: Record<string, true> = {
  key: true,
  ref: true,
};

export const threejsPropsExclusions: Record<string, true> = {
  id: true,
  isBufferGeometry: true,
  isMaterial: true,
  isMesh: true,
  isMeshStandardMaterial: true,
  isObject3D: true,
  matrix: true,
  matrixAutoUpdate: true,
  matrixWorld: true,
  matrixWorldAutoUpdate: true,
  matrixWorldNeedsUpdate: true,
  modelViewMatrix: true,
  needsUpdate: true,
  normalMatrix: true,
  type: true,
  up: true,
  uuid: true,
  value: true,
  version: true,
  zoom0: true,
};
