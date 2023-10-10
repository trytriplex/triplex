/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { BoundingBox } from "../../systems/bounding-box";
import { Component } from "../store";

export function RigidBody({
  children,
  skip,
}: {
  children: JSX.Element;
  skip?: boolean;
}) {
  return (
    <>
      <Component data={true} name="rigidBody" />
      <Component name="box">
        <BoundingBox skip={skip}>{children}</BoundingBox>
      </Component>
    </>
  );
}
