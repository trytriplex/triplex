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
  isAmbientLight: true,
  isBufferGeometry: true,
  isDirectionalLight: true,
  isGroup: true,
  isHemisphereLight: true,
  isLight: true,
  isLineBasicMaterial: true,
  isLineDashedMaterial: true,
  isMaterial: true,
  isMesh: true,
  isMeshBasicMaterial: true,
  isMeshDepthMaterial: true,
  isMeshDistanceMaterial: true,
  isMeshLambertMaterial: true,
  isMeshMatcapMaterial: true,
  isMeshNormalMaterial: true,
  isMeshPhongMaterial: true,
  isMeshPhysicalMaterial: true,
  isMeshStandardMaterial: true,
  isMeshToonMaterial: true,
  isObject3D: true,
  isPointLight: true,
  isPointsMaterial: true,
  isRawShaderMaterial: true,
  isRectAreaLight: true,
  isShaderMaterial: true,
  isShadowMaterial: true,
  isSpotLight: true,
  isSpriteMaterial: true,
  matrix: true,
  matrixAutoUpdate: true,
  matrixWorldAutoUpdate: true,
  matrixWorldNeedsUpdate: true,
  needsUpdate: true,
  type: true,
  up: true,
  uuid: true,
  version: true,
};
