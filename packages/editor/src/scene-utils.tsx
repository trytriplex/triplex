import { useThree } from '@react-three/fiber';
import { useEffect } from 'react';
import { Mesh } from 'three';

export function useForceVisible() {
  const scene = useThree((three) => three.scene);

  useEffect(() => {
    scene.traverse((object) => {
      if (object.type === 'Mesh') {
        const mesh = object as Mesh;
        if (!mesh.visible) {
          mesh.visible = true;
        }
      }
    });
  });
}
