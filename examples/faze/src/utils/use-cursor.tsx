/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { useEffect, useState } from "react";

export function useCursor(cursor = "pointer") {
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    if (hovered) {
      document.body.style.cursor = cursor;
      return () => {
        document.body.style.cursor = "auto";
      };
    }
  }, [cursor, hovered]);

  const onPointerOver = () => {
    setHovered(true);
  };

  const onPointerOut = () => {
    setHovered(false);
  };

  return {
    onPointerOut,
    onPointerOver,
  };
}
