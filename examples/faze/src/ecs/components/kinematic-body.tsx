/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
import { BoundingBox } from "../../systems/bounding-box";
import { Component } from "../store";

export function KinematicBody({ children }: { children: JSX.Element }) {
  return (
    <>
      <Component data={true} name="kinematicBody" />
      <Component name="box">
        <BoundingBox skip>{children}</BoundingBox>
      </Component>
    </>
  );
}
