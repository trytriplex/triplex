/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
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
