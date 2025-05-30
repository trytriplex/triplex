import { type World } from "koota";

export type ECSSystem = (world: World, delta: number) => void;

export type ECSSystemHook = () => (world: World, delta: number) => void;

export type Vector3 = { x: number; y: number; z: number };
