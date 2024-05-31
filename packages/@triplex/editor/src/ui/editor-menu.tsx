/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { useAnalytics, type ActionId } from "@triplex/ux";
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

interface MenuItem {
  accelerator?: string;
  click?: () => void;
  enabled?: boolean | "active-input" | "inactive-input";
  id: ActionId;
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
  if (window.triplex.platform === "darwin") {
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
    redo,
    reset,
    save,
    saveAll,
    saveAs,
    target,
    undo,
  } = useEditor();
  const analytics = useAnalytics();
  const { blur, jumpTo, navigateTo, refresh } = useScene();
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
          id: "rootmenu_project_file",
          label: "File",
          role: "fileMenu",
          submenu: [
            {
              accelerator: shortcut("N", { meta: true }),
              click: () => newFile(),
              id: "rootmenu_file_new",
              label: "New File...",
            },
            {
              type: "separator",
            },
            {
              accelerator: shortcut("O", { meta: true }),
              click: () => showOverlay("open-scene"),
              id: "rootmenu_project_components",
              label: "Open...",
            },
            {
              click: () => window.triplex.sendCommand("open-project"),
              id: "rootmenu_project_open",
              // Menu item only displayed in native
              label: "Open Project...",
            },
            { type: "separator" },
            {
              accelerator: shortcut("S", { meta: true }),
              click: () => save(),
              enabled: isEditable,
              id: "rootmenu_file_save",
              label: "Save",
            },
            {
              accelerator: shortcut("S", { meta: true, shift: true }),
              click: () => saveAs(),
              enabled: isEditable,
              id: "rootmenu_file_saveas",
              label: "Save As...",
            },
            {
              click: () => saveAll(),
              enabled: isEditable,
              id: "rootmenu_file_saveall",
              label: "Save All",
            },
            { type: "separator" },
            {
              click: () => revertFile(),
              enabled: isEditable,
              id: "rootmenu_file_reset",
              label: "Revert File",
            },
            {
              accelerator: shortcut("R", { meta: true }),
              click: () => refresh(),
              id: "rootmenu_frame_reset",
              label: "Reset Scene",
            },
            {
              accelerator: shortcut("R", { meta: true, shift: true }),
              click: () => refresh({ hard: true }),
              id: "rootmenu_project_reload",
              label: "Reload Editor",
            },
            { type: "separator" },
            {
              click: () => window.triplex.sendCommand("close-project"),
              id: "rootmenu_project_close",
              // Menu item only displayed in native
              label: "Close Project",
            },
          ],
        },
        {
          id: "rootmenu_project_edit",
          label: "Edit",
          role: "editMenu",
          submenu: [
            {
              accelerator: shortcut("Z", { meta: true }),
              click: undo,
              id: "rootmenu_project_undo",
              label: "Undo",
            },
            {
              accelerator: shortcut("Z", { meta: true, shift: true }),
              click: redo,
              id: "rootmenu_project_redo",
              label: "Redo",
            },
            {
              type: "separator",
            },
            {
              accelerator: shortcut("C", { meta: true }),
              click: () => {
                document.execCommand("copy");
              },
              enabled: "active-input",
              id: "rootmenu_input_copy",
              label: "Copy",
            },
            {
              accelerator: shortcut("V", { meta: true }),
              click: () => {
                document.execCommand("paste");
              },
              enabled: "active-input",
              id: "rootmenu_input_paste",
              label: "Paste",
            },
          ],
        },
        {
          id: "rootmenu_project_select",
          label: "Selection",
          submenu: [
            {
              accelerator: shortcut("A", { meta: true }),
              click: () => {
                document.execCommand("selectAll");
              },
              enabled: "active-input",
              id: "rootmenu_input_selectall",
              label: "Select All",
            },
            {
              accelerator: shortcut("Escape"),
              click: () => blur(),
              enabled: !!target && isEditable,
              id: "rootmenu_element_blur",
              label: "Deselect",
            },
            {
              type: "separator",
            },
            {
              accelerator: shortcut("F"),
              click: () => jumpTo(),
              enabled: !!target && isEditable && "inactive-input",
              id: "rootmenu_element_jumpto",
              label: "Jump To",
            },
            {
              accelerator: shortcut("F", { shift: true }),
              click: () => navigateTo(),
              enabled: !!target && isEditable,
              id: "rootmenu_element_open",
              label: "Enter",
            },
            {
              accelerator: shortcut("F", { meta: true, shift: true }),
              click: () => exitComponent(),
              enabled: enteredComponent,
              id: "rootmenu_element_exit",
              label: "Exit",
            },
            {
              accelerator: shortcut("D", { meta: true }),
              click: duplicateSelection,
              enabled: !!target,
              id: "rootmenu_element_duplicate",
              label: "Duplicate",
            },
            {
              type: "separator",
            },
            {
              accelerator: shortcut("Backspace"),
              click: () => deleteComponent(),
              enabled: !!target && isEditable,
              id: "rootmenu_element_delete",
              label: "Delete",
            },
          ],
        },
        {
          id: "rootmenu_project_view",
          label: "View",
          role: "viewMenu",
          submenu: [
            {
              click: () => window.triplex.sendCommand("show-devtools"),
              id: "rootmenu_project_devtools",
              label: "Show Developer Tools",
            },
            {
              click: () => window.triplex.sendCommand("view-logs"),
              id: "rootmenu_logs_open",
              label: "Logs",
            },
          ],
        },
        {
          id: "rootmenu_project_window",
          role: "windowMenu",
          visible: window.triplex.platform === "darwin",
        },
        {
          id: "rootmenu_project_help",
          label: "Help",
          submenu: [
            {
              click: () =>
                window.triplex.openLink("https://triplex.dev/docs/overview"),
              id: "rootmenu_docs_overview",
              label: "Documentation",
              role: "help",
            },
          ],
        },
        {
          id: "rootmenu_project_debug",
          label: "Debug",
          submenu: [
            {
              click: () => window.triplex.sendCommand("show-app-dir"),
              id: "(UNSAFE_SKIP)",
              label: "Open App Directory",
            },
          ],
          visible: process.env.NODE_ENV === "development",
        },
      ] satisfies MenuItem[],
    [
      isEditable,
      undo,
      redo,
      target,
      enteredComponent,
      duplicateSelection,
      newFile,
      showOverlay,
      save,
      saveAs,
      saveAll,
      revertFile,
      refresh,
      blur,
      jumpTo,
      navigateTo,
      exitComponent,
      deleteComponent,
    ]
  );

  useEffect(() => {
    window.triplex.setMenu(
      // Eliminate functions before sending the data by stringifying it first.
      JSON.parse(JSON.stringify(menubar))
    );
  }, [menubar]);

  useEffect(() => {
    return window.triplex.handleMenuItemPress((id) => {
      const menuItem = findMenuItem(id, menubar);
      if (menuItem && menuItem.click) {
        switch (menuItem.enabled) {
          case "active-input": {
            if (document.activeElement?.tagName === "INPUT") {
              menuItem.click();
              analytics.event(menuItem.id);
            }
            break;
          }

          case "inactive-input": {
            if (document.activeElement?.tagName !== "INPUT") {
              menuItem.click();
              analytics.event(menuItem.id);
            }
            break;
          }

          default:
            menuItem.click();
            analytics.event(menuItem.id);
            break;
        }
      }
    });
  }, [analytics, menubar]);

  if (window.triplex.platform !== "win32") {
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
                      actionId={menuitem.id}
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
