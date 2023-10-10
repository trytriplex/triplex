/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { createContext } from "react";
import { useTexture } from "@react-three/drei";

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

const ControllerContext = createContext<boolean>(null);

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
