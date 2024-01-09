/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */

import { Home } from "./fc";
import { DefaultProps, Provider } from "./type-extraction";

export function UsingComponentsWithDefaultProps() {
  return (
    <>
      <Home seed="" />
      <Provider />
      <DefaultProps />
    </>
  );
}
