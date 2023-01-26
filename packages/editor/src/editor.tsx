import { useSearchParams } from "react-router-dom";
import { View, Grid } from "@adobe/react-spectrum";
import { useEffect } from "react";

export function Editor() {
  const [searchParams] = useSearchParams();
  const path = searchParams.get("path") || "";

  useEffect(() => {
    if (path) {
      window.document.title = path.split("/").at(-1) + " • TRIPLEX";
      fetch(`http://localhost:8000/scene/open?path=${path}`, {});
    }
  }, [path]);

  return (
    <Grid areas={["content"]} columns={["auto"]} rows={["auto"]} height="100vh">
      <View
        gridArea="content"
        backgroundColor="static-black"
        position="relative"
      >
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
    </Grid>
  );
}
