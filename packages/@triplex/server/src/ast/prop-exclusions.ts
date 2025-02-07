/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
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
