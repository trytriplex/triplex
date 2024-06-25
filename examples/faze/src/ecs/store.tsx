/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { World } from "miniplex";
import { createReactAPI, useEntities } from "miniplex/react";
import { useCallback, useMemo, useState, type ReactNode } from "react";
import { type Item } from "./components/item";
import { type EntityComponents } from "./types";

const ECS = createReactAPI(new World<EntityComponents>());

export const world = ECS.world;

export const Component = <C extends keyof EntityComponents>({
  children,
  data,
  initialData,
  name,
}: {
  children?: ReactNode;
  data?: EntityComponents[C] | undefined;
  initialData?: EntityComponents[C] | undefined;
  name: C;
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
    world.with("player", "inventory", "focused"),
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
    world.with("name", "count", "item", "focused"),
  );

  return entities.length
    ? (entities[0] as (typeof entities)[0] & { name: Item })
    : undefined;
}

export function useParentActive() {
  const parent = useCurrentEntity();
  const { entities } = useEntities(world.with("focused"));
  const isActive = entities.some((entity) => entity === parent);

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
    [player],
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
    [player],
  );

  return useMemo(
    () => ({
      add,
      remove,
    }),
    [add, remove],
  );
}
