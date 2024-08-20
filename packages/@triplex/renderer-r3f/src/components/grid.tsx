/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { Grid } from "triplex-drei";
import { usePlayState } from "../stores/state";
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
