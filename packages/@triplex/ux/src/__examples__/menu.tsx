/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
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
