import { useTexture } from "@react-three/drei";
import { CascadedShadowMap } from "../utils/cascaded-shadow-map";
import { useState } from "react";
import { degToRad } from "three/src/math/MathUtils";
import { BoundingBox } from "../systems/bounding-box";
import { ElevatorEntity } from "../entities/elevator-entity";
import { StaticEntity } from "../entities/static-entity";
import { NPCEntity } from "../entities/npc-entity";
import { PlayerEntity } from "../entities/player-entity";
import { ItemEntity } from "../entities/item-entity";
import {
  DialogMessage,
  DialogEntity,
  DialogAction,
} from "../entities/dialog-entity";
import { Tree } from "../meshes/tree";
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
      <BoundingBox position={[-15, 0, -14]} width={30} height={10} depth={1} />
      <BoundingBox position={[-15, 0, 14]} width={30} height={10} depth={1} />
      <BoundingBox position={[-15, 0, -14]} width={1} height={10} depth={28} />
      <BoundingBox position={[13, 0, -14]} width={1} height={10} depth={28} />

      <mesh layers={TERRAIN} receiveShadow position={[0, -height, 0]}>
        {geo}
      </mesh>
      <mesh layers={TERRAIN} receiveShadow position={[-10, -lowHeight, 0]}>
        {geo}
      </mesh>
      <mesh layers={TERRAIN} receiveShadow position={[10, -lowHeight, 0]}>
        {geo}
      </mesh>
      <mesh layers={TERRAIN} receiveShadow position={[-7.5, 4, -13]}>
        <boxGeometry args={[10, 0.2, 10]} />
        <meshStandardMaterial map={tex} />
      </mesh>
      <mesh layers={TERRAIN} receiveShadow position={[-10, -height, -10]}>
        {geo}
      </mesh>
      <mesh
        layers={TERRAIN}
        name="floor"
        receiveShadow
        rotation={[degToRad(10), 0, 0]}
        position={[-10, 0.3, -10]}
      >
        {geo}
      </mesh>
      <mesh layers={TERRAIN} receiveShadow position={[10, -height, -10]}>
        {geo}
      </mesh>
      <mesh layers={TERRAIN} receiveShadow position={[0, -lowHeight, 10]}>
        {geo}
      </mesh>
      <mesh layers={TERRAIN} receiveShadow position={[0, -lowHeight, -10]}>
        {geo}
      </mesh>
      <mesh layers={TERRAIN} receiveShadow position={[10, -height, 10]}>
        {geo}
      </mesh>
      <mesh layers={TERRAIN} receiveShadow position={[-10, -height, 10]}>
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
        position={[0, 0.25, -10]}
        levels={[0.25, 2.5, 5]}
        level={level}
      />

      <Tree position={[7, -0.35, -3]} />
      <NPCEntity
        speed={5}
        position={[1.4622019307180276, 0, 0.31658175916090947]}
        positionCycle={[
          [-5, 0, 0],
          [-5, 0, 5],
          [0, 0, 5],
          [10, 0, 5],
        ]}
      >
        <DialogEntity>
          <DialogMessage text="EXCUSE ME I'm running here !!!!" />
          <DialogAction
            when="item"
            itemName="gumStick"
            successText="Oh now I've got gum on my shoe..."
            onSuccess={[["stop", 5]]}
          />
        </DialogEntity>
      </NPCEntity>

      <NPCEntity
        speed={10}
        position={[-8, 0, -2]}
        positionCycle={[[-8, 0, -10]]}
      />

      <NPCEntity position={[4, 0, -5]}>
        <DialogEntity>
          <DialogMessage text="MMMmm... hungry..." />
          <DialogAction
            when="item"
            itemName="bone"
            count={2}
            failureText="NO! ME WANT TWO BONES!"
            successText="BONES!!!!! Thankey £"
            onSuccess={[["take"], ["give", "key"]]}
          />
        </DialogEntity>
      </NPCEntity>

      <NPCEntity position={[2, 0, -1]}>
        <DialogEntity>
          <DialogMessage text="AHHH hello!!!" />
          <DialogMessage text="How are you going today!" />
          <DialogMessage text="There's something behind that tree..." />
          <DialogAction
            when="item"
            itemName="key"
            successText="Oh, a key! I can use this..."
            onSuccess={[["take"], ["move", [[5, 0, -1]]]]}
          />
        </DialogEntity>
      </NPCEntity>

      <NPCEntity
        speed={10}
        position={[-10, 0, 10]}
        positionCycle={[[-3, 0, 10]]}
      />

      <ItemEntity
        id="bone"
        position={[-2.937701209752876, 1, -0.20588456170343328]}
      />
      <ItemEntity id="bone" position={[-7.5, 5, -13]} />

      <ItemEntity
        id="gum"
        position={[-4.187484792352585, 1, -3.267958833236561]}
      />
      <ItemEntity
        id="stick"
        position={[-7.405874236287305, 0.5685185565842982, -5.306576506353176]}
      />

      <hemisphereLight color="#87CEEB" intensity={0.3} groundColor="#362907" />
      <ambientLight intensity={0.3} />
      <directionalLight
        position={[1.5977056043375601, 8.047348851185415, 5]}
        intensity={0.5}
      />
      <pointLight position={[-10, 0, -20]} color="#eef4aa" intensity={0.5} />
      <CascadedShadowMap />
    </>
  );
}
