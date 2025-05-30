import { trait } from "koota";
import { Object3D } from "three";

export const Position = trait({ x: 0, y: 0, z: 0 });

export const Velocity = trait({ x: 0, y: 0, z: 0 });

export const Mesh = trait(() => new Object3D());

export const Focused = trait();

export const Target = trait();
