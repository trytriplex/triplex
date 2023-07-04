/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import type { MenuItemConstructorOptions } from "electron";
import { useEditor } from "../stores/editor";
import {
  Menubar,
  Menu,
  Trigger,
  MenuContent,
  MenuItem,
  Separator,
} from "../ds/menubar";
import { useOverlayStore } from "../stores/overlay";
import { useUndoRedoState } from "../stores/undo-redo";
import { useScene } from "../stores/scene";
import { useCallback, useEffect, useMemo } from "react";

interface MenuItem {
  role?: MenuItemConstructorOptions["role"];
  label?: string;
  id: string;
  click?: () => void;
  submenu?: (
    | MenuItem
    | {
        type: MenuItemConstructorOptions["type"];
      }
  )[];
  accelerator?: string;
  enabled?: boolean;
  visible?: boolean;
}

const shortcut = (key: string, { meta = false, shift = false } = {}) => {
  if (
    __TRIPLEX_TARGET__ === "electron" &&
    window.triplex.platform === "darwin"
  ) {
    const META_KEY = "CommandOrControl";
    const metaHotkey = meta ? META_KEY : "";
    const shiftHotkey = shift ? "Shift" : "";
    const accelerator = [shiftHotkey, metaHotkey, key]
      .filter(Boolean)
      .join("+");

    return accelerator;
  }

  const keyMap: Record<string, string | undefined> = {
    Backspace: navigator.platform.match("Mac") ? "⌫" : undefined,
  };

  const keys: string[] = [];

  if (meta) {
    const OS_META_KEY = navigator.platform.match("Mac") ? "⌘" : "Ctrl";
    keys.push(OS_META_KEY);
  }

  if (shift) {
    const OS_SHIFT_KEY = navigator.platform.match("Mac") ? "⇧" : "Shift";
    keys.push(OS_SHIFT_KEY);
  }

  keys.push(keyMap[key] || key);

  return keys.join(navigator.platform.match("Mac") ? " " : "+");
};

function findMenuItem(
  id: string,
  menuitems: MenuItem["submenu"] = []
): MenuItem | undefined {
  for (let i = 0; i < menuitems.length; i++) {
    const item = menuitems[i];
    if ("id" in item) {
      if (item.id === id) {
        return item;
      }

      const foundChild = findMenuItem(id, item.submenu);
      if (foundChild) {
        return foundChild;
      }
    }
  }

  return undefined;
}

export function EditorMenu() {
  const showOverlay = useOverlayStore((store) => store.show);
  const { target, save, reset, deleteComponent, path, newFile } = useEditor();
  const { blur, jumpTo, navigateTo, refresh } = useScene();
  const { redo, undo, redoAvailable, undoAvailable } = useUndoRedoState();
  const isEditable = !!path;

  const revertFile = useCallback(() => {
    const result = confirm("Will throw away unsaved state, continue?");

    if (result) {
      reset();
    }
  }, [reset]);

  const menubar: MenuItem[] = useMemo(
    () =>
      [
        {
          id: "file-menu",
          role: "fileMenu",
          label: "File",
          submenu: [
            {
              label: "New File...",
              id: "new-file",
              accelerator: shortcut("N", { meta: true }),
              click: () => newFile(),
            },
            {
              type: "separator",
            },
            {
              label: "Open...",
              id: "open",
              accelerator: shortcut("O", { meta: true }),
              click: () => showOverlay("open-scene"),
            },
            {
              // Menu item only displayed in native
              label: "Open Project...",
              id: "open-project",
              visible: __TRIPLEX_TARGET__ === "electron",
              click: () => window.triplex.sendCommand("open-project"),
            },
            { type: "separator" },
            {
              label: "Save",
              id: "save",
              enabled: isEditable,
              accelerator: shortcut("S", { meta: true }),
              click: () => save(),
            },
            {
              label: "Save As...",
              id: "save-as",
              enabled: isEditable,
              accelerator: shortcut("S", { meta: true, shift: true }),
              click: () => save(true),
            },
            { type: "separator" },
            {
              id: "reset",
              enabled: isEditable,
              label: "Revert File",
              click: () => revertFile(),
            },
            {
              id: "refresh-scene",
              label: "Refresh Scene",
              accelerator: shortcut("R", { meta: true }),
              click: () => refresh(),
            },
            { type: "separator" },
            {
              // Menu item only displayed in native
              label: "Close Project",
              id: "close-project",
              visible: __TRIPLEX_TARGET__ === "electron",
              click: () => window.triplex.sendCommand("close-project"),
            },
          ],
        },
        {
          role: "editMenu",
          label: "Edit",
          id: "edit-menu",
          submenu: [
            {
              id: "undo",
              label: "Undo",
              enabled: undoAvailable && isEditable,
              click: () => undo(),
              accelerator: shortcut("Z", { meta: true }),
            },
            {
              id: "redo",
              label: "Redo",
              enabled: redoAvailable && isEditable,
              click: () => redo(),
              accelerator: shortcut("Z", { meta: true, shift: true }),
            },
          ],
        },
        {
          label: "Selection",
          id: "select-menu",
          submenu: [
            {
              label: "Deselect",
              id: "deselect",
              enabled: !!target && isEditable,
              accelerator: shortcut("Escape"),
              click: () => blur(),
            },
            {
              type: "separator",
            },
            {
              label: "Focus camera",
              id: "focus-camera",
              enabled: !!target && isEditable,
              accelerator: shortcut("F"),
              click: () => jumpTo(),
            },
            {
              label: "Enter component",
              id: "enter-component",
              enabled: !!target && isEditable,
              accelerator: shortcut("F", { shift: true }),
              click: () => navigateTo(),
            },
            {
              type: "separator",
            },
            {
              label: "Delete",
              id: "delete",
              enabled: !!target && isEditable,
              accelerator: shortcut("Backspace"),
              click: () => deleteComponent(),
            },
          ],
        },
        {
          id: "view-menu",
          role: "viewMenu",
          label: "View",
          visible: __TRIPLEX_TARGET__ === "electron",
          submenu: [
            {
              id: "devtools",
              label: "Show Developer Tools",
              click: () => window.triplex.sendCommand("show-devtools"),
            },
            {
              id: "view-logs",
              label: "Logs",
              click: () => window.triplex.sendCommand("view-logs"),
            },
          ],
        },
        {
          id: "window-menu",
          visible:
            __TRIPLEX_TARGET__ === "electron" &&
            window.triplex.platform === "darwin",
          role: "windowMenu",
        },
        {
          id: "help-menu",
          label: "Help",
          visible: __TRIPLEX_TARGET__ === "electron",
          submenu: [
            {
              id: "documentation",
              role: "help",
              label: "Documentation",
              click: () =>
                window.triplex.openLink("https://triplex.dev/docs/overview"),
            },
          ],
        },
      ] satisfies MenuItem[],
    [
      blur,
      deleteComponent,
      isEditable,
      jumpTo,
      navigateTo,
      newFile,
      redo,
      redoAvailable,
      refresh,
      revertFile,
      save,
      showOverlay,
      target,
      undo,
      undoAvailable,
    ]
  );

  useEffect(() => {
    if (__TRIPLEX_TARGET__ === "electron") {
      window.triplex.setMenu(
        // Eliminate functions before sending the data by stringifying it first.
        JSON.parse(JSON.stringify(menubar))
      );
    }
  }, [menubar]);

  useEffect(() => {
    if (__TRIPLEX_TARGET__ === "electron") {
      return window.triplex.handleMenuItemPress((id) => {
        const menuItem = findMenuItem(id, menubar);
        if (menuItem && menuItem.click) {
          menuItem.click();
        }
      });
    }
  }, [menubar]);

  if (
    __TRIPLEX_TARGET__ === "electron" &&
    window.triplex.platform === "darwin"
  ) {
    return null;
  }

  return (
    <div className="py-0.5 pl-1.5 [-webkit-app-region:no-drag]">
      <Menubar>
        {menubar.map((menu) => {
          if (menu.visible === false) {
            return null;
          }

          return (
            <Menu key={menu.label}>
              <Trigger>{menu.label}</Trigger>
              <MenuContent>
                {menu.submenu?.map((menuitem, index) => {
                  if ("type" in menuitem) {
                    if (menuitem.type === "separator") {
                      return <Separator key={menu.id + index} />;
                    }

                    return null;
                  }

                  if (menuitem.visible === false) {
                    return null;
                  }

                  return (
                    <MenuItem
                      key={menuitem.id}
                      disabled={menuitem.enabled === false}
                      onClick={menuitem.click}
                      rslot={menuitem.accelerator}
                    >
                      {menuitem.label || "..."}
                    </MenuItem>
                  );
                })}
              </MenuContent>
            </Menu>
          );
        })}
      </Menubar>
    </div>
  );
}
