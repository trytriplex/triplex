/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
import { Vector2, Vector3 } from "three";

type Vector4Tuple = readonly [number, number, number, number];

const V1 = new Vector2();
const V2 = new Vector2();
const V3 = new Vector3();
const V4 = new Vector3();

function gerstnerWave(wave: Vector4Tuple, time: number, position: Vector3) {
  const steepness = wave[2];
  const wavelength = wave[3];

  const k = (2.0 * Math.PI) / wavelength;
  const c = Math.sqrt(9.8 / k);

  const d = V2.set(wave[0], wave[1]).normalize();

  const f = k * (d.dot(V1.set(position.x, position.z)) - c * time);
  const a = steepness / k;

  const waveResult = V3.set(
    d.x * (a * Math.cos(f)),
    a * Math.sin(f),
    d.y * (a * Math.cos(f)),
  );

  return waveResult;
}

export function wave(direction: number, steepness: number, wavelength: number) {
  return [
    Math.sin((direction * Math.PI) / 180),
    Math.cos((direction * Math.PI) / 180),
    steepness,
    wavelength,
  ] as const;
}

export function defaultWaves(wavelength = 1) {
  return [
    wave(0, 0.3, 0.15 * wavelength),
    wave(30, 0.25, 0.07 * wavelength),
    wave(90, 0.125, 0.03 * wavelength),
  ] as const;
}

export function displace(position: Vector3, time: number, wavelength: number) {
  const [waveA, waveB, waveC] = defaultWaves(wavelength);

  const newPosition = V4.copy(position);
  newPosition.add(gerstnerWave(waveA, time, newPosition));
  newPosition.add(gerstnerWave(waveB, time, newPosition));
  newPosition.add(gerstnerWave(waveC, time, newPosition));

  return newPosition;
}
