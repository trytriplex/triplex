/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { useEffect } from "react";
import { addDOMTestData } from "./util/add-dom-data";

export function ComponentControlsTest({
  color = "blue",
}: {
  color?: "red" | "green" | "blue";
}) {
  useEffect(() => {
    return addDOMTestData("component-props", { color });
  }, [color]);

  return (
    <mesh>
      <boxGeometry />
      <meshStandardMaterial color={color} />
    </mesh>
  );
}
