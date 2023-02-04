import {
  Menubar,
  Menu,
  Trigger,
  MenuContent,
  MenuItem,
  Separator,
} from "../ds/menubar";

export function SceneMenu() {
  return (
    <Menubar>
      <Menu>
        <Trigger>Scene</Trigger>
        <MenuContent>
          <MenuItem rslot="⌘ O">Open</MenuItem>
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
