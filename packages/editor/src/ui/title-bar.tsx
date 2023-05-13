import { useLazySubscription } from "@triplex/ws-client";
import { useEffect } from "react";
import { useEditor } from "../stores/editor";

export function TitleBar() {
  const { path } = useEditor();
  const { name } = useLazySubscription<{ name: string }>("/folder");
  const filename = path.replaceAll("\\", "/").split("/").at(-1);
  const windowTitle = filename ? filename + " — " + name : name;

  useEffect(() => {
    if (windowTitle) {
      window.document.title = windowTitle;
    }
  }, [windowTitle]);

  if (__TRIPLEX_TARGET__ === "electron") {
    if (window.triplex.platform === "win32") {
      // Don't render the titlebar on windows for now, we use the default one.
      return null;
    }

    return (
      <div className="z-50 col-span-full row-start-1 flex h-8 select-none items-center justify-center border-b border-neutral-800 bg-neutral-900 [-webkit-app-region:drag]">
        <span className="text-sm text-neutral-300">{windowTitle}</span>
      </div>
    );
  }

  return null;
}
