declare const __VARIABLE__: boolean;

export function Scene() {
  if (__VARIABLE__) {
    return <div>it is true!</div>;
  }

  return <div>it is false!</div>;
}
