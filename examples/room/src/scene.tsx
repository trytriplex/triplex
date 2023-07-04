/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { Sphere } from "./components/sphere";
import { Light } from "./components/light";
import {
  Seat,
  WallpaperAndLights,
  FloorPlanks,
  Lamps,
  CollectionOfCans,
  TableBox,
  SeatMats,
  Table,
  BackWall,
  Wall,
  Floor,
} from "./components/room";
import { SoftShadows, Sky } from "@react-three/drei";

export function Room() {
  return (
    <>
      <SoftShadows samples={16} size={undefined} />
      <Sky inclination={0.52} />

      <Floor position={[0, 0.9197456200141876, 0]} />

      <Wall position={[-6.601040957040237, 5.340027659688785, 0]} />

      <Wall
        scale={[-1, 1, 1]}
        position={[6.794563016511148, 5.341597526161233, 0]}
      />

      <BackWall position={[0, 5.373038841701562, -5.8977116179888345]} />

      <Light />

      <ambientLight intensity={0.4} />

      <Table
        position={[0.3776542351716331, 1.9337453168442043, -0.8684501762730286]}
      />

      <SeatMats
        position={[0.3312534583635297, 1.6513814010488033, -0.5724636304669097]}
      />

      <TableBox
        position={[
          0.40380776544596353, 2.7579603988524712, -0.8629871620655027,
        ]}
      />

      <CollectionOfCans
        position={[0.3327560274034522, 2.9851818896570927, -0.9068275261053336]}
      />

      <Lamps position={[0, 2.370600692653582, -0.7970636205394404]} />

      <FloorPlanks position={[0, 1.2424206964695401, 0]} />

      <WallpaperAndLights
        position={[0, 5.416529827741108, -3.1595838529380442]}
      />

      <Seat
        position={[
          -2.4059812914398093, 2.5360328283639326, -0.8726110046607222,
        ]}
      />

      <Seat
        position={[0.32878971568198057, 2.4357472414788752, 2.1066219523407232]}
        rotation={[-3.1415926535897927, 1.563143060010577, 3.141592653589793]}
      />

      <Sphere
        position={[-1.3455905956608063, 1.4915180019145353, -8.116668133155024]}
        speed={3}
      />

      <Sphere
        position={[2.882027173731192, 2.251990123907609, -13.340406808224275]}
        speed={1}
      />
      <Sphere
        position={[3.032222532462284, 0.22587518019089914, -10.816753601686415]}
        speed={3}
      />

      <Seat
        position={[3.0680714646480087, 2.4673855354929586, -0.9873375195629082]}
        rotation={[-3.141592653589793, 0.0566176595316571, -3.141592653589793]}
      />

      <Seat
        position={[0.2638413630154228, 2.4356649559057097, -3.27932483580052]}
        rotation={[0, -1.5579011304445005, 0]}
      />
    </>
  );
}
