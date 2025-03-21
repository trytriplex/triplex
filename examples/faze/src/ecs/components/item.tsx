/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
export type Item = keyof typeof items;

type Items<TItem extends string> = {
  [Property in TItem]:
    | {
        description: string;
        name: string;
      }
    | {
        combineWith: TItem;
        creates: TItem;
        description: string;
        name: string;
      };
};

export const items: Items<
  "key" | "bone" | "gum" | "stick" | "gumStick" | "woodStump" | "apple"
> = {
  apple: {
    description: "It's an apple! You can eat it?",
    name: "Apple",
  },
  bone: {
    description: "A bone! Duh! Could someone hungry want this?",
    name: "Bone",
  },
  gum: {
    combineWith: "stick",
    creates: "gumStick",
    description: `Uhh, don't drop this on the ground...`,
    name: "Gum",
  },
  gumStick: {
    description: `What's brown, sticky, and isn't edible anymore?`,
    name: "Gummy stick",
  },
  key: {
    description: "A key to someones heart...",
    name: "Key",
  },
  stick: {
    combineWith: "gum",
    creates: "gumStick",
    description: `What's brown and sticky?`,
    name: "Stick",
  },
  woodStump: {
    description:
      "A piece of wood that can be used to reach things in high places.",
    name: "Wood stump",
  },
};
