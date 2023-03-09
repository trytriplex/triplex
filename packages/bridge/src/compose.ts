export function compose(args: (() => void)[]) {
  return () => {
    args.forEach((arg) => arg());
  };
}
