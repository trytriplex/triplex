/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { Fragment } from "react";

export function EmptyNull() {
  return null;
}

export function EmptyFragment() {
  return (
    <>
      <mesh
        position={[1.231_212_312_331_23, 1.232_123_123_312_3, 1.121_231_213_123_123]}
      ></mesh>
    </>
  );
}

export function FragmentFragment() {
  return <Fragment></Fragment>;
}

export function EmptyGroup() {
  return <group></group>;
}

export function EmptyMesh() {
  return (<mesh></mesh>);
}

export const EmptyArrowFunction = () => <></>;

export const ArrowFuncReturnGroup = () => <group></group>;
