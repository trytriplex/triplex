/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
import { Clone, useTexture } from "@react-three/drei";
import {
  DialogAction,
  DialogEntity,
  DialogMessage,
} from "../entities/dialog-entity";
import { ItemEntity } from "../entities/item-entity";
import { NPCEntity } from "../entities/npc-entity";
import { PlayerEntity } from "../entities/player-entity";
import { StaticEntity } from "../entities/static-entity";
import { WaterMaterial } from "../materials/water";
import { Tree } from "../meshes/tree";
import { ItemDrop } from "../systems/item-drop";
import { CascadedShadowMap } from "../utils/cascaded-shadow-map";
import { useGLTF } from "../utils/gltf";
import { TERRAIN } from "../utils/layers";

const alpha: Record<string, number> = {
  waterbowl_water: 0.5,
};

const ignore = ["Scene", "trees"];

const layers: Record<string, number> = {
  bridges: TERRAIN,
  grass: TERRAIN,
  hedges: TERRAIN,
  road: TERRAIN,
  stairs: TERRAIN,
  water: TERRAIN,
  waterbowl: TERRAIN,
};

const materials: Record<string, JSX.Element> = {
  water: <WaterMaterial speed={1} wavelength={3} />,
  waterbowl_water: <WaterMaterial opacity={0.5} transparent />,
};

export function ParkScene() {
  const { nodes } = useGLTF<keyof typeof maps>("/mesh/park.glb");
  const maps = useTexture({
    boat: "/textures/light/texture_07.png",
    bridges: "/textures/light/texture_08.png",
    cityscape: "/textures/light/texture_06.png",
    fence: "/textures/light/texture_06.png",
    grass: "/textures/green/texture_09.png",
    hedges: "/textures/green/texture_05.png",
    pole: "/textures/light/texture_06.png",
    road: "/textures/dark/texture_06.png",
    stairs: "/textures/dark/texture_01.png",
    trees: "/textures/green/texture_08.png",
    trees_small: "/textures/green/texture_08.png",
    water: "/textures/blue/texture_06.png",
    waterbowl: "/textures/light/texture_06.png",
    waterbowl_water: "/textures/blue/texture_06.png",
  });

  return (
    <>
      <PlayerEntity
        position={[7.880_951_061_776_439, 0.012_977_683_819_411_279, 11]}
      />

      <ItemDrop item="woodStump" position={[7, 0, 10.774_701_506_059_406]}>
        <StaticEntity collidable={false} position={[7, 1, 12]}>
          <mesh castShadow layers={TERRAIN} receiveShadow>
            <boxGeometry args={[1, 0.7, 1]} />
            <meshStandardMaterial color="brown" />
          </mesh>
        </StaticEntity>
      </ItemDrop>

      <Tree
        position={[
          6.918_252_663_980_362, -0.012_594_673_863_718_764,
          10.662_967_482_824_303,
        ]}
      />
      <Tree
        position={[
          34.231_777_739_531_296, 0.011_236_969_473_075_675,
          20.652_207_012_040_023,
        ]}
      />
      <Tree
        position={[
          34.231_777_739_531_296, 0.011_236_969_473_075_675,
          4.538_492_780_153_211,
        ]}
      />
      <Tree
        position={[
          34.231_777_739_531_296, 0.011_236_969_473_075_675,
          -12.633_458_930_389_056,
        ]}
      />
      <Tree
        position={[
          15.949_946_298_513_808, 0.011_236_969_473_075_675,
          -12.633_458_930_389_056,
        ]}
      />
      <Tree
        position={[
          -3.109_545_038_954_262, 0.011_236_969_473_075_675,
          -12.633_458_930_389_056,
        ]}
      />

      <NPCEntity
        name="tree-onlooker-2"
        position={[3.268_290_489_195_720_3, 0, 12]}
      >
        <DialogEntity>
          <DialogMessage text="It's too high!" />
        </DialogEntity>
      </NPCEntity>

      <NPCEntity
        name="tree-onlooker-1"
        position={[4.507_686_650_567_615, 0, 8]}
      >
        <DialogEntity>
          <DialogMessage text="Is that a...?" />
        </DialogEntity>
      </NPCEntity>

      <group>
        {Object.entries(nodes).map(([key, value]) => {
          if (ignore.includes(key)) {
            // Ignore the scene node else it will render everything twice!
            return null;
          }

          const hasAlpha = key in alpha;

          return (
            <Clone
              castShadow={!hasAlpha}
              inject={
                materials[key] || (
                  <meshStandardMaterial
                    map={maps[key as keyof typeof maps]}
                    opacity={hasAlpha ? alpha[key] : undefined}
                    transparent={hasAlpha}
                  />
                )
              }
              key={key}
              layers={layers[key]}
              object={value}
              receiveShadow={!hasAlpha}
            />
          );
        })}
      </group>

      <hemisphereLight color="#87CEEB" groundColor="#362907" intensity={0.3} />
      <ambientLight intensity={0.3} />
      <directionalLight intensity={0.5} position={[2.5, 8, 5]} />
      <pointLight color="#eef4aa" intensity={0.5} position={[-10, 0, -20]} />
      <CascadedShadowMap />

      <NPCEntity name="runner" position={[30, 0, 5]} speed={3}>
        <DialogEntity>
          <DialogMessage text="I'm so tired :-(" />
          <DialogMessage text="I'm going for a new record but I have no energy..." />
          <DialogAction
            count={2}
            itemName="apple"
            onSuccess={[
              ["take"],
              [
                "move",
                [
                  [30, 0, 5],
                  [30, 0, 10],
                  [25.5, 0, 10],
                  [25.5, 0, 5],
                ],
              ],
            ]}
            successText="YES! I'll be able to break that record now!!"
            when="item"
          />
        </DialogEntity>
      </NPCEntity>

      <NPCEntity name="run-onlooker-1" position={[30, 0, 3]}>
        <DialogEntity>
          <DialogMessage text="DUDE he's been going at it for SO LONG and he just stops now?" />
          <DialogMessage text="Yikes..." />
        </DialogEntity>
      </NPCEntity>

      <NPCEntity name="run-onlooker-2" position={[32, 0, 6]}>
        <DialogEntity>
          <DialogMessage text="I could totally chase it more ..." />
        </DialogEntity>
      </NPCEntity>

      <NPCEntity name="run-onlooker-3" position={[32, 0, 10]}>
        <DialogEntity>
          <DialogMessage text="Witty reference :-D" />
        </DialogEntity>
      </NPCEntity>

      <NPCEntity
        cameraOffset={[2, 0, 0]}
        name="boat-attendant"
        position={[-23, 0, -10.5]}
      >
        <DialogEntity>
          <DialogMessage text="Sorry mate the boat isn't here yet" />
          <DialogMessage text="...Come back later" />
        </DialogEntity>
      </NPCEntity>

      <NPCEntity name="dropoff" position={[30, 0, 37]}>
        <DialogEntity>
          <DialogMessage text="ALRIGHT well here's the park ..." />
          <DialogMessage text="You should be able to get to the city from here" />
          <DialogMessage text="GOOD LUCK !!" />
        </DialogEntity>
      </NPCEntity>

      <NPCEntity
        activateDistance={60}
        body="kinematicBody"
        cameraOffset={[3, 2, 0]}
        name="goose"
        position={[-25, -3.1, 30]}
      >
        <DialogEntity>
          <DialogMessage text="*HONK*" />
        </DialogEntity>
      </NPCEntity>

      <NPCEntity position={[3, 0, -16]}>
        <DialogEntity>
          <DialogMessage text="So romantic..." />
        </DialogEntity>
      </NPCEntity>

      <ItemEntity
        id="apple"
        position={[7, -1.473_296_852_771_059_5, 3.292_857_314_355_263]}
      ></ItemEntity>
      <ItemEntity id="bone" position={[32, 1, 32]}></ItemEntity>
      <ItemEntity
        activateDistance={15}
        body="kinematicBody"
        id="apple"
        position={[6.858_146_743_213_356, 4, 11.5]}
      ></ItemEntity>
      <ItemEntity
        id="woodStump"
        position={[
          7.111_704_900_105_632, 0.369_269_143_327_585_76,
          14.380_794_036_525_907,
        ]}
      ></ItemEntity>
    </>
  );
}
