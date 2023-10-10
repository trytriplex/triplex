/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { useState } from "react";
import { items } from "../ecs/components/item";
import { useActiveItem, useActivePlayerInventory, world } from "../ecs/store";
import { Vector3Tuple } from "../types";

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
