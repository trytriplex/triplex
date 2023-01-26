import { useSearchParams } from "react-router-dom";
import { View, Grid } from "@adobe/react-spectrum";

export function Editor() {
  const [searchParams] = useSearchParams();
  const path = searchParams.get("path") || "";

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
