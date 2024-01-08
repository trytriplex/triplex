/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
export default function Yo() {
  return <Home seed="foo" />;
}

export const Home: React.FC<{ seed: string }> = () => {
  return (
    <>
      <mesh position={[1.6, 0, -1.7]}>
        <boxGeometry />
        <meshStandardMaterial />
      </mesh>
    </>
  );
};
