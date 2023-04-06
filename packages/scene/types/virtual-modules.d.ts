declare module "triplex:components" {
  export const components: Record<
    string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    () => Promise<Record<string, (props: any) => any>>
  >;
}
