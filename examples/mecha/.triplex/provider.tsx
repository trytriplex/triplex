export default function Provider({ children }: { children?: React.ReactNode }) {
  return (
    <>
      <color args={["#3f4859"]} attach="background" />
      {children}
    </>
  );
}
