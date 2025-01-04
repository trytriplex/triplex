/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */

export interface Component {
  exportName: string;
  path: string;
  props: Record<string, unknown>;
}
