/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
import { useEntities } from "miniplex/react";
import { useEffect, useState } from "react";
import { items, type Item } from "../ecs/components/item";
import {
  useActiveItem,
  useActivePlayer,
  useActivePlayerInventory,
  world,
} from "../ecs/store";
import { DOM } from "../utils/tunnel";

function ItemButton({
  count,
  id,
  onCombined,
}: {
  count: number;
  id: Item;
  onCombined: () => void;
}) {
  const activeItem = useActiveItem();
  const inventory = useActivePlayerInventory();
  const itemData = items[id];

  const onItemClickHandler = () => {
    if (activeItem) {
      const activeItemData = items[activeItem.name];

      if (
        "combineWith" in activeItemData &&
        activeItemData.combineWith === id
      ) {
        inventory.remove(activeItem.name);
        inventory.remove(id);
        inventory.add(activeItemData.creates);
        onCombined();
      }

      world.remove(activeItem);
    } else {
      world.add({
        count,
        focused: true,
        followPointer: true,
        item: true,
        name: id,
        pointer: true,
      });
    }
  };

  return (
    <button
      onClick={onItemClickHandler}
      style={{
        background: `linear-gradient(
          to top left,
          rgba(0,0,0,0) 0%,
          rgba(0,0,0,0) calc(50% - 1px),
          black 50%,
          rgba(0,0,0,0) calc(50% + 1px),
          rgba(0,0,0,0) 100%
        ),
        linear-gradient(
          to top right,
          rgba(0,0,0,0) 0%,
          rgba(0,0,0,0) calc(50% - 1px),
          black 50%,
          rgba(0,0,0,0) calc(50% + 1px),
          rgba(0,0,0,0) 100%
        )`,
        border: "2px solid black",
        cursor: "pointer",
        height: 100,
        userSelect: "none",
        width: 100,
      }}
      title={itemData.description}
    >
      {itemData.name} {count > 1 ? `(${count})` : undefined}
    </button>
  );
}

function Inventory({ onClose }: { onClose: () => void }) {
  const player = useActivePlayer();
  const playerItems = Object.entries(player?.inventory || {});
  const [, forceRefresh] = useState(0);

  useEffect(() => {
    const callback = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === "CANVAS") {
        onClose();
      }
    };

    document.addEventListener("click", callback);

    return () => {
      document.removeEventListener("click", callback);
    };
  }, [onClose]);

  return (
    <div
      style={{
        backgroundColor: "rgba(0,0,0, 0.1)",
        display: "inline-flex",
        gap: 16,
        justifyContent: "center",
        marginBottom: 32,
        padding: 16,
        pointerEvents: "auto",
        userSelect: "none",
      }}
    >
      {playerItems.length === 0 && "No items!"}
      {playerItems.map(([key, itemCount]) => (
        <ItemButton
          count={itemCount}
          id={key as Item}
          key={key}
          onCombined={() => forceRefresh((prev) => prev + 1)}
        />
      ))}
    </div>
  );
}

export function InventoryIcon({
  onToggle,
  open,
}: {
  onToggle: () => void;
  open: boolean;
}) {
  const { entities } = useEntities(world.with("npc", "focused"));
  const disableInventory = entities.length > 0;

  return (
    <DOM>
      <div
        style={{
          alignItems: "center",
          bottom: 0,
          display: "flex",
          flexDirection: "column",
          left: 0,
          paddingBottom: 32,
          pointerEvents: "none",
          position: "absolute",
          right: 0,
          textAlign: "center",
        }}
      >
        {open && <Inventory onClose={onToggle} />}
        <button
          disabled={disableInventory}
          onClick={onToggle}
          style={{
            background: `linear-gradient(
              to top left,
              rgba(0,0,0,0) 0%,
              rgba(0,0,0,0) calc(50% - 1px),
              black 50%,
              rgba(0,0,0,0) calc(50% + 1px),
              rgba(0,0,0,0) 100%
            ),
            linear-gradient(
              to top right,
              rgba(0,0,0,0) 0%,
              rgba(0,0,0,0) calc(50% - 1px),
              black 50%,
              rgba(0,0,0,0) calc(50% + 1px),
              rgba(0,0,0,0) 100%
            )`,
            border: "2px solid black",
            cursor: disableInventory ? "not-allowed" : "pointer",
            height: 100,
            opacity: disableInventory ? 0 : 1,
            pointerEvents: "auto",
            userSelect: "none",
            width: 100,
          }}
        />
      </div>
    </DOM>
  );
}
