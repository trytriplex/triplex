/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
export function Tuple() {
  return <mesh position={[0, 0.5, 0]} />;
}

export function Number() {
  return <mesh position={0.5} />;
}

function LiteralTypes(_: { value: number | boolean | string }) {
  return null;
}

export function UseLiteralTypes() {
  return <LiteralTypes value="hello" />;
}
