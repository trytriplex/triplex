/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { Gltf } from "@react-three/drei";

export const RequiredProps = ({
  defaultBoolean: _ = true,
  defaultColor: __ = "red",
  defaultNumber: ___ = 1,
  defaultString: ____ = "foo",
  defaultStringLiteral: _____ = "bar",
  defaultTuple: ______ = [1, 2, 3],
  defaultUnion: _______ = 333,
}: {
  defaultBoolean?: boolean;
  defaultColor?: string;
  defaultNumber?: number;
  defaultString?: string;
  defaultStringLiteral?: "foo" | "bar";
  defaultTuple?: [number, number, number];
  defaultUnion?: number | boolean | string;
  optionalBoolean?: boolean;
  optionalColor?: string;
  optionalNumber?: number;
  optionalString?: string;
  optionalStringLiteral?: "foo" | "bar";
  optionalTuple?: [number, number, number];
  optionalUnion?: number | string | boolean;
  requiredBoolean: boolean;
  requiredColor: string;
  requiredNumber: number;
  requiredString: string;
  requiredStringLiteral: "foo" | "bar";
  requiredTuple: [number, number, number];
  requiredUnion: number | string | boolean;
}) => {
  return (
    <>
      <Gltf src="assets/pmndrs.glb">
        <meshStandardMaterial />
      </Gltf>
    </>
  );
};

export const RequiredUsage = () => <RequiredProps />;
