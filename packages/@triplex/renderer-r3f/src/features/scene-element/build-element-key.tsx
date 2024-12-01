/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
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
