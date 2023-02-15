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
import { useScene } from "../scence-bridge";

export function EditorMenu() {
  const showOverlay = useOverlayStore((store) => store.show);
  const { path, target } = useEditor();
  const { blur, jumpTo, navigateTo } = useScene();

  return (
    <Menubar>
      <Menu>
        <Trigger>File</Trigger>
        <MenuContent>
          <MenuItem rslot="⌘ O" onClick={() => showOverlay("open-scene")}>
            Open
          </MenuItem>
          <Separator />
          <MenuItem
            rslot="⌘ S"
            onClick={() =>
              fetch(`http://localhost:8000/scene/save?path=${path}`)
            }
          >
            Save
          </MenuItem>
        </MenuContent>
      </Menu>
      <Menu>
        <Trigger>Select</Trigger>
        <MenuContent>
          <MenuItem disabled={!target} rslot="ESC" onClick={() => blur()}>
            Deselect
          </MenuItem>
          <Separator />
          <MenuItem disabled={!target} rslot="F" onClick={() => jumpTo()}>
            Jump to
          </MenuItem>
          <MenuItem
            disabled={!target || !target.path}
            rslot="⇧ F"
            onClick={() => navigateTo()}
          >
            Navigate to
          </MenuItem>
        </MenuContent>
      </Menu>
    </Menubar>
  );
}
