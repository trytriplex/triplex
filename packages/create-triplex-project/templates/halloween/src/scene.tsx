import { Fence, Post } from "./components/fence";
import { Floor } from "./components/floor";
import { Item } from "./components/item";
import { Crypt, Shrine } from "./components/structure";
import { Tree } from "./components/tree";

export default function Scene() {
  return (
    <>
      <ambientLight intensity={0.7} />
      <Shrine position={[-4, 0, -4]} />
      <Crypt position={[0, 0, -7]} />
      <Floor position={[0, -0.02, 0]} scale={[8, 8, 8]} variant={undefined} />

      <group name="fence">
        <Fence position={[-6.5, 0, 3]} variant={"fence_broken"} />
        <Fence position={[6.5, 0, 3]} />
        <Post position={[-3.5, 0, 4]} variant={"post_lantern"} />
        <Post position={[3.5, 0, 4]} variant={"post_lantern"} />
      </group>

      <group name="trees">
        <Tree position={[-6, 0, -2]} rotation={[0, 0.8, 0]} />
        <Tree position={[-12, 0, -11]} />
        <Tree
          position={[8.5, 0.2, -7]}
          rotation={[0, -0.495_545_329_609_613_2, 0]}
          variant={"tree_dead_large_decorated"}
        />
        <Tree position={[-9, 0.4, -7]} variant={"tree_pine_yellow_large"} />
      </group>
      <Item
        position={[1.2, 0.24, -2.22]}
        rotation={[3.14, -0.57, 3.14]}
        variant={"candle_triple"}
      />
      <pointLight
        intensity={100}
        position={[4.599_853_209_174_745_5, 22.406_840_483_186_24, 1.648_324_223_143_534_4]}
      />
    </>
  );
}
