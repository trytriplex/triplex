/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
import { hash } from "../../util/hash";

export function buildElementKey(
  name: unknown,
  props: Record<string, unknown>,
): string | undefined {
  if (
    (typeof name === "string" && name === "shaderMaterial") ||
    name === "rawShaderMaterial"
  ) {
    return hash(String(props.fragmentShader) + String(props.vertexShader));
  }

  return undefined;
}
