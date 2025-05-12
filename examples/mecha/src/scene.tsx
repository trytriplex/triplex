import { Floor, MechPlate } from "./components/floor";
import { Mech } from "./components/mech";
import { Object } from "./components/object";
import { Platform } from "./components/platform";
import { RailingPlatform } from "./components/railing";

export function Scene() {
  return (
    <>
      <group name={"railings"} position={[0, 0, -1.72]}>
        <RailingPlatform position={[-17.7, 0, 0]} />
        <RailingPlatform position={[-5.9, 0, 0]} />
        <RailingPlatform position={[5.86, 0, 0]} />
        <RailingPlatform position={[17.68, 0, 0]} />
      </group>
      <group name={"raised-platform"} position={[1.14, 0, -1.76]}>
        <Platform position={[-10.36, 6.52, -3.14]} variant={"platform"} />
        <Platform position={[8.04, 6.52, -3.14]} variant={"platform"} />
        <Platform position={[14.18, 6.52, -3.14]} variant={"platform"} />
        <Platform position={[1.92, 6.52, -3.14]} variant={"platform"} />
        <Platform position={[-4.2, 6.52, -3.14]} variant={"platform"} />
        <Platform position={[-16.48, 6.52, -3.14]} variant={"platform"} />
        <Object
          position={[-13.06, 6.98, -2.22]}
          rotation={[0.610_865_238_198_015_3, 0, 3.141_592_653_589_793]}
          variant={"object_lights"}
        />
        <Object
          position={[-1.1, 6.98, -2.22]}
          rotation={[0.610_865_238_198_015_3, 0, 3.141_592_653_589_793]}
          variant={"object_lights"}
        />
        <Object
          position={[10.68, 6.98, -2.22]}
          rotation={[0.610_865_238_198_015_3, 0, 3.141_592_653_589_793]}
          variant={"object_lights"}
        />
      </group>
      <MechPlate number={2} />
      <MechPlate position={[-11.72, 0, 0]} />
      <MechPlate number={3} position={[11.82, 0, 0]} />
      <Mech variant={"mech_blue"} />
      <Mech position={[11.8, 0, 0]} variant={"mech_green"} />
      <Mech position={[-11.78, 0, 0]} variant={"mech_red"} />
      <Floor position={[3.94, 0.04, 8.6]} variant={"floor_target_line"} />
      <Floor position={[0, 0, 8.42]} variant={"floor_line"} />

      <Object
        position={[-17.2, 0, 3.58]}
        rotation={[0, -0.750_491_578_357_561_9, 0]}
      />
      <Object
        position={[-18.3, 0, 3.46]}
        rotation={[0, -0.401_425_727_958_696_2, 0]}
      />
      <Object position={[-17.86, 0, 4.48]} rotation={[0, 0, 0]} />
      <Object position={[-2.68, 0, 6.6]} rotation={[0, 0, 0]} />
      <Object
        position={[3, 0, 5.26]}
        rotation={[0, -1.047_197_551_196_597_6, 0]}
        variant={"object_person"}
      />
      <Object
        position={[-3.06, 0, 5.22]}
        rotation={[0, -0.052_359_877_559_829_79, 0]}
        variant={"object_person"}
      />
      <Object
        position={[-3.64, 0, 5.84]}
        rotation={[0, -0.715_584_993_317_675, 0]}
        variant={"object_person"}
      />
      <Platform
        position={[5.64, 0, 4.22]}
        rotation={[0, -0.698_131_700_797_731_9, 0]}
        variant={"platform_lift"}
      />
      <Platform
        position={[3.38, 0, 10.56]}
        rotation={[
          3.141_592_653_589_793, -1.221_730_476_396_031_5,
          3.141_592_653_589_793,
        ]}
        variant={"platform_lift_raised"}
      />
      <group name={"stairs"} position={[0, -0.38, 0.94]}>
        <Platform position={[-4.62, 0, 0]} variant={"platform_stairs"} />
        <Platform position={[-4.62, 3.68, -3.5]} variant={"platform_stairs"} />
      </group>
      <group name={"lights"} visible={true}>
        <ambientLight intensity={0.4} />

        <group name={"back"} visible={false}>
          <pointLight
            castShadow={true}
            intensity={100}
            position={[0.62, 6.78, -3.22]}
          />
          <pointLight
            castShadow={true}
            intensity={100}
            position={[-0.6, 6.78, -3.22]}
            visible={true}
          />
        </group>
        <group name={"right"} visible={false}>
          <pointLight
            castShadow={false}
            intensity={100}
            position={[4.46, 6.82, -0.14]}
          />
          <pointLight
            castShadow={false}
            intensity={100}
            position={[4.46, 6.82, 1.04]}
          />
        </group>
        <group name={"left"} visible={false}>
          <pointLight
            castShadow={true}
            intensity={100}
            position={[-4.36, 6.92, -0.1]}
          />
          <pointLight
            castShadow={true}
            intensity={100}
            position={[-4.36, 6.92, 1.02]}
          />
        </group>
        <group name={"top-far"} visible={false}>
          <pointLight
            castShadow={true}
            intensity={100}
            position={[0.42, 12.06, -10.08]}
          />
          <pointLight
            castShadow={true}
            intensity={100}
            position={[-0.68, 12.06, -10.08]}
          />
        </group>
      </group>
    </>
  );
}
