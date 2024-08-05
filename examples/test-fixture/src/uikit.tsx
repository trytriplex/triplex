/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { Container, Portal, Root } from "@react-three/uikit";

export function UIKitExample() {
  return (
    <Root>
      <Container>
        <Portal height={200} width={200}>
          <mesh>
            <boxGeometry />
          </mesh>
        </Portal>
      </Container>
    </Root>
  );
}
