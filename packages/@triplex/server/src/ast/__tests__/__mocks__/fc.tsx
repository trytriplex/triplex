/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
// eslint-disable-next-line react/display-name
export default () => {
  return <Home seed="foo" />;
};

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
