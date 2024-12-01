/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { useThree, type ThreeEvent } from "@react-three/fiber";
import { send } from "@triplex/bridge/client";
import { type default as CameraControls } from "camera-controls";
import { useMemo, useState } from "react";
import {
  CanvasTexture,
  Spherical,
  Vector3,
  type Object3D,
  type Vector3Tuple,
} from "three";
import { GizmoHelper } from "triplex-drei";
import { editorLayer } from "../../util/layers";
import { buildSceneSphere } from "../../util/scene";
import { useCamera } from "./context";

const tweenCamera = (
  controls: CameraControls,
  scene: Object3D,
  position: Vector3,
) => {
  const sphere = buildSceneSphere(scene);
  if (sphere.isEmpty()) {
    return;
  }

  const point = new Spherical().setFromVector3(
    new Vector3(position.x, position.y, position.z),
  );
  controls.rotateTo(point.theta, point.phi, true);
  controls.fitToSphere(sphere, true);
};

type GenericProps = {
  color?: string;
  faces?: string[];
  font?: string;
  hoverColor?: string;
  onClick?: (e: ThreeEvent<MouseEvent>) => null;
  opacity?: number;
  strokeColor?: string;
  textColor?: string;
};
type FaceTypeProps = { hover: boolean; index: number } & GenericProps;
type EdgeCubeProps = { dimensions: Vector3Tuple; position: Vector3 } & Omit<
  GenericProps,
  "font" & "color"
>;

const colors = { bg: "#f0f0f0", hover: "#999", stroke: "black", text: "black" };
const defaultFaces = ["Right", "Left", "Top", "Bottom", "Front", "Back"];

const toVector = (xyz: number[]) => new Vector3(...xyz).multiplyScalar(0.38);

const corners: Vector3[] = [
  [1, 1, 1],
  [1, 1, -1],
  [1, -1, 1],
  [1, -1, -1],
  [-1, 1, 1],
  [-1, 1, -1],
  [-1, -1, 1],
  [-1, -1, -1],
].map(toVector);

const cornerDimensions: Vector3Tuple = [0.25, 0.25, 0.25];

const edges: Vector3[] = [
  [1, 1, 0],
  [1, 0, 1],
  [1, 0, -1],
  [1, -1, 0],
  [0, 1, 1],
  [0, 1, -1],
  [0, -1, 1],
  [0, -1, -1],
  [-1, 1, 0],
  [-1, 0, 1],
  [-1, 0, -1],
  [-1, -1, 0],
].map(toVector);

const edgeDimensions = edges.map(
  (edge) =>
    edge
      .toArray()
      .map((axis: number): number => (axis == 0 ? 0.5 : 0.25)) as Vector3Tuple,
);

const FaceMaterial = ({
  color = colors.bg,
  faces = defaultFaces,
  font = "20px Inter var, Arial, sans-serif",
  hover,
  hoverColor = colors.hover,
  index,
  strokeColor = colors.stroke,
  textColor = colors.text,
}: FaceTypeProps) => {
  const texture = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 128;
    canvas.height = 128;
    const context = canvas.getContext("2d")!;
    context.fillStyle = color;
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.strokeStyle = strokeColor;
    context.lineWidth = 2;
    context.strokeRect(0, 0, canvas.width, canvas.height);
    context.font = font;
    context.textAlign = "center";
    context.fillStyle = textColor;
    context.fillText(faces[index], 64, 76);
    return new CanvasTexture(canvas);
  }, [index, faces, font, color, textColor, strokeColor]);

  return (
    <meshStandardMaterial
      attach={`material-${index}`}
      color={hover ? hoverColor : "white"}
      emissive={hover ? "white" : "black"}
      emissiveIntensity={hover ? 0.06 : 1}
      map={texture}
      opacity={hover ? 1 : 0.5}
      transparent
    />
  );
};

const FaceCube = ({ onClick, ...props }: GenericProps) => {
  const [hover, setHover] = useState<number | null>(null);

  const handlePointerOut = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    setHover(null);
  };

  const handlePointerMove = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    setHover(Math.floor(e.faceIndex! / 2));
  };

  return (
    <mesh
      onClick={onClick}
      onPointerMove={handlePointerMove}
      onPointerOut={handlePointerOut}
    >
      {[...Array(6)].map((_, index) => (
        <FaceMaterial
          hover={hover === index}
          index={index}
          key={index}
          {...props}
        />
      ))}
      <boxGeometry />
    </mesh>
  );
};

const EdgeCube = ({
  dimensions,
  hoverColor = colors.hover,
  onClick,
  position,
}: EdgeCubeProps): JSX.Element => {
  const [hover, setHover] = useState<boolean>(false);

  const handlePointerOut = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    setHover(false);
  };

  const handlePointerOver = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    setHover(true);
  };

  return (
    <mesh
      onClick={onClick}
      onPointerOut={handlePointerOut}
      onPointerOver={handlePointerOver}
      position={position}
      scale={1.01}
    >
      <meshBasicMaterial
        color={hover ? hoverColor : "white"}
        opacity={0.4}
        transparent
        visible={hover}
      />
      <boxGeometry args={dimensions} />
    </mesh>
  );
};

function GizmoViewcube(props: GenericProps) {
  return (
    <group scale={[50, 50, 50]}>
      <FaceCube {...props} />
      {edges.map((edge, index) => (
        <EdgeCube
          dimensions={edgeDimensions[index]}
          key={index}
          position={edge}
          {...props}
        />
      ))}
      {corners.map((corner, index) => (
        <EdgeCube
          dimensions={cornerDimensions}
          key={index}
          position={corner}
          {...props}
        />
      ))}

      <ambientLight intensity={4} />
    </group>
  );
}

export function CameraGizmo() {
  const { controls, isTriplexCamera } = useCamera();
  const scene = useThree((store) => store.scene);

  if (!isTriplexCamera) {
    return null;
  }

  return (
    <GizmoHelper
      alignment="bottom-right"
      layers={editorLayer}
      margin={[50, 50]}
      renderPriority={2}
    >
      <GizmoViewcube
        color="rgb(30 30 30)"
        font="30px ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Noto Sans, Ubuntu, Cantarell, Helvetica Neue, Arial, sans-serif"
        onClick={(e) => {
          if (!controls.current) {
            return null;
          }

          e.stopPropagation();

          if (
            e.eventObject.position.x === 0 &&
            e.eventObject.position.y === 0 &&
            e.eventObject.position.z === 0
          ) {
            tweenCamera(controls.current, scene, e.face!.normal);
          } else {
            tweenCamera(controls.current, scene, e.eventObject.position);
          }

          send("track", { actionId: "controls_viewcube" });

          return null;
        }}
        strokeColor="rgb(115 115 115)"
        textColor="rgb(212 212 212)"
      />
    </GizmoHelper>
  );
}
