import { listen, send } from "@triplex/bridge/host";
import { useEffect, useRef, useState } from "react";
import { useSceneStore } from "./stores/scene";
import { useEditorContext } from "./stores/editor-context";

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
  const { path, props, set } = useEditorContext();
  const focus = useSceneStore((store) => store.focus);
  const focused = useSceneStore((store) => store.focused);

  useEffect(() => {
    send(iframeRef.current, "trplx:requestBlurSceneObject", {});

    if (focused) {
      send(iframeRef.current, "trplx:requestFocusSceneObject", focused);
    }
  }, [focused]);

  useEffect(() => {
    const callback = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        focus(null);
      }
    };

    document.addEventListener("keyup", callback);

    return () => document.removeEventListener("keyup", callback);
  }, []);

  useEffect(() => {
    if (path) {
      send(iframeRef.current, "trplx:requestNavigateToSceneObject", {
        path,
        props,
      });
    }
  }, [path]);

  useEffect(() => {
    return listen("trplx:onSceneObjectNavigated", (data) => {
      focus(null);
      set({
        path: data.path,
        props: data.props,
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
