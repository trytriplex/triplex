/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
export type Item = keyof typeof items;

type Items<TItem extends string> = {
  [Property in TItem]:
    | {
        name: string;
        description: string;
      }
    | {
        name: string;
        description: string;
        combineWith: TItem;
        creates: TItem;
      };
};

export const items: Items<
  "key" | "bone" | "gum" | "stick" | "gumStick" | "woodStump" | "apple"
> = {
  key: {
    name: "Key",
    description: "A key to someones heart...",
  },
  bone: {
    name: "Bone",
    description: "A bone! Duh! Could someone hungry want this?",
  },
  gum: {
    name: "Gum",
    description: `Uhh, don't drop this on the ground...`,
    combineWith: "stick",
    creates: "gumStick",
  },
  stick: {
    name: "Stick",
    description: `What's brown and sticky?`,
    combineWith: "gum",
    creates: "gumStick",
  },
  gumStick: {
    name: "Gummy stick",
    description: `What's brown, sticky, and isn't edible anymore?`,
  },
  woodStump: {
    name: "Wood stump",
    description:
      "A piece of wood that can be used to reach things in high places.",
  },
  apple: {
    name: "Apple",
    description: "It's an apple! You can eat it?",
  },
};
