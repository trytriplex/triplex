import { listen, send } from "@triplex/bridge/host";
import { useSearchParams } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { useSceneStore } from "./stores/scene";

export function SceneFrame() {
  const iframe = useRef<HTMLIFrameElement>(null!);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    listen("trplx:onConnected", () => {
      setReady(true);
    });
  }, []);

  return (
    <>
      <iframe
        src={`/scene.html`}
        ref={iframe}
        className="absolute h-full w-full border-none"
      />
      {ready && <Bridge iframeRef={iframe} />}
    </>
  );
}

export function Bridge({
  iframeRef,
}: {
  iframeRef: React.MutableRefObject<HTMLIFrameElement>;
}) {
  const [searchParams, setSearchParams] = useSearchParams({ path: "" });
  const path = searchParams.get("path");
  const props = searchParams.get("props");
  const focus = useSceneStore((store) => store.focus);
  const focused = useSceneStore((store) => store.focused);

  useEffect(() => {
    if (focused) {
      send(iframeRef.current, "trplx:requestFocusSceneObject", focused);
    } else {
      send(iframeRef.current, "trplx:requestBlurSceneObject", {});
    }
  }, [focused]);

  useEffect(() => {
    if (path) {
      send(iframeRef.current, "trplx:requestNavigateToSceneObject", {
        path,
        props: props ? JSON.parse(decodeURIComponent(props)) : {},
      });
    }
  }, [path, props]);

  useEffect(() => {
    return listen("trplx:onSceneObjectNavigated", (data) => {
      setSearchParams({
        path: data.path,
        props: encodeURIComponent(JSON.stringify(data.props)),
      });
    });
  }, []);

  useEffect(() => {
    return listen("trplx:onSceneObjectFocus", (data) => {
      focus(data);
    });
  }, []);

  useEffect(() => {
    return listen("trplx:onSceneObjectBlur", () => {
      focus(null);
    });
  }, []);

  return null;
}
