/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { useEffect } from "react";

export function ComponentControlsTest({
  color = "blue",
}: {
  color?: "red" | "green" | "blue";
}) {
  useEffect(() => {
    const element = document.createElement("div");
    element.setAttribute("data-testid", "component-props");
    element.textContent = JSON.stringify({
      color,
    });
    element.style.display = "none";
    document.body.append(element);

    return () => {
      element.remove();
    };
  }, [color]);

  return (
    <mesh>
      <boxGeometry />
      <meshStandardMaterial color={color} />
    </mesh>
  );
}
