/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */

function Berry(_: { position?: [number, number, number]; variant: string }) {
  return null;
}

export function Scene() {
  return (
    <>
      <Berry position={[0, 0, 0]} variant="blueberry" />
      <Berry
        position={[
          -1.534_390_029_419_233_4, 1.615_500_443_123_301_8, 0.249_661_353_580_837_13,
        ]}
        variant={"raspberry"}
      />
      <Berry position={[0, 0, 0]} variant="blueberry" />
    </>
  );
}
