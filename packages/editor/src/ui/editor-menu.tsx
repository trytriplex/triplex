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
  if (__TRIPLEX_TARGET__ === "electron") {
    const META_KEY = "CommandOrControl";
    const metaHotkey = meta ? META_KEY : "";
    const shiftHotkey = shift ? "SHIFT" : "";
    const accelerator = [shiftHotkey, metaHotkey, key]
      .filter(Boolean)
      .join("+");

    return accelerator;
  }

  const keyMap: Record<string, string> = {
    Backspace: "⌫",
  };

  const OS_META_KEY = navigator.platform.match("Mac") ? "⌘" : "CTRL";
  const metaHotkey = meta ? `${OS_META_KEY} ` : "";
  const shiftHotkey = shift ? "⇧ " : "";
  const hotkey = `${shiftHotkey}${metaHotkey}${keyMap[key] || key}`;

  return hotkey;
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
  const { blur, jumpTo, navigateTo } = useScene();
  const { undo, redo, getState } = useEditor();
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
              // Menu item only displayed in native
              label: "Close Project",
              id: "close-project",
              visible: __TRIPLEX_TARGET__ === "electron",
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
              enabled: getState().redoAvailable && isEditable,
              click: () => undo(),
              accelerator: shortcut("Z", { meta: true }),
            },
            {
              id: "redo",
              label: "Redo",
              enabled: getState().redoAvailable && isEditable,
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
              accelerator: shortcut("ESC"),
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
            },
          ],
        },
        {
          id: "window-menu",
          visible: __TRIPLEX_TARGET__ === "electron",
          role: "windowMenu",
        },
        {
          id: "help-menu",
          visible: __TRIPLEX_TARGET__ === "electron",
          label: "Help",
          submenu: [
            {
              id: "documentation",
              role: "help",
              label: "Documentation",
            },
          ],
        },
      ] satisfies MenuItem[],
    [
      blur,
      deleteComponent,
      getState,
      isEditable,
      jumpTo,
      navigateTo,
      newFile,
      redo,
      revertFile,
      save,
      showOverlay,
      target,
      undo,
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

  if (__TRIPLEX_TARGET__ === "electron") {
    return null;
  }

  return (
    <div className="pointer-events-auto self-start rounded-lg border border-neutral-800 bg-neutral-900/[97%] p-1 shadow-2xl shadow-black/50">
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
