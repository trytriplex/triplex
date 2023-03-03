import { World } from "miniplex";
import { createReactAPI, useEntities } from "miniplex/react";
import { ReactNode, useCallback, useMemo, useState } from "react";
import { Item } from "./components/item";
import { EntityComponents } from "./types";

const ECS = createReactAPI(new World<EntityComponents>());

export const world = ECS.world;

export const Component = <C extends keyof EntityComponents>({
  name,
  initialData,
  data,
  children,
}: {
  name: C;
  data?: EntityComponents[C] | undefined;
  initialData?: EntityComponents[C] | undefined;
  children?: ReactNode;
}) => {
  const [cachedData] = useState(() => initialData);
  const actualData = data || cachedData;

  return (
    <ECS.Component data={actualData} name={name}>
      {children}
    </ECS.Component>
  );
};

export const Entities = ECS.Entities;

export const Entity = ECS.Entity;

export const useCurrentEntity = () => {
  const parent = ECS.useCurrentEntity();
  if (!parent) {
    throw new Error("invariant");
  }

  return parent;
};

export function useActivePlayer() {
  const { entities } = useEntities(
    world.with("player", "inventory", "focused")
  );

  if (entities.length === 0) {
    return undefined;
  } else if (entities.length > 1) {
    throw new Error("invariant: one active player only");
  }

  return entities[0];
}

export function useActiveItem() {
  const { entities } = useEntities(
    world.with("name", "count", "item", "focused")
  );

  return entities.length
    ? (entities[0] as (typeof entities)[0] & { name: Item })
    : undefined;
}

export function useParentActive() {
  const parent = useCurrentEntity();
  const { entities } = useEntities(world.with("focused"));
  const isActive = !!entities.find((entity) => entity === parent);

  return isActive;
}

export function useActivePlayerInventory() {
  const player = useActivePlayer();

  const add = useCallback(
    (itemName: Item) => {
      if (!player) {
        return;
      }

      if (player.inventory[itemName]) {
        player.inventory[itemName]! += 1;
      } else {
        player.inventory[itemName] = 1;
      }
    },
    [player]
  );

  const remove = useCallback(
    (itemName: Item, count = 1) => {
      if (!player) {
        return;
      }

      if (player.inventory[itemName]) {
        const currentCount = player.inventory[itemName] || 0;

        if (count >= currentCount) {
          delete player.inventory[itemName];
        } else {
          player.inventory[itemName]! -= count;
        }
      }
    },
    [player]
  );

  return useMemo(
    () => ({
      add,
      remove,
    }),
    [add, remove]
  );
}
