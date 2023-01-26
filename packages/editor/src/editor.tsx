import { useSearchParams } from "react-router-dom";
import { View } from "@adobe/react-spectrum";

export function Editor() {
  const [searchParams] = useSearchParams();
  const path = searchParams.get("path") || "";

  return (
    <View backgroundColor="static-black" position="relative" height="100vh">
      <iframe
        style={{
          border: 0,
          position: "absolute",
          width: "100%",
          height: "100%",
        }}
        src={`/scene.html?path=${path}`}
      />
    </View>
  );
}
