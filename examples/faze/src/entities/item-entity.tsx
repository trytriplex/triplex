/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { useTexture } from "@react-three/drei";
import { useCallback, useState } from "react";
import { Item } from "../ecs/components/item";
import {
  Component,
  useActiveItem,
  useActivePlayerInventory,
} from "../ecs/store";
import { Vector3Tuple } from "../types";
import { StaticEntity } from "./static-entity";

function Placeholder() {
  const map = useTexture("/textures/dark/texture_04.png");

  return (
    <mesh castShadow receiveShadow>
      <boxGeometry args={[0.25, 0.25, 0.25]} />
      <meshStandardMaterial map={map} />
    </mesh>
  );
}

export function ItemEntity({
  activateDistance,
  body,
  children = <Placeholder />,
  id,
  position,
}: {
  activateDistance?: number;
  body?: "kinematicBody" | "rigidBody";
  children?: JSX.Element;
  id: Item;
  position: Vector3Tuple;
}) {
  const activeItem = useActiveItem();
  const [itemCollected, setItemCollected] = useState(false);
  const inventory = useActivePlayerInventory();

  const onClickHandler = useCallback(() => {
    inventory.add(id);
    setItemCollected(true);
  }, [inventory, id]);

  if (itemCollected) {
    return null;
  }

  return (
    <StaticEntity
      activateDistance={activateDistance}
      body={body}
      onClick={activeItem ? undefined : onClickHandler}
      position={position}
      components={
        <>
          <Component name="item" data={true} />
          <Component name="name" data={id} />
        </>
      }
    >
      {() => children}
    </StaticEntity>
  );
}
