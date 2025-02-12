/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
import { type ThreeEvent } from "@react-three/fiber";
import { useMemo, useState } from "react";
import { CanvasTexture } from "three";
import tinycolor from "tinycolor2";

function Axis({
  color,
  rotation,
  spriteSize,
}: {
  color: string;
  rotation: [number, number, number];
  spriteSize: number;
}) {
  const length = 1 - spriteSize / 2;
  const thickness = 0.05;

  return (
    <group rotation={rotation}>
      <mesh position={[length / 2, 0, 0]}>
        <boxGeometry args={[length, thickness, thickness]} />
        <meshBasicMaterial color={color} toneMapped={false} />
      </mesh>
    </group>
  );
}

function AxisHead({
  color,
  font,
  label,
  labelColor,
  onClick,
  position,
  size,
}: {
  color: `#${string}`;
  font: string;
  label?: string;
  labelColor: string;
  onClick?: (e: ThreeEvent<MouseEvent>) => void;
  position?: [number, number, number];
  size: number;
}) {
  const [active, setActive] = useState(false);
  const baseScale = label ? size : size - 0.15;

  const texture = useMemo(() => {
    const canvas = document.createElement("canvas");
    const size = 128;
    const strokeSize = size / 16;

    canvas.width = size;
    canvas.height = size;

    const context = canvas.getContext("2d")!;
    context.beginPath();
    context.arc(size / 2, size / 2, size / 2 - strokeSize / 2, 0, 2 * Math.PI);
    context.closePath();
    context.strokeStyle = color;
    context.lineWidth = strokeSize;

    if (label) {
      context.fillStyle = tinycolor(color).lighten(5).toHexString();
      context.fill();
      context.font = `${size / 2}px ${font}`;
      context.textAlign = "center";
      context.textBaseline = "middle";
      context.fillStyle = labelColor;
      context.textRendering = "optimizeSpeed";
      context.fillText(label, size / 2, size / 2 + 2);
    } else {
      context.fillStyle = tinycolor(color).lighten(20).toHexString();
      context.fill();
    }

    context.stroke();

    return new CanvasTexture(canvas);
  }, [label, color, font, labelColor]);

  return (
    <sprite
      onClick={onClick}
      onPointerOut={() => setActive(false)}
      onPointerOver={() => setActive(true)}
      position={position}
      scale={baseScale}
    >
      <spriteMaterial
        alphaTest={0.5}
        map={texture}
        opacity={active ? 1 : 0.8}
        toneMapped={false}
      />
    </sprite>
  );
}

function HelperBackground() {
  const [active, setActive] = useState(false);

  return (
    <mesh
      onPointerOut={() => setActive(false)}
      onPointerOver={() => setActive(true)}
    >
      <sphereGeometry
        args={[1.5, 48, 24]}
        ref={(geometry) => {
          if (!geometry || !geometry.index || "inverted" in geometry) {
            return;
          }

          const index = geometry.index.array;

          for (let i = 0, il = index.length / 3; i < il; i++) {
            let x = index[i * 3];
            index[i * 3] = index[i * 3 + 2];
            index[i * 3 + 2] = x;
          }

          geometry.index.needsUpdate = true;
          Object.assign(geometry, { inverted: true });
        }}
      />
      <meshBasicMaterial
        color="#fff"
        opacity={active ? 0.2 : 0.1}
        toneMapped={false}
        transparent
      />
    </mesh>
  );
}

export function AxisHelper({
  colors: {
    axis: axisColors = { x: "#ff2060", y: "#20df80", z: "#2080ff" } as const,
    text: textColor = "#000",
  } = {},
  font = "sans-serif",
  onClick,
  scale,
}: {
  colors?: {
    axis?: { x: `#${string}`; y: `#${string}`; z: `#${string}` };
    text?: `#${string}`;
  };
  font?: string;
  onClick?: (e: ThreeEvent<MouseEvent>) => void;
  scale?: number;
}) {
  const positionOffset = 1;
  const spriteSize = 0.6;

  return (
    <group scale={scale}>
      <HelperBackground />
      <Axis color={axisColors.x} rotation={[0, 0, 0]} spriteSize={spriteSize} />
      <Axis
        color={axisColors.y}
        rotation={[0, 0, Math.PI / 2]}
        spriteSize={spriteSize}
      />
      <Axis
        color={axisColors.z}
        rotation={[0, -Math.PI / 2, 0]}
        spriteSize={spriteSize}
      />
      <AxisHead
        color={axisColors.x}
        font={font}
        label="X"
        labelColor={textColor}
        onClick={onClick}
        position={[positionOffset, 0, 0]}
        size={spriteSize}
      />
      <AxisHead
        color={axisColors.y}
        font={font}
        label="Y"
        labelColor={textColor}
        onClick={onClick}
        position={[0, positionOffset, 0]}
        size={spriteSize}
      />
      <AxisHead
        color={axisColors.z}
        font={font}
        label="Z"
        labelColor={textColor}
        onClick={onClick}
        position={[0, 0, positionOffset]}
        size={spriteSize}
      />
      <AxisHead
        color={axisColors.x}
        font={font}
        labelColor={textColor}
        onClick={onClick}
        position={[-positionOffset, 0, 0]}
        size={spriteSize}
      />
      <AxisHead
        color={axisColors.y}
        font={font}
        labelColor={textColor}
        onClick={onClick}
        position={[0, -positionOffset, 0]}
        size={spriteSize}
      />
      <AxisHead
        color={axisColors.z}
        font={font}
        labelColor={textColor}
        onClick={onClick}
        position={[0, 0, -positionOffset]}
        size={spriteSize}
      />
    </group>
  );
}
