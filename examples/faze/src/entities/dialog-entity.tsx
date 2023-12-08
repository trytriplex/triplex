/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { Text } from "@react-three/drei";
import { useEffect, useState } from "react";
import { MeshBasicMaterial } from "three";
import { type Item } from "../ecs/components/item";
import {
  Component,
  Entity,
  useActiveItem,
  useActivePlayerInventory,
  useCurrentEntity,
  useParentActive,
  world,
} from "../ecs/store";
import { type Vector3Tuple } from "../types";
import { useCacheWhile } from "../utils/functions";
import { DOM } from "../utils/tunnel";
import { useParentNpcController } from "./npc-entity";

const personas = {
  default: {
    invalidItem: `What's this?`,
    notEnoughItems: `I need more of these sorry.`,
  },
};

interface DialogProps {
  text: string;
}

type DialogResponseProps = {
  count?: number;
  failureText?: string;
  itemName: Item;
  onSuccess?: (
    | ["take"]
    | ["give", Item]
    | ["stop", number?]
    | ["move", [Vector3Tuple, ...Vector3Tuple[]]]
  )[];
  successText: string;
  when: "item";
};

function toActionMap(children: JSX.Element | JSX.Element[]) {
  const childrenArr = Array.isArray(children) ? children : [children];

  const responseMap: Record<"item", Record<string, DialogResponseProps>> = {
    item: {},
  };

  childrenArr
    .filter((child) => child.type === DialogAction)
    .forEach((child) => {
      const props: DialogResponseProps = child.props;
      responseMap.item[props.itemName] = props;
    });

  return responseMap;
}

function toDialogs(children: JSX.Element | JSX.Element[]) {
  const childrenArr = Array.isArray(children) ? children : [children];
  const dialogs: DialogProps[] = childrenArr
    .filter((child) => child.type === DialogMessage)
    .map((child) => child.props);

  return dialogs;
}

const textMaterial = new MeshBasicMaterial({ depthTest: false });

export function DialogEntity({
  children = [],
  persona = "default",
}: {
  children?: JSX.Element | JSX.Element[];
  persona?: keyof typeof personas;
}) {
  const [dialogIndex, setDialogIndex] = useState(0);
  const [dialogSuccess, setDialogSuccess] = useState<DialogResponseProps>();
  const parent = useCurrentEntity();
  const isParentActive = useParentActive();
  const activeItem = useActiveItem();
  const inventory = useActivePlayerInventory();
  const cachedActiveItem = useCacheWhile(activeItem, isParentActive);
  const parentController = useParentNpcController();
  const actionMap = toActionMap(children);
  const dialogs = toDialogs(children);
  const personaMessages = personas[persona];

  let dialogMessage = "";

  if (!isParentActive) {
    dialogMessage = "";
  } else if (dialogSuccess) {
    // Handle post success state
    dialogMessage = dialogSuccess.successText;
  } else if (cachedActiveItem) {
    // We have an active item, let's see if this NPC has a response.
    const itemAction = actionMap.item[cachedActiveItem.name];
    if (itemAction) {
      if (
        itemAction.count === undefined ||
        itemAction.count === cachedActiveItem.count
      ) {
        setDialogSuccess(itemAction);
      } else {
        dialogMessage =
          itemAction.failureText || personaMessages.notEnoughItems;
      }
    } else {
      dialogMessage = personaMessages.invalidItem;
    }
  } else if (dialogs[dialogIndex]) {
    dialogMessage = dialogs[dialogIndex].text;
  } else {
    dialogMessage = "...";
  }

  useEffect(() => {
    if (!isParentActive) {
      setDialogIndex(0);
    }
  }, [isParentActive]);

  useEffect(() => {
    if (!dialogSuccess || !dialogSuccess.onSuccess) {
      return;
    }

    for (const successAction of dialogSuccess.onSuccess) {
      switch (successAction[0]) {
        case "give": {
          inventory.add(successAction[1]);
          break;
        }

        case "take": {
          inventory.remove(dialogSuccess.itemName, dialogSuccess.count);
          break;
        }

        case "move": {
          parentController.move(successAction[1]);
          break;
        }

        case "stop": {
          world.addComponent(parent, "rest", successAction[1] || 999);
          break;
        }
      }
    }
  }, [dialogSuccess, inventory, parent, parentController]);

  return (
    <Entity>
      <Component data={true} name="billboard" />
      <Component data={true} name="dialog" />
      <Component data={parent} name="parent" />

      <Component name="sceneObject">
        <Text
          color="black"
          depthOffset={9999}
          font="/font/rainyhearts.ttf"
          fontSize={0.28}
          material={textMaterial}
          outlineColor="white"
          outlineWidth={0.01}
          position={[-1000, -1000, -1000]}
        >
          {dialogMessage}
        </Text>
      </Component>

      {isParentActive && (
        <DOM>
          <div
            onClick={() => {
              const next = dialogIndex + 1;
              if (!cachedActiveItem && dialogs[next]) {
                setDialogIndex(next);
              } else {
                world.removeComponent(parent, "focused");
              }
            }}
            style={{ cursor: "pointer", inset: 0, position: "absolute" }}
          />
        </DOM>
      )}
    </Entity>
  );
}

export function DialogMessage(_: DialogProps) {
  return null;
}

export function DialogAction(_: DialogResponseProps) {
  return null;
}
