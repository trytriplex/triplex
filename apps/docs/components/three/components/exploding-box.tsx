/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { useEffect, useLayoutEffect } from "react";
import { Vector3Tuple, type Group } from "three";
import { useRefs } from "../../use-refs";

interface ExplodingBoxProps {
  rotation?: Vector3Tuple;
  position?: Vector3Tuple;
  stage?: boolean;
}

const increments = Array(100)
  .fill(undefined)
  .map((_, index) => (1 / 100) * (index + 1));

export function ExplodingBox({ rotation, stage, position }: ExplodingBoxProps) {
  const [side1, side2, side3, side4, side5, side6] = useRefs<Group>();

  useLayoutEffect(() => {
    if (stage) {
      side1.current.position.z = 10;
      side2.current.position.y = 10;
      side3.current.position.x = 10;
      side4.current.position.z = 10;
      side5.current.position.x = 10;
      side6.current.position.y = 10;
    }
  }, [side1, side2, side3, side4, side5, side6, stage]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const value = (1 - entry.intersectionRatio) * 3.2;

          switch (entry.target.id) {
            case "hero-section": {
              const nextValue =
                Math.max(1 - (entry.intersectionRatio + 0.2), 0) * 3.2;

              side1.current.position.z = nextValue;
              side2.current.position.y = nextValue;
              side3.current.position.x = nextValue;
              break;
            }

            case "value-prop-0":
              side4.current.position.z = value;
              break;

            case "value-prop-1":
              side5.current.position.x = value;
              break;

            case "value-prop-2":
              side6.current.position.y = value;
              break;
          }
        });
      },
      { threshold: increments }
    );

    const observe = (element: HTMLElement | null) => {
      if (element) {
        observer.observe(element);
      }
    };

    observe(document.getElementById("hero-section"));
    observe(document.getElementById("value-prop-0"));
    observe(document.getElementById("value-prop-1"));
    observe(document.getElementById("value-prop-2"));

    return () => {
      observer.disconnect();
    };
  }, [side1, side2, side3, side4, side5, side6]);

  return (
    <group scale={4} rotation={rotation} position={position}>
      <group ref={side1}>
        <mesh receiveShadow castShadow position={[0, 0, 0.5]}>
          <boxGeometry />
          <meshStandardMaterial color={"#739dd3"} />
        </mesh>
      </group>
      <group ref={side2}>
        <mesh
          receiveShadow
          castShadow
          rotation={[-1.5707963267948966, 0, 0]}
          position={[0, 1, -0.5]}
        >
          <boxGeometry />
          <meshStandardMaterial color={"#739dd3"} />
        </mesh>
      </group>
      <group ref={side3}>
        <mesh
          receiveShadow
          castShadow
          rotation={[
            -1.570796326794897, 1.5707963267948966, -1.570796326794897,
          ]}
          position={[1, 0, -0.5]}
        >
          <boxGeometry />
          <meshStandardMaterial color={"#739dd3"} />
        </mesh>
      </group>
      <group ref={side4}>
        <mesh
          rotation={[0, -1.5707963267948966, 0]}
          position={[
            0.1673300519996433, 0.45803043058036, -0.08266994800035676,
          ]}
        >
          <boxGeometry />
          <meshStandardMaterial color={"#739dd3"} />
        </mesh>
      </group>
      <group ref={side5}>
        <mesh
          rotation={[3.141592653589793, 0, 0]}
          position={[
            0.4319990347831031, 0.45614565417260733, -0.318000965216897,
          ]}
        >
          <boxGeometry />
          <meshStandardMaterial color={"#739dd3"} />
        </mesh>
      </group>
      <group ref={side6}>
        <mesh
          rotation={[1.5707963267948966, 0, 0]}
          position={[
            0.293634022734962, 0.4037441758220694, -0.20636597726503814,
          ]}
        >
          <boxGeometry />
          <meshStandardMaterial color={"#739dd3"} />
        </mesh>
      </group>
    </group>
  );
}
