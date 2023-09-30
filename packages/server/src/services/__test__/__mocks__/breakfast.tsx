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
          -1.5343900294192334, 1.6155004431233018, 0.24966135358083713,
        ]}
        variant={"raspberry"}
      />
      <Berry position={[0, 0, 0]} variant="blueberry" />
    </>
  );
}
