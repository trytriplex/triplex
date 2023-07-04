/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { useGLTF } from "../utils/gltf";
import { CascadedShadowMap } from "../utils/cascaded-shadow-map";
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
import { TERRAIN } from "../utils/layers";

const alpha: Record<string, number> = {
  waterbowl_water: 0.5,
};

const ignore = ["Scene", "trees"];

const layers: Record<string, number> = {
  grass: TERRAIN,
  waterbowl: TERRAIN,
  stairs: TERRAIN,
  hedges: TERRAIN,
  bridges: TERRAIN,
  road: TERRAIN,
  water: TERRAIN,
};

const materials: Record<string, JSX.Element> = {
  waterbowl_water: <WaterMaterial opacity={0.5} transparent />,
  water: <WaterMaterial speed={1} wavelength={3} />,
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
    trees_small: "/textures/green/texture_08.png",
    trees: "/textures/green/texture_08.png",
    water: "/textures/blue/texture_06.png",
    waterbowl: "/textures/light/texture_06.png",
    waterbowl_water: "/textures/blue/texture_06.png",
  });

  return (
    <>
      <PlayerEntity position={[7.880951061776439, 0.3, 11]} />

      <ItemDrop item="woodStump" position={[7, 0, 10.774701506059406]}>
        <StaticEntity collidable={false} position={[7, 1, 12]}>
          <mesh castShadow receiveShadow layers={TERRAIN}>
            <boxGeometry args={[1, 0.7, 1]} />
            <meshStandardMaterial color="brown" />
          </mesh>
        </StaticEntity>
      </ItemDrop>

      <Tree
        position={[
          6.918252663980362, -0.012594673863718764, 10.662967482824303,
        ]}
      />
      <Tree
        position={[
          34.231777739531296, 0.011236969473075675, 20.652207012040023,
        ]}
      />
      <Tree
        position={[34.231777739531296, 0.011236969473075675, 4.538492780153211]}
      />
      <Tree
        position={[
          34.231777739531296, 0.011236969473075675, -12.633458930389056,
        ]}
      />
      <Tree
        position={[
          15.949946298513808, 0.011236969473075675, -12.633458930389056,
        ]}
      />
      <Tree
        position={[
          -3.109545038954262, 0.011236969473075675, -12.633458930389056,
        ]}
      />

      <NPCEntity name="tree-onlooker-2" position={[3.2682904891957203, 0, 12]}>
        <DialogEntity>
          <DialogMessage text="It's too high!" />
        </DialogEntity>
      </NPCEntity>

      <NPCEntity name="tree-onlooker-1" position={[4.507686650567615, 0, 8]}>
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
              key={key}
              castShadow={!hasAlpha}
              receiveShadow={!hasAlpha}
              object={value}
              layers={layers[key]}
              inject={
                materials[key] || (
                  <meshStandardMaterial
                    transparent={hasAlpha}
                    opacity={hasAlpha ? alpha[key] : undefined}
                    map={maps[key as keyof typeof maps]}
                  />
                )
              }
            />
          );
        })}
      </group>

      <hemisphereLight color="#87CEEB" intensity={0.3} groundColor="#362907" />
      <ambientLight intensity={0.3} />
      <directionalLight position={[2.5, 8, 5]} intensity={0.5} />
      <pointLight position={[-10, 0, -20]} color="#eef4aa" intensity={0.5} />
      <CascadedShadowMap />

      <NPCEntity speed={3} name="runner" position={[30, 0, 5]}>
        <DialogEntity>
          <DialogMessage text="I'm so tired :-(" />
          <DialogMessage text="I'm going for a new record but I have no energy..." />
          <DialogAction
            when="item"
            itemName="apple"
            successText="YES! I'll be able to break that record now!!"
            count={2}
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
        name="boat-attendant"
        cameraOffset={[2, 0, 0]}
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
        body="kinematicBody"
        cameraOffset={[3, 2, 0]}
        name="goose"
        activateDistance={60}
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
        position={[7, -1.4732968527710595, 3.292857314355263]}
      ></ItemEntity>
      <ItemEntity id="bone" position={[32, 1, 32]}></ItemEntity>
      <ItemEntity
        id="apple"
        position={[6.858146743213356, 4, 11.5]}
        body="kinematicBody"
        activateDistance={15}
      ></ItemEntity>
      <ItemEntity
        id="woodStump"
        position={[7.111704900105632, 0.36926914332758576, 14.380794036525907]}
      ></ItemEntity>
    </>
  );
}
