/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
import { GodRays } from "@paper-design/shaders-react";
import { PerspectiveCamera } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Avatar } from "./components/avatar";
import { Comment } from "./components/comment";
import { File } from "./components/file";
import { InputBox } from "./components/input-box";

export function App() {
  return (
    <>
      <GodRays
        blending={0.24}
        color1={"#685ad6"}
        color2={"#51f5cc"}
        color3={"#d033db"}
        colorBack={"#070118"}
        offsetX={-0.1}
        offsetY={-0.14}
        speed={0.8}
        spotty={10.68}
        style={{
          height: "100%",
          inset: 0,
          position: "fixed",
          width: "100%",
        }}
      />
      <div className="relative mx-auto min-w-[30rem] max-w-lg px-10 py-24">
        <div className="rounded-2xl border border-slate-700 bg-[#13132b]/90">
          <div className="flex gap-1.5 px-3 py-2 opacity-50">
            <div className="h-3 w-3 rounded-full bg-slate-700"></div>
            <div className="h-3 w-3 rounded-full bg-slate-700"></div>
            <div className="h-3 w-3 rounded-full bg-slate-700"></div>
          </div>
          <div className="absolute right-0 top-0 h-44 w-44">
            <Canvas>
              <Avatar />
              <PerspectiveCamera makeDefault position={[0, 0, 2.16]} />
            </Canvas>
          </div>
          <div
            className={
              "flex flex-col gap-3 border-t border-slate-700 px-4 py-2"
            }
          >
            <Comment
              name="douges"
              src="https://avatars.githubusercontent.com/u/6801309?s=40&v=4"
              text="Why doesn't this converge?"
            >
              <File name="harmonic-convergence.tsx@1-33" />
            </Comment>
            <Comment
              name={"GitPlex Copilot"}
              src="https://avatars.githubusercontent.com/u/124734075?s=60&v=4"
              text={"Hello wold I'm typing weeee"}
            />
          </div>
          <div className="px-4 pb-4">
            <InputBox>
              <File name="harmonic-convergence.tsx — Current file" />
            </InputBox>
          </div>
          <div className="flex gap-1.5 border-t border-slate-700 px-3 py-2 opacity-50">
            <div className="h-3 w-3"></div>
          </div>
        </div>
      </div>
    </>
  );
}
