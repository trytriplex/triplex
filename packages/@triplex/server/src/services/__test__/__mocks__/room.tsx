/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
interface ObjectProps {
  position?: [x: number, y: number, z: number];
  rotation?: [x: number, y: number, z: number];
  scale?: [x: number, y: number, z: number] | number;
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
