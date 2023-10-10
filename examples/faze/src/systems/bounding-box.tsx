/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { useFrame } from "@react-three/fiber";
import {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { Box3, Group, Mesh, Object3D, Vector3, Vector3Tuple } from "three";

const boxes: Box3[] = [];
const V1 = new Vector3();
const V2 = new Vector3();

export interface BoundingBoxRef {
  box: Box3;
  intersecting: () => false | Box3;
  update: () => void;
}

const findMesh = (objs: Object3D[]): Mesh => {
  for (let i = 0; i < objs.length; i++) {
    const obj = objs[i];
    return obj.type === "Group" || obj.type === "Mesh"
      ? (obj as Mesh)
      : findMesh(obj.children);
  }

  throw new Error("invariant");
};

export const BoundingBox = forwardRef<
  BoundingBoxRef,
  | { children: JSX.Element; skip?: boolean }
  | { depth: number; height: number; position: Vector3Tuple; width: number }
>(function BoundingBox(props, ref) {
  const [box] = useState(() => new Box3());
  const cachedMeshRef = useRef<Mesh>();
  const skip = "skip" in props ? props.skip : false;

  const findFirstMeshChild = useCallback((ref: Group | null) => {
    if (ref === null) {
      cachedMeshRef.current = undefined;
    } else {
      const mesh = findMesh(ref.children);
      cachedMeshRef.current = mesh;
    }
  }, []);

  useImperativeHandle(
    ref,
    () => ({
      box,
      intersecting: () => {
        if (skip) {
          return false;
        }

        box.setFromObject(cachedMeshRef.current!);

        for (let i = 0; i < boxes.length; i++) {
          const target = boxes[i];
          if (target === box) {
            continue;
          }

          if (box.intersectsBox(target)) {
            return target;
          }
        }

        return false;
      },
      update: () => {
        box.setFromObject(cachedMeshRef.current!);
      },
    }),
    [box, skip]
  );

  useLayoutEffect(() => {
    if (!skip) {
      boxes.push(box);

      return () => {
        boxes.splice(boxes.indexOf(box), 1);
      };
    }
  }, [box, skip]);

  useFrame(() => {
    if ("children" in props) {
      box.setFromObject(cachedMeshRef.current!);
    } else {
      const min = V1.fromArray(props.position);
      const max = V2.set(
        props.position[0] + props.width,
        props.position[1] + props.height,
        props.position[2] + props.depth
      );

      box.set(min, max);
    }
  });

  if ("children" in props) {
    return <group ref={findFirstMeshChild}>{props.children}</group>;
  }

  return null;
});
