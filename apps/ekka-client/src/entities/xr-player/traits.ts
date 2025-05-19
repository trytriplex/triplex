import { trait } from "koota";

export const IsXRPlayer = trait();

export const IsPlayer = trait();

export const Health = trait({ value: 100 });

export const IsInvulnerable = trait({ duration: 0, timePassed: 0 });

export const IsDead = trait();

export const Damaged = trait({ value: 0 });
