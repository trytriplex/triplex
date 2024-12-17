/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */

import { type NodePath } from "@babel/core";
import type * as t from "@babel/types";
import { type ThreeElements } from "@react-three/fiber";
import { resolveIdentifierImportSpecifier } from "./babel";

const elements: Record<string, boolean> = {
  ambientLight: true,
  ambientLightProbe: true,
  arrayCamera: true,
  arrowHelper: true,
  audioListener: true,
  axesHelper: true,
  batchedMesh: true,
  bone: true,
  box3Helper: true,
  boxBufferGeometry: true,
  boxGeometry: true,
  boxHelper: true,
  bufferAttribute: true,
  bufferGeometry: true,
  camera: true,
  cameraHelper: true,
  canvasTexture: true,
  capsuleGeometry: true,
  circleBufferGeometry: true,
  circleGeometry: true,
  color: true,
  compressedTexture: true,
  coneBufferGeometry: true,
  coneGeometry: true,
  cubeCamera: true,
  cubeTexture: true,
  cylinderBufferGeometry: true,
  cylinderGeometry: true,
  dataTexture: true,
  dataTexture3D: true,
  depthTexture: true,
  directionalLight: true,
  directionalLightHelper: true,
  directionalLightShadow: true,
  dodecahedronBufferGeometry: true,
  dodecahedronGeometry: true,
  edgesGeometry: true,
  euler: true,
  extrudeBufferGeometry: true,
  extrudeGeometry: true,
  float16BufferAttribute: true,
  float32BufferAttribute: true,
  float64BufferAttribute: true,
  fog: true,
  fogExp2: true,
  gridHelper: true,
  group: true,
  hemisphereLight: true,
  hemisphereLightHelper: true,
  hemisphereLightProbe: true,
  icosahedronBufferGeometry: true,
  icosahedronGeometry: true,
  instancedBufferAttribute: true,
  instancedBufferGeometry: true,
  instancedMesh: true,
  int16BufferAttribute: true,
  int32BufferAttribute: true,
  int8BufferAttribute: true,
  lOD: true,
  latheBufferGeometry: true,
  latheGeometry: true,
  light: true,
  lightProbe: true,
  lightShadow: true,
  lineBasicMaterial: true,
  lineDashedMaterial: true,
  lineLoop: true,
  lineSegments: true,
  material: true,
  matrix3: true,
  matrix4: true,
  mesh: true,
  meshBasicMaterial: true,
  meshDepthMaterial: true,
  meshDistanceMaterial: true,
  meshLambertMaterial: true,
  meshMatcapMaterial: true,
  meshNormalMaterial: true,
  meshPhongMaterial: true,
  meshPhysicalMaterial: true,
  meshStandardMaterial: true,
  meshToonMaterial: true,
  object3D: true,
  octahedronBufferGeometry: true,
  octahedronGeometry: true,
  orthographicCamera: true,
  perspectiveCamera: true,
  planeBufferGeometry: true,
  planeGeometry: true,
  planeHelper: true,
  pointLight: true,
  pointLightHelper: true,
  points: true,
  pointsMaterial: true,
  polarGridHelper: true,
  polyhedronBufferGeometry: true,
  polyhedronGeometry: true,
  positionalAudio: true,
  primitive: true,
  quaternion: true,
  rawShaderMaterial: true,
  raycaster: true,
  rectAreaLight: true,
  ringBufferGeometry: true,
  ringGeometry: true,
  scene: true,
  shaderMaterial: true,
  shadowMaterial: true,
  shape: true,
  shapeBufferGeometry: true,
  shapeGeometry: true,
  skeleton: true,
  skeletonHelper: true,
  skinnedMesh: true,
  sphereBufferGeometry: true,
  sphereGeometry: true,
  spotLight: true,
  spotLightHelper: true,
  spotLightShadow: true,
  sprite: true,
  spriteMaterial: true,
  tetrahedronBufferGeometry: true,
  tetrahedronGeometry: true,
  texture: true,
  torusBufferGeometry: true,
  torusGeometry: true,
  torusKnotBufferGeometry: true,
  torusKnotGeometry: true,
  tubeBufferGeometry: true,
  tubeGeometry: true,
  uint16BufferAttribute: true,
  uint32BufferAttribute: true,
  uint8BufferAttribute: true,
  vector2: true,
  vector3: true,
  vector4: true,
  videoTexture: true,
  wireframeGeometry: true,
} satisfies Record<keyof ThreeElements, boolean>;

export const THREE_FIBER_MODULES = /(^@react-three\/)|(^ecctrl$)/;

export function isReactThreeElement(elementName: string): boolean {
  return elements[elementName] ?? false;
}

export function isCanvasFromThreeFiber(path: NodePath<t.JSXElement>): boolean {
  const identifierPath = path.get("openingElement").get("name");
  if (!identifierPath.isJSXIdentifier()) {
    return false;
  }

  const importSpecifierPath = resolveIdentifierImportSpecifier(identifierPath);
  if (!importSpecifierPath) {
    return false;
  }

  return (
    importSpecifierPath.get("imported").isIdentifier({ name: "Canvas" }) &&
    importSpecifierPath.parentPath.isImportDeclaration() &&
    importSpecifierPath.parentPath
      .get("source")
      .isStringLiteral({ value: "@react-three/fiber" })
  );
}

export function isComponentFromThreeFiber(path: NodePath<t.JSXElement>) {
  const identifierPath = path.get("openingElement").get("name");
  if (!identifierPath.isJSXIdentifier()) {
    return false;
  }

  const importSpecifierPath = resolveIdentifierImportSpecifier(identifierPath);
  if (
    !importSpecifierPath ||
    !importSpecifierPath.parentPath.isImportDeclaration()
  ) {
    return false;
  }

  const source = importSpecifierPath.parentPath.get("source");

  if (!source.isStringLiteral()) {
    return false;
  }

  return THREE_FIBER_MODULES.test(source.node.value);
}
