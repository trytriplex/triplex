/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { Container, Fullscreen } from "@react-three/uikit";

export function UIKitExample() {
  return (
    <Fullscreen flexDirection="row" gap={100} padding={100}>
      <Container
        backgroundColor="red"
        backgroundOpacity={0.5}
        flexGrow={1}
        hover={{ backgroundOpacity: 1 }}
      />
    </Fullscreen>
  );
}
