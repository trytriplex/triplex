import { MathUtils } from "three";
import { type Vector3 } from "../types";

/** Multiplies all values of a vector by an amount. */
export function multiply(v: Vector3, scalar: number | undefined = 1): Vector3 {
  return {
    x: v.x * scalar,
    y: v.y * scalar,
    z: v.z * scalar,
  };
}

/** Adds two vectors together. */
export function add(v1: Vector3, v2: Vector3): Vector3 {
  return {
    x: v1.x + v2.x,
    y: v1.y + v2.y,
    z: v1.z + v2.z,
  };
}

/** Subtracts one vector from another. */
export function subtract(v1: Vector3, v2: Vector3): Vector3 {
  return {
    x: v1.x - v2.x,
    y: v1.y - v2.y,
    z: v1.z - v2.z,
  };
}

/** Calculates the squared length of a vector. */
export function length(v: Vector3): number {
  return Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z);
}

/** Calculates the distance between two vectors. */
export function distance(v1: Vector3, v2: Vector3): number {
  return length(subtract(v1, v2));
}

/** Normalizes a vector to a length of 1. */
export function normalize(v: Vector3): Vector3 {
  const l = length(v);

  if (l === 0) {
    return { x: 0, y: 0, z: 0 };
  }

  return {
    x: v.x / l,
    y: v.y / l,
    z: v.z / l,
  };
}

/**
 * Damps a vector from towards another vector over time. This is commonly used
 * for frame rate independent updates, meaning the same distances is covered
 * over the same time regardless of a high or low frame rate.
 */
export function damp(
  fromV: Vector3,
  toV: Vector3,
  lambda: number,
  delta: number,
): Vector3 {
  return {
    x: MathUtils.damp(fromV.x, toV.x, lambda, delta),
    y: MathUtils.damp(fromV.y, toV.y, lambda, delta),
    z: MathUtils.damp(fromV.z, toV.z, lambda, delta),
  };
}
