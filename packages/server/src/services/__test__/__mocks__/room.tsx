/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
interface ObjectProps {
  position?: [x: number, y: number, z: number];
  scale?: [x: number, y: number, z: number] | number;
  rotation?: [x: number, y: number, z: number];
}

export function Wall(_: ObjectProps) {
  return null;
}

export function Floor(_: ObjectProps) {
  return null;
}

export function BackWall(_: ObjectProps) {
  return null;
}

export function Table(_: ObjectProps) {
  return null;
}

export function CollectionOfCans(_: ObjectProps) {
  return null;
}

export function TableBox(_: ObjectProps) {
  return null;
}

export function WallpaperAndLights(_: ObjectProps) {
  return null;
}

export function Lamps(_: ObjectProps) {
  return null;
}

export function FloorPlanks(_: ObjectProps) {
  return null;
}

export function Seat(_: ObjectProps) {
  return null;
}

export function SeatMats(_: ObjectProps) {
  return null;
}
