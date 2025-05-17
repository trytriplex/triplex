import { type RootState } from "@react-three/fiber";
import { type XRStore } from "@react-three/xr";
import { type World } from "koota";

export type ECSSystem = (
  world: World,
  delta: number,
  state: RootState,
  store?: XRStore,
) => void;

export type Vector3 = { x: number; y: number; z: number };
