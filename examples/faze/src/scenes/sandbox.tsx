/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
import { useTexture } from "@react-three/drei";
import { useState } from "react";
import { MathUtils } from "three";
import {
  DialogAction,
  DialogEntity,
  DialogMessage,
} from "../entities/dialog-entity";
import { ElevatorEntity } from "../entities/elevator-entity";
import { ItemEntity } from "../entities/item-entity";
import { NPCEntity } from "../entities/npc-entity";
import { PlayerEntity } from "../entities/player-entity";
import { StaticEntity } from "../entities/static-entity";
import { Tree } from "../meshes/tree";
import { BoundingBox } from "../systems/bounding-box";
import { CascadedShadowMap } from "../utils/cascaded-shadow-map";
import { TERRAIN } from "../utils/layers";

export function Terrain() {
  const tex = useTexture("/textures/green/texture_09.png");
  const height = 1;
  const lowHeight = height - 0.2;
  const geo = (
    <>
      <boxGeometry args={[10, height, 10]} />
      <meshStandardMaterial map={tex} />
    </>
  );

  return (
    <group>
      <BoundingBox depth={1} height={10} position={[-15, 0, -14]} width={30} />
      <BoundingBox depth={1} height={10} position={[-15, 0, 14]} width={30} />
      <BoundingBox depth={28} height={10} position={[-15, 0, -14]} width={1} />
      <BoundingBox depth={28} height={10} position={[13, 0, -14]} width={1} />

      <mesh layers={TERRAIN} position={[0, -height, 0]} receiveShadow>
        {geo}
      </mesh>
      <mesh layers={TERRAIN} position={[-10, -lowHeight, 0]} receiveShadow>
        {geo}
      </mesh>
      <mesh layers={TERRAIN} position={[10, -lowHeight, 0]} receiveShadow>
        {geo}
      </mesh>
      <mesh layers={TERRAIN} position={[-7.5, 4, -13]} receiveShadow>
        <boxGeometry args={[10, 0.2, 10]} />
        <meshStandardMaterial map={tex} />
      </mesh>
      <mesh layers={TERRAIN} position={[-10, -height, -10]} receiveShadow>
        {geo}
      </mesh>
      <mesh
        layers={TERRAIN}
        name="floor"
        position={[-10, 0.3, -10]}
        receiveShadow
        rotation={[MathUtils.degToRad(10), 0, 0]}
      >
        {geo}
      </mesh>
      <mesh layers={TERRAIN} position={[10, -height, -10]} receiveShadow>
        {geo}
      </mesh>
      <mesh layers={TERRAIN} position={[0, -lowHeight, 10]} receiveShadow>
        {geo}
      </mesh>
      <mesh layers={TERRAIN} position={[0, -lowHeight, -10]} receiveShadow>
        {geo}
      </mesh>
      <mesh layers={TERRAIN} position={[10, -height, 10]} receiveShadow>
        {geo}
      </mesh>
      <mesh layers={TERRAIN} position={[-10, -height, 10]} receiveShadow>
        {geo}
      </mesh>
    </group>
  );
}

export function SandboxScene() {
  const [level, setLevel] = useState<0 | 1 | 2>(0);
  const onClickLever = () => {
    setLevel((prev) => {
      switch (prev) {
        case 0:
          return 1;

        case 1:
          return 2;

        case 2:
          return 0;
      }
    });
  };

  return (
    <>
      <PlayerEntity position={[0, 0, -3]} />

      <Terrain />
      <StaticEntity onClick={onClickLever} position={[0, 0.5, -10]} />
      <ElevatorEntity
        level={level}
        levels={[0.25, 2.5, 5]}
        position={[0, 0.25, -10]}
      />

      <Tree position={[7, -0.35, -3]} />
      <NPCEntity
        position={[1.462_201_930_718_027_6, 0, 0.316_581_759_160_909_47]}
        positionCycle={[
          [-5, 0, 0],
          [-5, 0, 5],
          [0, 0, 5],
          [10, 0, 5],
        ]}
        speed={5}
      >
        <DialogEntity>
          <DialogMessage text="EXCUSE ME I'm running here !!!!" />
          <DialogAction
            itemName="gumStick"
            onSuccess={[["stop", 5]]}
            successText="Oh now I've got gum on my shoe..."
            when="item"
          />
        </DialogEntity>
      </NPCEntity>

      <NPCEntity
        position={[-8, 0, -2]}
        positionCycle={[[-8, 0, -10]]}
        speed={10}
      />

      <NPCEntity position={[4, 0, -5]}>
        <DialogEntity>
          <DialogMessage text="MMMmm... hungry..." />
          <DialogAction
            count={2}
            failureText="NO! ME WANT TWO BONES!"
            itemName="bone"
            onSuccess={[["take"], ["give", "key"]]}
            successText="BONES!!!!! Thankey £"
            when="item"
          />
        </DialogEntity>
      </NPCEntity>

      <NPCEntity
        position={[2.009_005_080_231_767, 0, -0.988_126_801_265_095_4]}
      >
        <DialogEntity>
          <DialogMessage text="AHHH hello!!!" />
          <DialogMessage text="How are you going today!" />
          <DialogMessage text="There's something behind that tree..." />
          <DialogAction
            itemName="key"
            onSuccess={[["take"], ["move", [[5, 0, -1]]]]}
            successText="Oh, a key! I can use this..."
            when="item"
          />
        </DialogEntity>
      </NPCEntity>

      <NPCEntity
        position={[-10, 0, 10]}
        positionCycle={[[-3, 0, 10]]}
        speed={10}
      />

      <ItemEntity
        id={"bone"}
        position={[-2.937_701_209_752_88, 1, -0.205_884_561_703_433_28]}
      />
      <ItemEntity id="bone" position={[-7.5, 5, -13]} />

      <ItemEntity
        id="gum"
        position={[-4.187_484_792_352_585, 1, -3.267_958_833_236_561]}
      />
      <ItemEntity
        id="stick"
        position={[
          -7.405_874_236_287_305, 0.568_518_556_584_298_2,
          -5.306_576_506_353_176,
        ]}
      />

      <hemisphereLight
        color="#87CEEB"
        groundColor={"#362907"}
        intensity={0.3}
      />
      <ambientLight intensity={0.3} />
      <directionalLight
        intensity={0.5}
        position={[1.597_705_604_337_560_1, 8.047_348_851_185_415, 5]}
      />
      <pointLight color="#eef4aa" intensity={0.5} position={[-10, 0, -20]} />
      <CascadedShadowMap />
    </>
  );
}
