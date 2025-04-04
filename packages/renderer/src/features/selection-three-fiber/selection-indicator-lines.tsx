/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */

import { memo, useMemo } from "react";
import { Box3 } from "three";
import { type ResolvedObject3D } from "./resolver";

const Outline = memo(({ objects }: { objects: ResolvedObject3D[] }) => {
  const boundingBox = useMemo(() => {
    const box = new Box3();
    for (const object of objects) {
      const localBox = new Box3().setFromObject(object.object);
      box.union(localBox);
    }
    return box;
  }, [objects]);

  if (objects.length === 0) {
    return null;
  }

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
      <Outline objects={hovered} />
      <Outline objects={selections} />
    </>
  );
}
