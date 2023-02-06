import { useSearchParams } from "react-router-dom";
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
  const [searchParams] = useSearchParams({ path: "" });
  const path = searchParams.get("path");

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
    </Menubar>
  );
}
