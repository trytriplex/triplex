/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
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
