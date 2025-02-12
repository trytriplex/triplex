/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
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
