import { Fragment } from "react";

export function EmptyNull() {
  return null;
}

export function EmptyFragment() {
  return (
    <>
      <mesh
        position={[1.23121231233123, 1.2321231233123, 1.121231213123123]}
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
  return <mesh></mesh>;
}

export const EmptyArrowFunction = () => <></>;

export const ArrowFuncReturnGroup = () => <group />;
