import Box from "./box";
import Cylinder from "./cylinder";
import Sphere from "./sphere";

export default function Scene() {
  return (
    <>
      <Box
        position={[1.1942776184295054, 0, 0.12798637867114415]}
        rotation={[
          1.660031347769923, -0.07873115868670048, -0.7211124466452248,
        ]}
      />
      <Cylinder
        position={[0.771635947673377, 0, -1.3176235451310805]}
      ></Cylinder>

      <Sphere
        scale={[0.6302165233139577, 0.6302165233139577, 0.6302165233139577]}
        position={[-1.6195773093872396, 0, 1.1107193822625767]}
      />
    </>
  );
}
