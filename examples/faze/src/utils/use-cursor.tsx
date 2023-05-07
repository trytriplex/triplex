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
    onPointerOver,
    onPointerOut,
  };
}
