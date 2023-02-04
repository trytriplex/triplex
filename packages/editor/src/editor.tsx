import { listen, send } from "@triplex/bridge/host";
import { useSearchParams } from "react-router-dom";
import { useEffect, useRef } from "react";
import { SceneMenu } from "./ui/scene-menu";

export function EditorFrame() {
  const [searchParams, setSearchParams] = useSearchParams({ path: "" });
  const path = searchParams.get("path");
  const props = searchParams.get("props");
  const iframe = useRef<HTMLIFrameElement>(null!);

  useEffect(() => {
    if (path) {
      window.document.title = path.split("/").at(-1) + " • TRIPLEX";
      fetch(`http://localhost:8000/scene/open?path=${path}`, {});
    }
  }, [path]);

  useEffect(() => {
    return listen("trplx:onSceneObjectNavigated", (data) => {
      setSearchParams({
        path: data.path,
        props: encodeURIComponent(JSON.stringify(data.props)),
      });
    });
  }, []);

  useEffect(() => {
    if (path) {
      send(iframe.current, "trplx:requestNavigateToSceneObject", {
        path,
        props: props ? JSON.parse(decodeURIComponent(props)) : {},
      });
    }
  }, [path, props]);

  return (
    <div className="h-screen bg-neutral-900">
      <div className="absolute top-5 left-5 z-50">
        <div className="flex">
          <SceneMenu />
        </div>
      </div>

      <iframe
        src={`/scene.html`}
        ref={iframe}
        className="absolute h-full w-full border-none"
      />
    </div>
  );
}
