import { useFrame } from "@react-three/fiber";
import { useLayoutEffect } from "react";
import { MathUtils, PerspectiveCamera, Vector3 } from "three";
import { add, damp } from "../../math/vectors";
import { useEntities } from "miniplex/react";
import { world } from "../store";

const V1 = new Vector3();

export function useCamera() {
  const { entities: activeEntities } = useEntities(
    world.with("focused", "sceneObject")
  );
  const { entities: cameras } = useEntities(
    world.with("camera", "sceneObject")
  );

  const camera = cameras[0];
  const target = activeEntities
    .filter((entity) => entity.npc || entity.player)
    .at(-1);

  useLayoutEffect(() => {
    if (!target || !target.sceneObject.current || !camera.sceneObject.current) {
      return;
    }

    const targetPosition = V1.copy(target.sceneObject.current.position);
    if (camera.offset) {
      add(targetPosition, camera.offset);
    }

    camera.sceneObject.current.position.copy(targetPosition);
  }, [camera, target]);

  useFrame((_, delta) => {
    if (!target || !target.sceneObject.current || !camera.sceneObject.current) {
      return;
    }

    const targetPosition = V1.copy(target.sceneObject.current.position);
    const cameraObject: PerspectiveCamera = camera.sceneObject
      .current as PerspectiveCamera;

    if (!cameraObject.isPerspectiveCamera) {
      return;
    }

    if (camera.offset) {
      add(targetPosition, camera.offset);
    }

    if (target.offset) {
      add(targetPosition, target.offset);
    }

    damp(cameraObject.position, targetPosition, 3, delta);

    cameraObject.zoom = MathUtils.damp(
      cameraObject.zoom,
      target.zoom || 1,
      5,
      delta
    );
    cameraObject.updateProjectionMatrix();
  });
}
