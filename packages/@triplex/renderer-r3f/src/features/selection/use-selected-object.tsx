/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */

import { useEvent } from "@triplex/lib";
import { useState } from "react";
import { SELECTION_LAYER_INDEX } from "../../util/layers";
import { type EditorNodeData } from "../../util/scene";

export function useSelectedObject() {
  const [selectedObject, setObject] = useState<EditorNodeData | null>(null);

  const setSelectedObject = useEvent((object: EditorNodeData | null) => {
    if (selectedObject) {
      selectedObject.sceneObject.traverse((child) =>
        child.layers.disable(SELECTION_LAYER_INDEX),
      );
    }

    setObject(object);

    if (object) {
      object.sceneObject.traverse((child) =>
        child.layers.enable(SELECTION_LAYER_INDEX),
      );
    }
  });

  return [selectedObject, setSelectedObject] as const;
}
