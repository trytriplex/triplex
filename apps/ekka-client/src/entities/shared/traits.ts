import { trait } from "koota";
import { Object3D } from "three";

export const Mesh = trait(() => new Object3D());

export const Position = trait({ x: 0, y: 0, z: 0 });

export const Rotation = trait({ x: 0, y: 0, z: 0 });

export const Scale = trait({ x: 1, y: 1, z: 1 });

export const Velocity = trait({ x: 0, y: 0, z: 0 });

export const PositionChanged = trait();
