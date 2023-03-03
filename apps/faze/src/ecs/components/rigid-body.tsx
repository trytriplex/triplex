import { Component } from "../store";
import { BoundingBox } from "../../systems/bounding-box";

export function RigidBody({
  children,
  skip,
}: {
  children: JSX.Element;
  skip?: boolean;
}) {
  return (
    <>
      <Component name="rigidBody" data={true} />
      <Component name="box">
        <BoundingBox skip={skip}>{children}</BoundingBox>
      </Component>
    </>
  );
}
