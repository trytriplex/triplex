import { trait } from "koota";

export const IsEkka = trait();

export const IsEkkaEye = trait();

export const State = trait<{ value: "active" | "idle" }>({
  value: "active",
});

export const DamageModifier = trait({ value: 1 });

export const TimeSinceLastStateChange = trait({
  value: 0,
});
