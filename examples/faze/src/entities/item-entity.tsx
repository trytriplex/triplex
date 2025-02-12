/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
import { useTexture } from "@react-three/drei";
import { useCallback, useState } from "react";
import { type Item } from "../ecs/components/item";
import {
  Component,
  useActiveItem,
  useActivePlayerInventory,
} from "../ecs/store";
import { type Vector3Tuple } from "../types";
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
      components={
        <>
          <Component data={true} name="item" />
          <Component data={id} name="name" />
        </>
      }
      onClick={activeItem ? undefined : onClickHandler}
      position={position}
    >
      {() => children}
    </StaticEntity>
  );
}
