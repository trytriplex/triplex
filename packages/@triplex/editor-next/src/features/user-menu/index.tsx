/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */

import { DotsVerticalIcon } from "@radix-ui/react-icons";
import { Menu, MenuOption, MenuTrigger } from "@triplex/ux";
import { use } from "react";
import { IconButton } from "../../components/button";
import {
  AuthenticationClientContext,
  AuthenticationContext,
} from "../authentication/context";

export function UserMenu() {
  const client = use(AuthenticationClientContext);
  const session = use(AuthenticationContext);

  return (
    <Menu
      onSelect={(value) => {
        if (value === "sign_out") {
          client?.signOut();
        }
      }}
    >
      <MenuTrigger className="outline-default outline-selected peer-hover:bg-hover rounded peer-focus-visible:outline">
        <IconButton
          actionId={"(UNSAFE_SKIP)"}
          icon={DotsVerticalIcon}
          label="User Menu"
          onClick={() => {}}
          spacing="spacious"
        />
      </MenuTrigger>
      {session?.user && (
        <MenuOption actionId="scenepanel_auth_signout" value="sign_out">
          Sign Out
        </MenuOption>
      )}
    </Menu>
  );
}
