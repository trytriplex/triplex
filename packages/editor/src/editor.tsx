import { listen, send } from "@triplex/bridge/host";
import { useSearchParams } from "react-router-dom";
import { View, Grid } from "@adobe/react-spectrum";
import { useEffect, useRef, useState } from "react";

export function Editor() {
  const [searchParams, setSearchParams] = useSearchParams({ path: "" });
  const path = searchParams.get("path");
  const props = searchParams.get("props");
  const iframe = useRef<HTMLIFrameElement>(null!);

  useEffect(() => {
    if (path) {
      window.document.title = path.split("/").at(-1) + " • TRIPLEX";
      fetch(`http://localhost:8000/scene/open?path=${path}`, {});
    }
  }, [path]);

  useEffect(() => {
    return listen("trplx:navigate", (data) => {
      setSearchParams({
        path: data.path,
        props: encodeURIComponent(JSON.stringify(data.props)),
      });
    });
  }, []);

  useEffect(() => {
    if (path) {
      send(iframe.current, "trplx:navigate", { searchParams: { path, props } });
    }
  }, [path, props]);

  return (
    <Grid areas={["content"]} columns={["auto"]} rows={["auto"]} height="100vh">
      <View
        gridArea="content"
        backgroundColor="static-black"
        position="relative"
      >
        <iframe
          src={`/scene.html`}
          ref={iframe}
          style={{
            border: 0,
            position: "absolute",
            width: "100%",
            height: "100%",
          }}
        />
      </View>
    </Grid>
  );
}
