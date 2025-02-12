/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
import { useTexture } from "@react-three/drei";
import { createContext } from "react";

interface ChildrenProps {
  playerNear: boolean;
}

export function Placeholder() {
  const map = useTexture("/textures/purple/texture_06.png");

  return (
    <mesh castShadow position={[0, 0.5, 0]} receiveShadow>
      <boxGeometry args={[0.5, 1, 0.5]} />
      <meshStandardMaterial map={map} />
    </mesh>
  );
}

const ControllerContext = createContext<boolean | null>(null);

const defaultChildren = () => <Placeholder />;

export function NPCEntity({
  cameraOffset,
  children,
  mesh = defaultChildren,
  position,
}: {
  cameraOffset?: [number, number, number];
  children?: JSX.Element | JSX.Element[];
  mesh?: (opts: ChildrenProps) => JSX.Element;
  position: [number, number, number];
}) {
  return (
    <>
      {cameraOffset && <mesh name="offset" />}
      <group position={position}>{mesh({ playerNear: true })}</group>
      <ControllerContext.Provider value={null}>
        {children}
      </ControllerContext.Provider>
    </>
  );
}
