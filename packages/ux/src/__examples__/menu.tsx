/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */

import { Menu, MenuOption, MenuSeparator } from "../menu";

export function DefaultMenu() {
  return (
    <Menu>
      <button>Open My Dude</button>
      <MenuOption actionId="(UNSAFE_SKIP)" value="1">
        Option 1
      </MenuOption>
      <MenuOption actionId="(UNSAFE_SKIP)" value="2">
        Option 2
      </MenuOption>
      <MenuSeparator />
      <MenuOption actionId="(UNSAFE_SKIP)" value="3">
        Option 3
      </MenuOption>
    </Menu>
  );
}
