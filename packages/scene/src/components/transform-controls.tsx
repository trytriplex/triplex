import { useRef, forwardRef, useEffect } from "react";
import {
  TransformControls as TransformControlsImpl,
  TransformControlsProps,
} from "triplex-drei";
import mergeRefs from "react-merge-refs";
import { useCamera } from "./camera";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const TransformControls = forwardRef<any, TransformControlsProps>(
  (props: TransformControlsProps, ref) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const controlsRef = useRef<any>(null);
    const { controls } = useCamera();

    useEffect(() => {
      const callback = (event: { value: boolean }) => {
        if (controls.current) {
          controls.current.enabled = !event.value;
        }
      };

      const transformControls = controlsRef.current;

      transformControls.addEventListener("dragging-changed", callback);

      return () => {
        transformControls.removeEventListener("dragging-changed", callback);
      };
    }, [controls]);

    return (
      <TransformControlsImpl {...props} ref={mergeRefs([controlsRef, ref])} />
    );
  }
);
