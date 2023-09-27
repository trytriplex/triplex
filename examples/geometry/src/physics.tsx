/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { Vector3Tuple } from "three";
import { CuboidCollider, RigidBody } from "@react-three/rapier";
import Sphere from "./geometry/sphere";

export function Box({ position }: { position?: Vector3Tuple }) {
  return (
    <group>
      <RigidBody
        position={position}
        name="box"
        type="dynamic"
        colliders={"hull"}
        canSleep={false}
      >
        <mesh
          position={[
            1.6549920126121433, -0.3254334284808742, -0.2744969321942926,
          ]}
          scale={[0.9045167624341905, 0.319770360905584, 2.396496829171177]}
          rotation={[0, 0, -1.5707963267948966]}
          castShadow={true}
          receiveShadow={true}
        >
          <boxGeometry />
          <meshStandardMaterial />
        </mesh>

        <mesh
          position={[
            0.04714328763925291, -0.3254334284808742, -1.5002294791289192,
          ]}
          scale={[0.9045167624341905, 0.319770360905584, 3.5251121706221857]}
          rotation={[0, -1.5707963267948966, -1.5707963267948966]}
          castShadow={true}
          receiveShadow={true}
        >
          <boxGeometry />
          <meshStandardMaterial />
        </mesh>

        <mesh
          position={[
            0.04714328763925291, -0.3254334284808742, 1.0401377744557592,
          ]}
          scale={[0.9045167624341905, 0.319770360905584, 3.5251121706221857]}
          rotation={[0, -1.5707963267948966, -1.5707963267948966]}
          castShadow={true}
          receiveShadow={true}
        >
          <boxGeometry />
          <meshStandardMaterial />
        </mesh>

        <mesh
          position={[
            -1.550614746238744, -0.3254334284808742, -0.2744969321942926,
          ]}
          scale={[0.9045167624341905, 0.319770360905584, 2.396496829171177]}
          rotation={[0, 0, -1.5707963267948966]}
          castShadow={true}
          receiveShadow={true}
        >
          <boxGeometry />
          <meshStandardMaterial />
        </mesh>

        <mesh
          position={[
            0.031562394098517244, -0.6166641393968946, -0.2744969321942926,
          ]}
          scale={[2.981527080794196, 0.319770360905584, 2.396496829171177]}
          receiveShadow={true}
        >
          <boxGeometry />
          <meshStandardMaterial />
        </mesh>
      </RigidBody>
    </group>
  );
}

export function Physics() {
  return (
    <>
      <CuboidCollider
        position={[1.9235471986625399, -1.425786335514172, -0.9250816943886655]}
        args={[10, 1, 10]}
      />

      <Sphere
        scale={[0.38625740406434994, 0.38625740406434994, 0.38625740406434994]}
        position={[-0.7820817154528374, 0, 0]}
      />
      <Sphere
        scale={[0.38625740406434994, 0.38625740406434994, 0.38625740406434994]}
        position={[-0.3960138930639381, 0, -0.6872838927028156]}
      />
      <Sphere
        scale={[0.38625740406434994, 0.38625740406434994, 0.38625740406434994]}
        position={[
          -0.17071635535845986, 2.4787986918099554, 0.11689887473073668,
        ]}
      />
      <Sphere
        scale={[0.38625740406434994, 0.38625740406434994, 0.38625740406434994]}
        position={[
          0.8138913054493211, -0.003901889245262517, 0.06954083570025389,
        ]}
      />
      <Sphere
        scale={[0.38625740406434994, 0.38625740406434994, 0.38625740406434994]}
        position={[
          -0.5950308985224242, 0.0005769742117097565, 0.009297507839831534,
        ]}
      />

      <Box
        position={[
          -0.49100316016004664, 0.3513054847717285, 0.00016868464287853158,
        ]}
      />
      <pointLight
        position={[0.9793310239099116, 1.0075472618170827, -2.3766838185932806]}
        castShadow={true}
        intensity={0.5}
      />
      <ambientLight intensity={0.1} />
      <pointLight
        position={[-1.8473522271621174, 1.764152076464903, 2.0121141550487596]}
        intensity={0.2}
        castShadow={true}
      />
    </>
  );
}
