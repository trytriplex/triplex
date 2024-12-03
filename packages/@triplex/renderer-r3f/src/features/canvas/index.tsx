/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { Canvas as RCanvas } from "@react-three/fiber";
import { send } from "@triplex/bridge/client";
import { useEvent } from "@triplex/lib";
import { usePlayState } from "../../stores/use-play-state";
import { defaultLayer, editorLayer } from "../../util/layers";

// Inspired from from Three.js
// See: https://github.com/mrdoob/three.js/blob/34ba5129de62d538c17616f50cd00e36fdb98398/src/renderers/webgl/WebGLProgram.js#L14
function resolveLineThatErrored(string: string | null, errorLine: number) {
  if (string === null) {
    return "";
  }

  const lines = string.split("\n");
  const line = lines[errorLine - 1];

  return line;
}

// Inspired from Three.js
// See: https://github.com/mrdoob/three.js/blob/34ba5129de62d538c17616f50cd00e36fdb98398/src/renderers/webgl/WebGLProgram.js#L57
function getShaderErrors(gl: WebGLRenderingContext, shader: WebGLShader) {
  const errors = gl.getShaderInfoLog(shader)?.trim().replaceAll("\n", "");
  if (!errors) {
    return "";
  }

  const errorMatches = /ERROR: 0:(\d+)/.exec(errors);
  if (errorMatches) {
    const errorLine = Number.parseInt(errorMatches[1]);
    const content = resolveLineThatErrored(
      gl.getShaderSource(shader),
      errorLine,
    );
    return `"${errors}" from line "${content}"`;
  } else {
    return errors;
  }
}

export function Canvas({ children }: { children: React.ReactNode }) {
  const playState = usePlayState();
  const onShaderError = useEvent(
    (
      gl: WebGLRenderingContext,
      program: WebGLProgram,
      glVertexShader: WebGLShader,
      glFragmentShader: WebGLShader,
    ) => {
      const vertexErrors = getShaderErrors(gl, glVertexShader);
      const fragmentErrors = getShaderErrors(gl, glFragmentShader);

      let errorMessage;

      if (vertexErrors && fragmentErrors) {
        errorMessage = `Vertex and fragment shaders failed to compile. The vertex shader errored with ${vertexErrors} and the fragment shader errored with ${fragmentErrors}.`;
      } else if (vertexErrors) {
        errorMessage = `A vertex shader failed to compile because of the error ${vertexErrors}.`;
      } else if (fragmentErrors) {
        errorMessage = `A fragment shader failed to compile because of the error ${fragmentErrors}.`;
      } else {
        const programLog = gl
          .getProgramInfoLog(program)
          ?.trim()
          .replaceAll("\n", "");
        errorMessage = `A shader failed to compile because of the error "${programLog}".`;
      }

      send("error", {
        message: errorMessage,
        subtitle: "",
        title: "GLSL Error",
      });
    },
  );

  return (
    <RCanvas
      gl={{
        debug: {
          checkShaderErrors: true,
          onShaderError,
        },
        ...(typeof window.triplex.renderer.attributes.gl === "object"
          ? window.triplex.renderer.attributes.gl
          : undefined),
        antialias: true,
      }}
      raycaster={{
        layers:
          playState === "play"
            ? defaultLayer
            : // This forces the default r3f raycaster to be fired on a different layer (31)
              // than the default layer (0) that object3d's are set to default.
              editorLayer,
      }}
      shadows
      style={{ inset: 0, position: "absolute" }}
    >
      {children}
    </RCanvas>
  );
}
