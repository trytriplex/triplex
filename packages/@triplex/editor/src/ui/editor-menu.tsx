/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { useCallback, useEffect, useMemo } from "react";
import {
  Menu,
  Menubar,
  MenuContent,
  MenuItem,
  Separator,
  Trigger,
} from "../ds/menubar";
import { useEditor } from "../stores/editor";
import { useOverlayStore } from "../stores/overlay";
import { useScene } from "../stores/scene";
import { useUndoRedoState } from "../stores/undo-redo";

interface MenuItem {
  accelerator?: string;
  click?: () => void;
  enabled?: boolean;
  id: string;
  label?: string;
  role?: "fileMenu" | "editMenu" | "viewMenu" | "windowMenu" | "help";
  submenu?: (
    | MenuItem
    | {
        type: "separator";
      }
  )[];
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
  const {
    deleteComponent,
    duplicateSelection,
    enteredComponent,
    exitComponent,
    newFile,
    path,
    reset,
    save,
    target,
  } = useEditor();
  const { blur, jumpTo, navigateTo, refresh, setTransform } = useScene();
  const { redo, redoAvailable, undo, undoAvailable } = useUndoRedoState();
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
          label: "File",
          role: "fileMenu",
          submenu: [
            {
              accelerator: shortcut("N", { meta: true }),
              click: () => newFile(),
              id: "new-file",
              label: "New File...",
            },
            {
              type: "separator",
            },
            {
              accelerator: shortcut("O", { meta: true }),
              click: () => showOverlay("open-scene"),
              id: "open",
              label: "Open...",
            },
            {
              click: () => window.triplex.sendCommand("open-project"),

              id: "open-project",
              // Menu item only displayed in native
              label: "Open Project...",
              visible: __TRIPLEX_TARGET__ === "electron",
            },
            { type: "separator" },
            {
              accelerator: shortcut("S", { meta: true }),
              click: () => save(),
              enabled: isEditable,
              id: "save",
              label: "Save",
            },
            {
              accelerator: shortcut("S", { meta: true, shift: true }),
              click: () => save(true),
              enabled: isEditable,
              id: "save-as",
              label: "Save As...",
            },
            { type: "separator" },
            {
              click: () => revertFile(),
              enabled: isEditable,
              id: "reset",
              label: "Revert File",
            },
            {
              accelerator: shortcut("R", { meta: true }),
              click: () => refresh(),
              id: "refresh-scene",
              label: "Refresh Scene",
            },
            {
              accelerator: shortcut("R", { meta: true, shift: true }),
              click: () => refresh({ hard: true }),
              id: "hard-refresh-scene",
              label: "Reload Scene",
            },
            { type: "separator" },
            {
              click: () => window.triplex.sendCommand("close-project"),

              id: "close-project",
              // Menu item only displayed in native
              label: "Close Project",
              visible: __TRIPLEX_TARGET__ === "electron",
            },
          ],
        },
        {
          id: "edit-menu",
          label: "Edit",
          role: "editMenu",
          submenu: [
            {
              accelerator: shortcut("Z", { meta: true }),
              click: () => undo(),
              enabled: undoAvailable && isEditable,
              id: "undo",
              label: "Undo",
            },
            {
              accelerator: shortcut("Z", { meta: true, shift: true }),
              click: () => redo(),
              enabled: redoAvailable && isEditable,
              id: "redo",
              label: "Redo",
            },
          ],
        },
        {
          id: "select-menu",
          label: "Selection",
          submenu: [
            {
              accelerator: shortcut("A", { meta: true }),
              click: () => {
                if (document.activeElement?.tagName === "INPUT") {
                  document.execCommand("selectAll");
                }
              },
              id: "select-all",
              label: "Select All",
            },
            {
              accelerator: shortcut("Escape"),
              click: () => blur(),
              enabled: !!target && isEditable,
              id: "deselect",
              label: "Deselect",
            },
            {
              type: "separator",
            },
            {
              accelerator: shortcut("F"),
              click: () => jumpTo(),
              enabled: !!target && isEditable,
              id: "focus-camera",
              label: "Focus",
            },
            {
              accelerator: shortcut("F", { shift: true }),
              click: () => navigateTo(),
              enabled: !!target && isEditable,
              id: "enter-component",
              label: "Enter",
            },
            {
              accelerator: shortcut("F", { meta: true, shift: true }),
              click: () => exitComponent(),
              enabled: enteredComponent,
              id: "exit-component",
              label: "Exit",
            },
            {
              accelerator: shortcut("D", { meta: true }),
              click: duplicateSelection,
              enabled: !!target,
              id: "duplicate",
              label: "Duplicate",
            },
            {
              type: "separator",
            },

            {
              accelerator: shortcut("t"),
              click: () => setTransform("translate"),
              id: "translate",
              label: "Translate",
            },
            {
              accelerator: shortcut("r"),
              click: () => setTransform("rotate"),
              id: "rotate",
              label: "Transform",
            },
            {
              accelerator: shortcut("s"),
              click: () => setTransform("scale"),
              id: "scale",
              label: "Transform",
            },
            {
              type: "separator",
            },
            {
              accelerator: shortcut("Backspace"),
              click: () => deleteComponent(),
              enabled: !!target && isEditable,
              id: "delete",
              label: "Delete",
            },
          ],
        },
        {
          id: "view-menu",
          label: "View",
          role: "viewMenu",
          submenu: [
            {
              click: () => window.triplex.sendCommand("show-devtools"),
              id: "devtools",
              label: "Show Developer Tools",
            },
            {
              click: () => window.triplex.sendCommand("view-logs"),
              id: "view-logs",
              label: "Logs",
            },
          ],
          visible: __TRIPLEX_TARGET__ === "electron",
        },
        {
          id: "window-menu",
          role: "windowMenu",
          visible:
            __TRIPLEX_TARGET__ === "electron" &&
            window.triplex.platform === "darwin",
        },
        {
          id: "help-menu",
          label: "Help",
          submenu: [
            {
              click: () =>
                window.triplex.openLink("https://triplex.dev/docs/overview"),
              id: "documentation",
              label: "Documentation",
              role: "help",
            },
          ],
          visible: __TRIPLEX_TARGET__ === "electron",
        },
      ] satisfies MenuItem[],
    [
      isEditable,
      undoAvailable,
      redoAvailable,
      target,
      enteredComponent,
      duplicateSelection,
      newFile,
      showOverlay,
      save,
      revertFile,
      refresh,
      undo,
      redo,
      blur,
      jumpTo,
      navigateTo,
      exitComponent,
      setTransform,
      deleteComponent,
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
                      disabled={menuitem.enabled === false}
                      key={menuitem.id}
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
