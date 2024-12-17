/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { Button } from "./react-roots";
import { Plane } from "./scene";

export function ThreeFiberRootFromAnotherModule() {
  return <Plane />;
}

export function ReactRoot() {
  return <div data-testid="react-root">Hello World</div>;
}

export function ReactRootFromAnotherModule() {
  return <Button />;
}

export function Unknown() {
  return null;
}
