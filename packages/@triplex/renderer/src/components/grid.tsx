/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
import { Grid } from "triplex-drei";
import { usePlayState } from "../stores/use-play-state";
import { editorLayer } from "../util/layers";

export function TriplexGrid() {
  const state = usePlayState();

  return (
    <Grid
      cellColor="#6f6f6f"
      cellSize={1}
      cellThickness={1.0}
      fadeDistance={100}
      fadeStrength={5}
      followCamera
      infiniteGrid
      layers={editorLayer}
      sectionColor="#9d4b4b"
      sectionSize={3}
      side={2}
      visible={state !== "play"}
    />
  );
}
