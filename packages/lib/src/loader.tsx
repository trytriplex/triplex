/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
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
  strokeWidth: "2px",
});

const hintStyles = style({
  pointerEvents: "none",
  position: "fixed",
  right: "12px",
  strokeWidth: "2px",
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
      animation: pulse_${id} 0.3s ease-in-out;
    }

    @keyframes draw_${id} {
      10% { stroke-dashoffset: 800; }
      50% { stroke-dashoffset: 750; }
      100% { stroke-dashoffset: 700; }
    }

    .draw_${id} {
      stroke-dasharray: 1000;
      stroke-dashoffset: 1000;
      animation: draw_${id} 10s ease-in-out;
      animation-fill-mode: forwards;
    }
  </style>
  <svg style="${svgStyles}" width="${position === "splash" ? 150 : 50}" height="${position === "splash" ? 150 : 50}" viewBox="0 0 420.84 476.6" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <path vector-effect="non-scaling-stroke" id="path_${id}" d="M376.77 340.58c-25.9-14.93-51.8-29.87-77.7-44.8-20.95 25.56-52.76 41.87-88.39 41.87s-68.05-16.64-88.99-42.63c-26.92 15.97-53.83 31.95-80.75 47.92-.92.67-8.55 6.42-8.87 16.69-.31 9.76 6.23 15.82 7.16 16.65 70.85 48.5 124.6 82.67 143.72 92.95 5.14 2.76 14.68 7.53 27.09 7.37 11.78-.15 20.73-4.63 25.48-7.2 18.89-10.21 73.24-45.05 145.07-94.39 3.05-2.59 8.6-8.11 8.71-15.38.13-8.24-6.16-15.38-12.53-19.05ZM414.12 92.76c-3.31-4.33-7.01-6.96-9.51-8.52-9.89-6.14-69.23-38.1-150.88-81.04-3.36-1.41-12.82-4.9-19.56-.42-5.53 3.67-7.08 10.94-7.08 15.27.02 30.77.04 61.55.07 92.32 55.29 7.99 97.77 55.55 97.77 113.04 0 14.72-2.82 28.78-7.89 41.7 21.93 11.68 48.48 25.65 78.46 41.19.6.37 7.39 4.44 15.06 1.15 7.65-3.29 9.39-10.98 9.53-11.68.25-62.27.51-124.53.76-186.8-.46-3.29-1.84-9.82-6.73-16.22ZM96.43 223.42c0-57.32 42.22-104.77 97.26-112.98.02-30.79.05-61.59.07-92.38 0-4.63-1.73-11.43-7.08-15.27-6.36-4.57-15.08-2.37-18.38-1.37-82.34 44-142.18 76.68-152.06 82.82-2.28 1.41-6.09 4.04-9.51 8.52C1.84 99.16.46 105.69 0 108.98c.25 62.27.51 124.53.76 186.8.14.7 1.88 8.39 9.53 11.68 7.67 3.3 14.46-.77 15.06-1.15 30.17-15.64 56.87-29.69 78.88-41.41-5.02-12.86-7.8-26.84-7.8-41.48Z" />
      <circle vector-effect="non-scaling-stroke" id="circle_${id}" cx="210.68" cy="222.36" r="72.66" />
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
