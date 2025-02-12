/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
import { useState } from "react";
import { type items } from "../ecs/components/item";
import { useActiveItem, useActivePlayerInventory, world } from "../ecs/store";
import { type Vector3Tuple } from "../types";

export function ItemDrop({
  children,
  item,
  position,
}: {
  children: JSX.Element;
  item: keyof typeof items;
  position: Vector3Tuple;
}) {
  const [visible, setVisible] = useState(false);
  const activeItem = useActiveItem();
  const inventory = useActivePlayerInventory();

  const onClick = () => {
    if (activeItem && activeItem.name === item) {
      setVisible(true);
      inventory.remove(activeItem.name);
      world.remove(activeItem);
    }
  };

  return (
    <>
      {!visible && (
        <mesh
          onClick={activeItem ? onClick : undefined}
          position={position}
          visible={false}
        >
          <boxGeometry args={[7, 0.5, 7]} />
          <meshBasicMaterial color="black" wireframe />
        </mesh>
      )}

      {visible && children}
    </>
  );
}
