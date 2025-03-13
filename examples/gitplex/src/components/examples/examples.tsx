/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
import { App } from "../../app";
import { Comment } from "../comment";
import { File } from "../file";

export function CommentWithImage() {
  return (
    <div className="bg-black p-2">
      <Comment
        name="douges"
        src="https://avatars.githubusercontent.com/u/6801309?s=40&v=4"
        text="Why doesn't this converge?"
      >
        <File name="harmonic-convergence.tsx@1-33" />
      </Comment>
    </div>
  );
}

export function CommentWithoutImage() {
  return (
    <div className="bg-black p-2">
      <Comment
        name={"GitPlex Copilot"}
        text={
          "Sure, I can help with that. The issue seems to be with the ordering of the trees and the shader logic used in the render method. The tree models use screen space coordinates but expect world space. Let's fix that."
        }
      >
        <File name="harmonic-convergence.tsx@1-33" />
      </Comment>
    </div>
  );
}

export function FileDefault() {
  return (
    <div className="bg-black p-2">
      <File name="harmonic-convergence.tsx@1-33" />
    </div>
  );
}

export function WholeApp() {
  return <App />;
}
