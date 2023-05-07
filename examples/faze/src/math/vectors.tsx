import { MathUtils, Vector3Tuple } from "three";

export interface VectorXyz {
  x: number;
  y: number;
  z: number;
}

/**
 * Converts a Vector3Tuple to a VectorXyz
 */
export function fromArray(t: Vector3Tuple): VectorXyz {
  return {
    x: t[0],
    y: t[1],
    z: t[2],
  };
}

/**
 * Returns `true` when `v1` has values above `0`.
 */
export function hasValues(v1: VectorXyz): boolean {
  return v1.x !== 0 || v1.y !== 0 || v1.z !== 0;
}

/**
 * Returns `true` when `v1` has values above `0`.
 */
export function hasValues2(v1: VectorXyz): boolean {
  return v1.x !== 0 || v1.z !== 0;
}

/**
 * Copies the values of v2 into v1.
 */
export function copy<TVector extends VectorXyz>(v1: TVector, v2: VectorXyz) {
  v1.x = v2.x;
  v1.y = v2.y;
  v1.z = v2.z;

  return v1;
}

/**
 * Copies the `x` and `z` values of v2 into v1.
 */
export function copy2<TVector extends VectorXyz>(v1: TVector, v2: VectorXyz) {
  v1.x = v2.x;
  v1.z = v2.z;

  return v1;
}

/**
 * Adds v2 into v1.
 */
export function add<TVector extends VectorXyz>(
  v1: TVector,
  v2: VectorXyz
): TVector {
  v1.x += v2.x;
  v1.y += v2.y;
  v1.z += v2.z;

  return v1;
}

/**
 * Adds `x` and `z` from v2 into v1.
 */
export function add2<TVector extends VectorXyz>(
  v1: TVector,
  v2: VectorXyz
): TVector {
  v1.x += v2.x;
  v1.z += v2.z;

  return v1;
}

/**
 * Removes v2 from v1.
 */
export function sub<TVector extends VectorXyz>(
  v1: TVector,
  v2: VectorXyz
): TVector {
  v1.x -= v2.x;
  v1.y -= v2.y;
  v1.z -= v2.z;

  return v1;
}

/**
 * Removes `x` and `z` values of `v2` from `v1`.
 */
export function sub2<TVector extends VectorXyz>(
  v1: TVector,
  v2: VectorXyz
): TVector {
  v1.x -= v2.x;
  v1.z -= v2.z;
  return v1;
}

/**
 * Returns `true` if all values of v1 are `0`.
 */
export function isEmpty(v1: VectorXyz): boolean {
  return v1.x === 0 && v1.y === 0 && v1.z === 0;
}

/**
 * Returns `true` if `x` and `z` of v1 are `0`.
 */
export function isEmpty2(v1: VectorXyz): boolean {
  return v1.x === 0 && v1.z === 0;
}

/**
 * Sets all values of the vector to zero.
 */
export function reset<TVector extends VectorXyz>(v1: TVector) {
  v1.x = 0;
  v1.y = 0;
  v1.z = 0;
  return v1;
}

/**
 * Sets `x` and `z` values of the vector to zero.
 */
export function reset2<TVector extends VectorXyz>(v1: TVector) {
  v1.x = 0;
  v1.z = 0;
  return v1;
}

/**
 * Distance between v1 and v2 squared.
 */
export function distanceToSquared2(v1: VectorXyz, v2: VectorXyz): number {
  const dx = v1.x - v2.x;
  const dz = v1.z - v2.z;

  return dx * dx + dz * dz;
}

/**
 * Distance between v1 and v2 squared.
 */
export function distanceToSquared(v1: VectorXyz, v2: VectorXyz): number {
  const dx = v1.x - v2.x;
  const dy = v1.y - v2.y;
  const dz = v1.z - v2.z;

  return dx * dx + dy * dy + dz * dz;
}

/**
 * Returns `true` if v1 and v2 are equal vector3's.
 */
export function equal(v1: VectorXyz, v2: VectorXyz) {
  return v1.x === v2.x && v1.y === v2.y && v1.z === v2.z;
}

/**
 * Returns `true` if v1 and v2 are equal vector2's.
 */
export function equal2(v1: VectorXyz, v2: VectorXyz) {
  return v1.x === v2.x && v1.z === v2.z;
}

/**
 * Moves `current` towards `target` linearly capped by `delta`.
 */
export function moveTowards(current: number, target: number, delta: number) {
  if (Math.abs(target - current) <= delta) {
    return target;
  }

  return current + Math.sign(target - current) * delta;
}

/**
 * Moves `v1` towards `v2` linearly capped by `delta`.
 */
export function moveTowards3<TVector extends VectorXyz>(
  v1: TVector,
  v2: TVector,
  delta: number
): TVector {
  v1.x = moveTowards(v1.x, v2.x, delta);
  v1.y = moveTowards(v1.y, v2.y, delta);
  v1.z = moveTowards(v1.z, v2.z, delta);

  return v1;
}

/**
 * Returns an empty v3.
 */
export function empty(): VectorXyz {
  return {
    x: 0,
    y: 0,
    z: 0,
  };
}

export function damp<TVector extends VectorXyz>(
  fromV: TVector,
  toV: VectorXyz,
  lambda: number,
  delta: number
): TVector {
  fromV.x = MathUtils.damp(fromV.x, toV.x, lambda, delta);
  fromV.y = MathUtils.damp(fromV.y, toV.y, lambda, delta);
  fromV.z = MathUtils.damp(fromV.z, toV.z, lambda, delta);

  return fromV;
}
