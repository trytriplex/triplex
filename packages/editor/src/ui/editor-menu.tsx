import {
  Menubar,
  Menu,
  Trigger,
  MenuContent,
  MenuItem,
  Separator,
} from "../ds/menubar";
import { useOverlayStore } from "../stores/overlay";

export function EditorMenu() {
  const showOverlay = useOverlayStore((store) => store.show);

  return (
    <Menubar>
      <Menu>
        <Trigger>File</Trigger>
        <MenuContent>
          <MenuItem rslot="⌘ O" onClick={() => showOverlay("open-scene")}>
            Open
          </MenuItem>
          <Separator />
          <MenuItem rslot="⌘ S">Save</MenuItem>
        </MenuContent>
      </Menu>
      <Menu>
        <Trigger>Edit</Trigger>
        <MenuContent>
          <MenuItem rslot="⌘ Z">Undo</MenuItem>
          <MenuItem rslot="⇧ ⌘ Z">Redo</MenuItem>
        </MenuContent>
      </Menu>
      <Menu>
        <Trigger>View</Trigger>
        <MenuContent>
          <MenuItem rslot="⌘ R">Reload</MenuItem>
        </MenuContent>
      </Menu>
    </Menubar>
  );
}
