import { trait } from "koota";

export const Ekka = trait();

export const EkkaEye = trait();

export const State = trait<{ value: "active" | "idle" }>({ value: "active" });

export const TimeSinceLastStateChange = trait({
  value: 0,
});
