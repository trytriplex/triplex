/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { useId } from "react";
import { style } from "./string";

const svgStyles = style({
  overflow: "visible",
});

const splashStyles = style({
  alignItems: "center",
  display: "flex",
  inset: "0px",
  justifyContent: "center",
  pointerEvents: "none",
  position: "fixed",
  strokeWidth: "8px",
});

const hintStyles = style({
  pointerEvents: "none",
  position: "fixed",
  right: "12px",
  strokeWidth: "12px",
  top: "12px",
});

const fillStyles = style({
  fill: "currentColor",
});

const strokeStyles = style({
  fill: "transparent",
  stroke: "currentColor",
});

const idleStrokeStyles = style({
  fill: "transparent",
  opacity: 0.1,
  stroke: "currentColor",
});

export type LoadingVariant = "idle" | "fill" | "stroke";

export type LoadingColor =
  | "rgb(59 130 246)"
  | "currentColor"
  | "white"
  | "black";

export type LoadingPosition = "splash" | "hint";

export const loadingLogo = ({
  color = "currentColor",
  id = "_t",
  position,
  variant,
}: {
  color?: LoadingColor;
  id?: string;
  position: LoadingPosition;
  variant: LoadingVariant;
}) => `
<div style="color:${color};${position === "splash" ? splashStyles : hintStyles}">
  <style>
    @keyframes pulse_${id} {
      0% { transform: scale(1) }
      40% { transform: scale(0.9) }
      60% { transform: scale(0.9) }
      100% { transform: scale(1) }
    }

    .pulse_${id} {
      transform-origin: center 46%;
      animation: pulse_${id} 0.33s ease-in-out;
    }

    @keyframes draw_${id} {
      10% { stroke-dashoffset: 533; }
      33% { stroke-dashoffset: 500; }
      100% { stroke-dashoffset: 400; }
    }

    .draw_${id} {
      stroke-dasharray: 1000;
      stroke-dashoffset: 1000;
      animation: draw_${id} 10s ease-in-out;
      animation-fill-mode: forwards;
    }
  </style>
  <svg style="${svgStyles}" width="${position === "splash" ? 150 : 50}" height="${position === "splash" ? 150 : 50}" viewBox="0 0 274.84 312.04" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <path id="path_${id}" d="M245.51 224.02c-16.73-10.02-33.47-20.04-50.2-30.06-13.68 16.69-34.46 27.35-57.72 27.35s-44.44-10.87-58.11-27.84c-17.9 10.62-35.81 21.25-53.71 31.87-.77.71-4.59 4.38-4.82 10.32-.18 4.74 2.03 8.1 2.79 9.15 32.49 20.21 64.98 40.41 97.47 60.62 8.82 8.82 23.11 8.82 31.93 0 32.15-20.15 64.3-40.31 96.45-60.46.6-.49 4.64-3.89 4.65-9.31.01-5.04-3.47-9.76-8.73-11.64ZM270.44 61.37a22.39 22.39 0 0 0-6.21-5.56C230.11 37.23 195.98 18.65 161.86.06c-.9-.09-5.16-.44-8.94 2.55-4.64 3.68-4.63 9.3-4.62 9.97.01 20.1.03 40.19.04 60.29 36.1 5.22 63.85 36.27 63.85 73.82 0 9.62-1.84 18.8-5.15 27.24 14.32 7.63 31.66 16.75 51.24 26.9.39.24 4.83 2.9 9.84.75 5-2.15 6.13-7.17 6.22-7.63.17-40.66.33-81.33.5-121.99-.3-2.15-1.2-6.42-4.39-10.59ZM62.98 146.7c0-37.43 27.57-68.42 63.51-73.78.02-20.11.03-40.22.04-60.33.01-.67.02-6.29-4.62-9.97-3.77-3-8.03-2.65-8.93-2.56C78.85 18.65 44.73 37.23 10.6 55.81c-1.65 1-4.06 2.74-6.21 5.56C1.2 65.55.3 69.81-.01 71.96c.17 40.66.33 81.33.5 121.99.09.46 1.23 5.48 6.22 7.63 5.01 2.15 9.45-.5 9.84-.75a5323.28 5323.28 0 0 0 51.51-27.04 74.298 74.298 0 0 1-5.09-27.09Z" />
      <circle id="circle_${id}" cx="137.58" cy="146.01" r="47.45" />
      <clipPath id="path_clip_${id}"><use xlink:href="#path_${id}"/></clipPath>
      <clipPath id="circle_clip_${id}"><use xlink:href="#circle_${id}"/></clipPath>
    </defs>
    <g>
	    ${variant === "fill" ? `<use xlink:href="#path_${id}" clip-path="url(#path_clip_${id})" class="${`pulse_${id}`}" style="${fillStyles}" />` : ""}
      ${variant === "fill" ? `<use xlink:href="#circle_${id}" clip-path="url(#circle_clip_${id})" style="${fillStyles}" />` : ""}
      ${variant === "stroke" ? `<use xlink:href="#path_${id}" clip-path="url(#path_clip_${id})" class="${`draw_${id}`}" style="${strokeStyles}" />` : ""}
      ${variant === "stroke" ? `<use xlink:href="#circle_${id}" clip-path="url(#circle_clip_${id})" class="${`draw_${id}`}" style="${strokeStyles}"  />` : ""}
      ${variant === "stroke" || variant === "idle" ? `<use xlink:href="#path_${id}" clip-path="url(#path_clip_${id})" style="${idleStrokeStyles}" />` : ""}
      ${variant === "stroke" || variant === "idle" ? `<use xlink:href="#circle_${id}" clip-path="url(#circle_clip_${id})" style="${idleStrokeStyles}" />` : ""}
    </g>
  </svg>
</div>
`;

export function LoadingLogo({
  color,
  position,
  variant,
}: {
  color?: LoadingColor;
  position: LoadingPosition;
  variant: LoadingVariant;
}) {
  const id = useId().replaceAll(":", "");

  return (
    <div
      dangerouslySetInnerHTML={{
        __html: loadingLogo({
          color,
          id,
          position,
          variant,
        }),
      }}
    />
  );
}
