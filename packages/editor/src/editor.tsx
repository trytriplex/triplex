import { listen, send } from "@triplex/bridge/host";
import { useSearchParams } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { EditorMenu } from "./ui/editor-menu";
import { SceneList } from "./ui/scene-list";

function SceneFrame() {
  const [searchParams] = useSearchParams({ path: "" });
  const path = searchParams.get("path");
  const props = searchParams.get("props");
  const iframe = useRef<HTMLIFrameElement>(null!);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    listen("trplx:onConnected", () => {
      setReady(true);
    });
  }, []);

  useEffect(() => {
    if (ready && path) {
      send(iframe.current, "trplx:requestNavigateToSceneObject", {
        path,
        props: props ? JSON.parse(decodeURIComponent(props)) : {},
      });
    }
  }, [path, props, ready]);

  return (
    <iframe
      src={`/scene.html`}
      ref={iframe}
      className="absolute h-full w-full border-none"
    />
  );
}

export function EditorFrame() {
  const [searchParams, setSearchParams] = useSearchParams({ path: "" });
  const path = searchParams.get("path");

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

  return (
    <div className="relative h-screen bg-neutral-900">
      <SceneFrame />

      <div className="absolute top-5 left-5">
        <div className="flex">
          <SceneList />
          <EditorMenu />
        </div>
      </div>
    </div>
  );
}
