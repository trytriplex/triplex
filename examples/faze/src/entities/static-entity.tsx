/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { useTexture } from "@react-three/drei";
import { useCallback, useState } from "react";
import { Vector3Tuple } from "three";
import { Component, Entity } from "../ecs/store";
import { OnWorldEventHandler } from "../ecs/types";
import { empty } from "../math/vectors";
import { BoundingBox } from "../systems/bounding-box";

interface ChildrenProps {
  playerNear: boolean;
}

function Placeholder() {
  const map = useTexture("/textures/dark/texture_04.png");

  return (
    <mesh>
      <boxGeometry args={[0.25, 1, 0.25]} />
      <meshStandardMaterial map={map} />
    </mesh>
  );
}

export function StaticEntity({
  activateDistance = 5,
  body = "rigidBody",
  children = () => <Placeholder />,
  collidable = true,
  components,
  onClick,
  position,
}: {
  activateDistance?: number;
  body?: "kinematicBody" | "rigidBody";
  children?: JSX.Element | ((opts: ChildrenProps) => JSX.Element | undefined);
  collidable?: boolean;
  components?: JSX.Element;
  onClick?: () => void;
  position: Vector3Tuple;
}) {
  const [playerNear, setPlayerNear] = useState(false);
  const childrenJsx =
    typeof children === "function" ? children({ playerNear }) : children;

  const onWorldEvent: OnWorldEventHandler = useCallback((event) => {
    switch (event) {
      case "player-approach":
        setPlayerNear(true);
        break;

      case "player-leave":
        setPlayerNear(false);
        break;

      default:
        break;
    }
  }, []);

  return (
    <Entity>
      <Component name="velocity" initialData={empty()} />

      {components}

      {childrenJsx && (
        <>
          {onClick && <Component name="onWorldEvent" data={onWorldEvent} />}
          <Component name="playerNear" data={false} />
          <Component name="activateDistance" data={activateDistance} />
          <Component name={body} data={true} />
          <Component name="box">
            <BoundingBox skip={!collidable}>
              <Component name="sceneObject">
                <group
                  onClick={playerNear ? onClick : undefined}
                  position={position}
                >
                  {childrenJsx}
                </group>
              </Component>
            </BoundingBox>
          </Component>
        </>
      )}
    </Entity>
  );
}
