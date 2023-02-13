import { listen, send } from "@triplex/bridge/host";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useEditor, FocusedObject } from "./stores/editor";

interface BridgeContext {
  blur(): void;
  focus(sceneObject: FocusedObject): void;
  jumpTo(): void;
  navigateTo(sceneObject?: { path: string; encodedProps: string }): void;
}

const BridgeContext = createContext<BridgeContext | null>(null);
const ReadyContext = createContext<boolean>(false);

export function useScene(): BridgeContext {
  const context = useContext(BridgeContext);
  if (!context) {
    throw new Error("invariant: scene not ");
  }

  return context;
}

export function useSceneReady() {
  return useContext(ReadyContext);
}

function useEffectWhenReady(cb: () => void | (() => void), deps: any[]) {
  const ready = useSceneReady();

  useEffect(() => {
    if (!ready) {
      return;
    }

    return cb();
  }, [ready, ...deps]);
}

export function SceneFrame({ children }: { children: ReactNode }) {
  const iframe = useRef<HTMLIFrameElement>(null!);
  const editor = useEditor();
  const [initialPath] = useState(() => editor.path);
  const [initialProps] = useState(() => editor.encodedProps);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    listen("trplx:onConnected", () => {
      setReady(true);
    });
  }, []);

  const context: BridgeContext = useMemo(
    (): BridgeContext => ({
      blur() {
        send(iframe.current, "trplx:requestBlurSceneObject", {});
      },
      focus(sceneObject) {
        send(iframe.current, "trplx:requestFocusSceneObject", sceneObject);
      },
      jumpTo() {
        send(iframe.current, "trplx:requestJumpToSceneObject", {});
      },
      navigateTo(sceneObject) {
        send(iframe.current, "trplx:requestNavigateToScene", sceneObject);
      },
    }),
    []
  );

  return (
    <>
      <iframe
        // This should never change during a session as it will do a full page reload.
        src={`/scene.html?path=${initialPath}&props=${initialProps}`}
        ref={iframe}
        className="absolute h-full w-full border-none"
      />
      <ReadyContext.Provider value={ready}>
        <BridgeContext.Provider value={context}>
          <BridgeSendEvents />
          <BridgeReceiveEvents />
          {children}
        </BridgeContext.Provider>
      </ReadyContext.Provider>
    </>
  );
}

function BridgeSendEvents() {
  const scene = useScene();
  const editor = useEditor();

  useEffectWhenReady(() => {
    const callback = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        scene.blur();
      }

      if (e.key === "f") {
        scene.jumpTo();
      }

      if (e.key === "F" && e.shiftKey) {
        scene.navigateTo();
      }
    };

    document.addEventListener("keyup", callback);

    return () => document.removeEventListener("keyup", callback);
  }, []);

  useEffectWhenReady(() => {
    // This handles the browser history being updated and propagating to the scene.
    scene.navigateTo({
      path: editor.path,
      encodedProps: editor.encodedProps,
    });
  }, [editor.path]);

  return null;
}

function BridgeReceiveEvents() {
  const editor = useEditor();

  useEffectWhenReady(() => {
    return listen("trplx:onSceneObjectNavigated", (data) => {
      editor.set({
        path: data.path,
        encodedProps: data.encodedProps,
      });
    });
  }, [editor.set]);

  useEffectWhenReady(() => {
    return listen("trplx:onSceneObjectFocus", (data) => {
      editor.focus(data);

      if (data.path) {
        // Only custom components will have a path set.
        fetch(
          `http://localhost:8000/scene/${encodeURIComponent(data.path)}/open`
        );
      }
    });
  }, [editor.focus]);

  useEffectWhenReady(() => {
    return listen("trplx:onSceneObjectBlur", () => {
      editor.focus(null);
    });
  }, [editor.focus]);

  useEffectWhenReady(() => {
    return listen("trplx:requestSave", () => {
      fetch(`http://localhost:8000/scene/save?path=${editor.path}`, {});
    });
  }, [editor.path]);

  return null;
}
