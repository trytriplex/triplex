import { useFrame, useThree } from "@react-three/fiber";
import { useEntities } from "miniplex/react";
import { useEffect, useRef } from "react";
import { Intersection, Object3D, Plane, Raycaster, Vector3 } from "three";
import { TERRAIN } from "../../utils/layers";
import { world } from "../store";

const PLANE = new Plane(new Vector3(0, 1, 0), 0);
const DOWN = new Vector3(0, -1, 0);
const raycaster = new Raycaster();
raycaster.layers.enable(TERRAIN);
const intersects: Intersection<Object3D>[] = [];
const V1_TEMP = new Vector3();

export function useTerrainPointer() {
  const { entities } = useEntities(world.with("pointer", "sceneObject"));

  const camera = useThree((three) => three.camera);
  const scene = useThree((three) => three.scene);
  const canvasSize = useThree((three) => three.size);
  const pointerPosition = useRef<[number, number]>([-9999, -9999]);

  useEffect(() => {
    const callback = (e: PointerEvent) => {
      const x = (e.clientX / canvasSize.width) * 2 - 1;
      const y = -(e.clientY / canvasSize.height) * 2 + 1;

      pointerPosition.current[0] = x;
      pointerPosition.current[1] = y;
    };

    window.addEventListener("pointermove", callback);

    return () => window.removeEventListener("pointermove", callback);
  }, [canvasSize.height, canvasSize.width]);

  useFrame(() => {
    for (const { sceneObject, parent } of entities) {
      const [x, y] = pointerPosition.current;

      if (parent && parent.sceneObject) {
        PLANE.constant = -parent.sceneObject.position.y;
      }

      raycaster.setFromCamera({ x, y }, camera);
      const intersectionOnParentPlane = raycaster.ray.intersectPlane(
        PLANE,
        V1_TEMP
      );

      if (intersectionOnParentPlane) {
        intersects.length = 0;
        raycaster.set(intersectionOnParentPlane, DOWN);
        raycaster.intersectObjects(scene.children, true, intersects);

        if (intersects.length === 0) {
          // No intersects were found, fallback to mouse based instead of place based.
          raycaster.setFromCamera({ x, y }, camera);
          raycaster.intersectObjects(scene.children, true, intersects);
        }

        const intersect = intersects[0];
        if (intersect) {
          sceneObject.position.copy(intersect.point);
        }
      }
    }
  });
}
