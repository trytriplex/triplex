/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */

export interface PropGroupDef {
  defaultExpanded: boolean;
  order: number;
}

export type ThreeFiberGroups =
  | "Appearance"
  | "Blend"
  | "Constructor"
  | "Render"
  | "Stencil"
  | "Texture"
  | "Transform";

export const threeFiberPropGrouping: Record<string, ThreeFiberGroups> = {
  alphaHash: "Appearance",
  alphaTest: "Appearance",
  alphaToCoverage: "Appearance",
  aoMapIntensity: "Texture",
  args: "Constructor",
  aspect: "Appearance",
  attach: "Constructor",
  blendAlpha: "Blend",
  blendColor: "Blend",
  blendDst: "Blend",
  blendDstAlpha: "Blend",
  blendEquation: "Blend",
  blendEquationAlpha: "Blend",
  blendSrc: "Blend",
  blendSrcAlpha: "Blend",
  blending: "Blend",
  bumpScale: "Texture",
  castShadow: "Appearance",
  children: "Appearance",
  clipIntersection: "Render",
  clipShadows: "Render",
  color: "Appearance",
  colorWrite: "Render",
  combine: "Render",
  depthFunc: "Render",
  depthTest: "Render",
  depthWrite: "Render",
  displacementBias: "Texture",
  displacementScale: "Texture",
  dithering: "Appearance",
  emissive: "Appearance",
  emissiveIntensity: "Appearance",
  envMapIntensity: "Texture",
  far: "Appearance",
  flatShading: "Appearance",
  focus: "Appearance",
  fog: "Appearance",
  fov: "Appearance",
  frustumCulled: "Render",
  intensity: "Appearance",
  layers: "Render",
  lightMapIntensity: "Texture",
  metalness: "Appearance",
  name: "Constructor",
  near: "Appearance",
  normalMapType: "Texture",
  opacity: "Appearance",
  position: "Transform",
  premultiplyAlpha: "Appearance",
  receiveShadow: "Appearance",
  reflectivity: "Appearance",
  renderOrder: "Render",
  resolution: "Appearance",
  rotation: "Transform",
  roughness: "Appearance",
  scale: "Transform",
  shadow: "Appearance",
  shadowSide: "Render",
  side: "Render",
  stencilFail: "Stencil",
  stencilFunc: "Stencil",
  stencilFuncMask: "Stencil",
  stencilRef: "Stencil",
  stencilWrite: "Stencil",
  stencilWriteMask: "Stencil",
  stencilZFail: "Stencil",
  stencilZPass: "Stencil",
  toneMapped: "Appearance",
  transparent: "Appearance",
  vertexColors: "Appearance",
  visible: "Appearance",
  wireframe: "Appearance",
  zoom: "Appearance",
};

export type ReactDOMGroups = "Accessibility" | "Appearance" | "Form" | "Media";

export const reactDOMPropGrouping: Record<string, ReactDOMGroups> = {
  accept: "Form",
  action: "Form",
  allow: "Media",
  alt: "Media",
  "aria-description": "Accessibility",
  "aria-label": "Accessibility",
  "aria-level": "Accessibility",
  autoFocus: "Accessibility",
  autoPlay: "Media",
  checked: "Form",
  children: "Appearance",
  className: "Appearance",
  colSpan: "Appearance",
  cols: "Appearance",
  crossOrigin: "Media",
  decoding: "Media",
  defaultChecked: "Form",
  defaultValue: "Form",
  dir: "Accessibility",
  disabled: "Form",
  fetchPriority: "Media",
  hidden: "Appearance",
  high: "Form",
  href: "Media",
  htmlFor: "Form",
  id: "Accessibility",
  label: "Accessibility",
  loading: "Media",
  loop: "Media",
  low: "Form",
  max: "Form",
  maxLength: "Form",
  min: "Form",
  minLength: "Form",
  muted: "Media",
  name: "Form",
  optimum: "Form",
  pattern: "Form",
  ping: "Media",
  placeholder: "Appearance",
  playsInline: "Media",
  preload: "Media",
  readOnly: "Form",
  referrerPolicy: "Media",
  required: "Form",
  reversed: "Appearance",
  role: "Accessibility",
  rowSpan: "Appearance",
  rows: "Appearance",
  span: "Appearance",
  src: "Media",
  step: "Form",
  tabIndex: "Accessibility",
  target: "Media",
  title: "Appearance",
  type: "Appearance",
  value: "Form",
};

export const propGroupsDef: Record<string, PropGroupDef | undefined> = {
  Accessibility: {
    defaultExpanded: false,
    order: 100,
  },
  Appearance: {
    defaultExpanded: true,
    order: 20,
  },
  Blend: {
    defaultExpanded: false,
    order: 60,
  },
  Constructor: {
    defaultExpanded: true,
    order: 0,
  },
  Form: {
    defaultExpanded: false,
    order: 30,
  },
  Media: {
    defaultExpanded: true,
    order: 30,
  },
  Other: {
    defaultExpanded: false,
    order: 999,
  },
  Render: {
    defaultExpanded: false,
    order: 50,
  },
  Stencil: {
    defaultExpanded: false,
    order: 100,
  },
  Texture: {
    defaultExpanded: true,
    order: 50,
  },
  Transform: {
    defaultExpanded: true,
    order: 10,
  },
} satisfies Record<ThreeFiberGroups | ReactDOMGroups | "Other", PropGroupDef>;
