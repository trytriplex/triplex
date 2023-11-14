/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
type Position = { x: number; y: number };
type Input = { clientX: number; clientY: number };

export type ItemMode = "standard" | "expanded" | "last-in-group";
export type InstructionType = Instruction["type"];

export type Instruction =
  | {
      blocked: boolean;
      currentLevel: number;
      indentPerLevel: number;
      type: "move-before";
    }
  | {
      blocked: boolean;
      currentLevel: number;
      indentPerLevel: number;
      type: "move-after";
    }
  | {
      blocked: boolean;
      currentLevel: number;
      indentPerLevel: number;
      type: "make-child";
    }
  | {
      blocked: boolean;
      currentLevel: number;
      desiredLevel: number;
      indentPerLevel: number;
      type: "reparent";
    };

// using a symbol so we can guarantee a key with a unique value
const uniqueKey = Symbol("tree-item-instruction");

function getCenter(rect: DOMRect): Position {
  return {
    x: (rect.right + rect.left) / 2,
    y: (rect.bottom + rect.top) / 2,
  };
}

function standardHitbox({
  borderBox,
  client,
}: {
  borderBox: DOMRect;
  client: Position;
}): "move-after" | "move-before" | "make-child" {
  const quarterOfHeight = borderBox.height / 4;

  // In the top 1/4: reorder-above
  // On the line = in the top 1/4 to give this zone a bit more space
  if (client.y <= borderBox.top + quarterOfHeight) {
    return "move-before";
  }
  // In the bottom 1/4: reorder-below
  // On the line = in the bottom 1/4 to give this zone a bit more space
  if (client.y >= borderBox.bottom - quarterOfHeight) {
    return "move-after";
  }

  return "make-child";
}

function getInstruction({
  currentLevel,
  element,
  indentPerLevel,
  input,
  mode,
}: {
  currentLevel: number;
  element: Element;
  indentPerLevel: number;
  input: Input;
  mode: ItemMode;
}): Instruction {
  const client: Position = {
    x: input.clientX,
    y: input.clientY,
  };

  const borderBox = element.getBoundingClientRect();
  if (mode === "standard") {
    const type = standardHitbox({ borderBox, client });
    return { blocked: false, currentLevel, indentPerLevel, type };
  }
  const center: Position = getCenter(borderBox);

  if (mode === "expanded") {
    // leveraging "standard" hitbox to ensure that the 'reorder-above' hit zone is
    // exactly the same for "standard" and "expanded" items
    const type = standardHitbox({ borderBox, client });
    return {
      blocked: false,
      currentLevel,

      indentPerLevel,
      // Use the "standard" hitbox for "reorder above",
      // The rest of the item is "make-child"
      type: type === "move-before" ? type : "make-child",
    };
  }

  // `mode` is "last-in-group"
  const visibleInset = indentPerLevel * currentLevel;

  // Before the left edge of the visible item
  if (client.x < borderBox.left + visibleInset) {
    // Above the center: `reorder-above`
    if (client.y < center.y) {
      return {
        blocked: false,
        currentLevel,
        indentPerLevel,
        type: "move-before",
      };
    }
    // On or below the center: `reparent`
    // On the center = `reparent` as we are giving a slightly bigger hitbox to this
    // action as it is the only place a user can do it
    const rawLevel = (client.x - borderBox.left) / indentPerLevel;
    // We can get sub pixel negative numbers as getBoundingClientRect gives sub-pixel accuracy,
    // where as clientX is rounded to the nearest pixel.
    // Using Math.max() ensures we can never get a negative level
    const desiredLevel = Math.max(Math.floor(rawLevel), 0);

    return {
      blocked: false,
      currentLevel,
      desiredLevel,
      indentPerLevel,
      type: "reparent",
    };
  }
  // On the visible item
  return {
    blocked: false,
    currentLevel,
    indentPerLevel,
    type: standardHitbox({ borderBox, client }),
  };
}

function isShallowEqual(
  a: Record<string, unknown>,
  b: Record<string, unknown>
): boolean {
  const aKeys = Object.keys(a).sort();
  const bKeys = Object.keys(b).sort();
  if (aKeys.length !== bKeys.length) {
    return false;
  }
  return aKeys.every((key) => a[key] === b[key]);
}

function areInstructionsEqual(a: Instruction, b: Instruction): boolean {
  if (a.type !== b.type) {
    return false;
  }

  return isShallowEqual(a, b);
}

// Note: not using `memoize-one` as all we need is a cached value.
// We do not need to avoid executing an expensive function.
const memoizeInstruction = (() => {
  let last: Instruction | null = null;

  return (instruction: Instruction): Instruction => {
    if (last && areInstructionsEqual(last, instruction)) {
      return last;
    }
    last = instruction;
    return instruction;
  };
})();

function applyInstructionBlock({
  block,
  desired,
}: {
  block?: InstructionType[];
  desired: Instruction;
}): Instruction {
  if (block?.includes(desired.type)) {
    const blocked: Instruction = {
      ...desired,
      blocked: true,
    };

    return blocked;
  }

  return desired;
}

export function attachInstruction(
  userData: Record<string | symbol, unknown>,
  {
    block,
    ...rest
  }: Parameters<typeof getInstruction>[0] & {
    block?: InstructionType[];
  }
): Record<string | symbol, unknown> {
  const desired: Instruction = getInstruction(rest);
  const withBlock: Instruction = applyInstructionBlock({
    block,
    desired,
  });
  const memoized: Instruction = memoizeInstruction(withBlock);

  return {
    ...userData,
    [uniqueKey]: memoized,
  };
}

export function extractInstruction(
  userData: Record<string | symbol, unknown>
): Instruction | null {
  return (userData[uniqueKey] as Instruction) ?? null;
}
