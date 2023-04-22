import Scene from "./add-prop";

export function Reuse() {
  return (
    <>
      <Scene />
    </>
  );
}

export const NamedExport = () => {
  return (
    <>
      <Reuse></Reuse>
    </>
  );
};
