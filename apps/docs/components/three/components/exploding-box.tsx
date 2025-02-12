/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
import { useEffect, useLayoutEffect } from "react";
import { type Group, type Vector3Tuple } from "three";
import { useRefs } from "../../use-refs";

interface ExplodingBoxProps {
  position?: Vector3Tuple;
  rotation?: Vector3Tuple;
  stage?: boolean;
}

const increments = Array(100)
  .fill(undefined)
  .map((_, index) => (1 / 100) * (index + 1));

export function ExplodingBox({ position, rotation, stage }: ExplodingBoxProps) {
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
      { threshold: increments },
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
    <group position={position} rotation={rotation} scale={4}>
      <group ref={side1}>
        <mesh castShadow position={[0, 0, 0.5]} receiveShadow>
          <boxGeometry />
          <meshStandardMaterial color={"#739dd3"} />
        </mesh>
      </group>
      <group ref={side2}>
        <mesh
          castShadow
          position={[0, 1, -0.5]}
          receiveShadow
          rotation={[-1.570_796_326_794_896_6, 0, 0]}
        >
          <boxGeometry />
          <meshStandardMaterial color={"#739dd3"} />
        </mesh>
      </group>
      <group ref={side3}>
        <mesh
          castShadow
          position={[1, 0, -0.5]}
          receiveShadow
          rotation={[
            -1.570_796_326_794_897, 1.570_796_326_794_896_6,
            -1.570_796_326_794_897,
          ]}
        >
          <boxGeometry />
          <meshStandardMaterial color={"#739dd3"} />
        </mesh>
      </group>
      <group ref={side4}>
        <mesh
          position={[
            0.167_330_051_999_643_3, 0.458_030_430_580_36,
            -0.082_669_948_000_356_76,
          ]}
          rotation={[0, -1.570_796_326_794_896_6, 0]}
        >
          <boxGeometry />
          <meshStandardMaterial color={"#739dd3"} />
        </mesh>
      </group>
      <group ref={side5}>
        <mesh
          position={[
            0.431_999_034_783_103_1, 0.456_145_654_172_607_33,
            -0.318_000_965_216_897,
          ]}
          rotation={[3.141_592_653_589_793, 0, 0]}
        >
          <boxGeometry />
          <meshStandardMaterial color={"#739dd3"} />
        </mesh>
      </group>
      <group ref={side6}>
        <mesh
          position={[
            0.293_634_022_734_962, 0.403_744_175_822_069_4,
            -0.206_365_977_265_038_14,
          ]}
          rotation={[1.570_796_326_794_896_6, 0, 0]}
        >
          <boxGeometry />
          <meshStandardMaterial color={"#739dd3"} />
        </mesh>
      </group>
    </group>
  );
}
