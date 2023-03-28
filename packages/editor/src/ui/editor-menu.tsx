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

function ShortcutItem({
  children,
  disabled,
  metaKey,
  onClick,
  shiftKey,
  shortcut,
}: {
  children: string;
  disabled?: boolean;
  metaKey?: boolean;
  onClick: () => void;
  shiftKey?: boolean;
  shortcut: string;
}) {
  const OS_META_KEY = navigator.platform.match("Mac") ? "⌘" : "CTRL";
  const metaHotkey = metaKey ? `${OS_META_KEY} ` : "";
  const shiftHotkey = shiftKey ? "⇧ " : "";
  const hotkey = `${shiftHotkey}${metaHotkey}${shortcut}`;

  return (
    <MenuItem onClick={onClick} disabled={disabled} rslot={hotkey}>
      {children}
    </MenuItem>
  );
}

function UndoRedoItems() {
  const { undo, redo, getState } = useEditor();
  const { redoAvailable, undoAvailable } = getState();

  return (
    <>
      <ShortcutItem
        disabled={!undoAvailable}
        metaKey
        onClick={undo}
        shortcut="Z"
      >
        Undo
      </ShortcutItem>
      <ShortcutItem
        disabled={!redoAvailable}
        metaKey
        onClick={redo}
        shiftKey
        shortcut="Z"
      >
        Redo
      </ShortcutItem>
    </>
  );
}

export function EditorMenu() {
  const showOverlay = useOverlayStore((store) => store.show);
  const { target, save, reset } = useEditor();
  const { blur, jumpTo, navigateTo } = useScene();

  return (
    <div className="self-start rounded-lg border border-neutral-800 bg-neutral-900/[97%] p-1 shadow-2xl shadow-black/50">
      <Menubar>
        <Menu>
          <Trigger>File</Trigger>
          <MenuContent>
            <ShortcutItem
              metaKey
              shortcut="O"
              onClick={() => showOverlay("open-scene")}
            >
              Open
            </ShortcutItem>
            <Separator />
            <ShortcutItem shortcut="S" metaKey onClick={save}>
              Save
            </ShortcutItem>
          </MenuContent>
        </Menu>
        <Menu>
          <Trigger>Edit</Trigger>
          <MenuContent>
            <UndoRedoItems />
            <Separator />
            <MenuItem
              onClick={() => {
                const result = confirm(
                  "Will throw away unsaved state, continue?"
                );

                if (result) {
                  reset();
                }
              }}
            >
              Reset
            </MenuItem>
          </MenuContent>
        </Menu>
        <Menu>
          <Trigger>Select</Trigger>
          <MenuContent>
            <ShortcutItem disabled={!target} shortcut="ESC" onClick={blur}>
              Deselect
            </ShortcutItem>
            <Separator />
            <ShortcutItem disabled={!target} shortcut="F" onClick={jumpTo}>
              Jump to
            </ShortcutItem>
            <ShortcutItem
              disabled={!target}
              shiftKey
              shortcut="F"
              onClick={navigateTo}
            >
              Navigate to
            </ShortcutItem>
          </MenuContent>
        </Menu>
      </Menubar>
    </div>
  );
}
