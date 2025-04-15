/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */

import { useFrame } from "@react-three/fiber";
import { memo, useState } from "react";
import { Box3 } from "three";
import { type ResolvedObject3D } from "./resolver";

const Outline = memo(({ objects }: { objects: ResolvedObject3D[] }) => {
  const [boundingBox] = useState(() => new Box3());

  useFrame(() => {
    boundingBox.makeEmpty();

    for (const object of objects) {
      boundingBox.expandByObject(object.object);
    }
  });

  return <box3Helper args={[boundingBox, "rgb(59,130,246)"]} />;
});

Outline.displayName = "Outline";

export function SelectionIndicatorLines({
  hovered,
  selections,
}: {
  hovered: ResolvedObject3D[];
  selections: ResolvedObject3D[];
}) {
  return (
    <>
      {hovered.length > 0 && <Outline objects={hovered} />}
      {selections.length > 0 && <Outline objects={selections} />}
    </>
  );
}
