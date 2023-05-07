import { Component } from "../store";
import { BoundingBox } from "../../systems/bounding-box";

export function KinematicBody({ children }: { children: JSX.Element }) {
  return (
    <>
      <Component name="kinematicBody" data={true} />
      <Component name="box">
        <BoundingBox skip>{children}</BoundingBox>
      </Component>
    </>
  );
}
