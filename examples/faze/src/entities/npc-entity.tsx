/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useTexture } from "@react-three/drei";
import { Component, Entity, world } from "../ecs/store";
import { useCursor } from "../utils/use-cursor";
import { OnWorldEventHandler } from "../ecs/types";
import { Vector3Tuple } from "../types";
import { empty, fromArray } from "../math/vectors";
import { noop } from "../utils/functions";
import { BoundingBox } from "../systems/bounding-box";

interface ChildrenProps {
  playerNear: boolean;
}

function Placeholder() {
  const map = useTexture("/textures/purple/texture_06.png");

  return (
    <mesh castShadow receiveShadow position={[0, 0.5, 0]}>
      <boxGeometry args={[0.5, 1, 0.5]} />
      <meshStandardMaterial map={map} />
    </mesh>
  );
}

const ControllerContext = createContext<{
  activate: () => void;
  deactivate: () => void;
  move: (positions: [Vector3Tuple, ...Vector3Tuple[]]) => void;
  resetMove: () => void;
}>({
  activate: noop,
  deactivate: noop,
  move: noop,
  resetMove: noop,
});

export function useParentNpcController() {
  return useContext(ControllerContext);
}

const defaultChildren = () => <Placeholder />;

export function NPCEntity({
  activateDistance = 30,
  children,
  mesh = defaultChildren,
  position,
  positionCycle: positions,
  speed = 1,
  cameraOffset,
  body = "rigidBody",
}: {
  activateDistance?: number;
  children?: JSX.Element | JSX.Element[];
  mesh?: (opts: ChildrenProps) => JSX.Element;
  positionCycle?: [Vector3Tuple, ...Vector3Tuple[]];
  position: Vector3Tuple;
  speed?: number;
  name?: string;
  cameraOffset?: Vector3Tuple;
  body?: "kinematicBody" | "rigidBody";
}) {
  const [index, setIndex] = useState(0);
  const [playerNear, setPlayerNear] = useState(false);
  const [positionsOverride, setPositionsOverride] = useState<
    [Vector3Tuple, ...Vector3Tuple[]] | undefined
  >(undefined);
  const { onPointerOut, onPointerOver } = useCursor();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const entity = useRef<any>(null!);
  const reconciledPositions =
    positionsOverride || [position].concat(positions || []);
  const nextPosition = fromArray(
    reconciledPositions[index % reconciledPositions.length]
  );

  const controller = useMemo(
    () => ({
      activate: () => {
        world.addComponent(entity.current, "focused", true);
      },
      deactivate: () => {
        world.removeComponent(entity.current, "focused");
      },
      move: (positions: [Vector3Tuple, ...Vector3Tuple[]]) => {
        setPositionsOverride(positions);
      },
      resetMove: () => {
        setPositionsOverride(undefined);
      },
    }),
    []
  );

  const onClickHandler = useCallback(() => {
    if (entity.current.focused) {
      controller.deactivate();
    } else {
      controller.activate();
    }
  }, [controller]);

  useEffect(() => {
    if (reconciledPositions.length <= 1) {
      return;
    }

    setTimeout(() => {
      setIndex((prev) => prev + 1);
    }, 1000);
  }, [reconciledPositions.length]);

  const onWorldEvent: OnWorldEventHandler = useCallback((event) => {
    switch (event) {
      case "target-reached":
        setIndex((prev) => prev + 1);
        break;

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
    <Entity ref={entity}>
      <Component name="activateDistance" data={activateDistance} />
      <Component name="npc" data={true} />
      <Component name="onWorldEvent" data={onWorldEvent} />
      <Component name="playerNear" data={false} />
      <Component name="speed" data={speed} />
      <Component name="state" data="idle" />
      <Component name="target" data={nextPosition} />
      <Component name="velocity" initialData={empty()} />
      <Component name="zoom" data={1.25} />
      {cameraOffset && (
        <Component name="offset" data={fromArray(cameraOffset)} />
      )}

      <Component name={body} data={true} />
      <Component name="box">
        <BoundingBox>
          <Component name="sceneObject">
            <group
              position={position}
              onPointerOut={playerNear ? onPointerOut : undefined}
              onPointerOver={playerNear ? onPointerOver : undefined}
              onClick={playerNear ? onClickHandler : undefined}
            >
              {mesh({ playerNear })}
            </group>
          </Component>
        </BoundingBox>
      </Component>

      <ControllerContext.Provider value={controller}>
        {children}
      </ControllerContext.Provider>
    </Entity>
  );
}
