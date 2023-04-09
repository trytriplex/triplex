export function unique<TValue>(v: TValue, i: number, a: TValue[]) {
  return a.findIndex((v2) => JSON.stringify(v2) === JSON.stringify(v)) === i;
}
