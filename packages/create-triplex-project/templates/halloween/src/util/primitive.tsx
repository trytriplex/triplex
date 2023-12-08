import { type Node } from "@react-three/fiber";

export function Primitive<T extends object>({
  object,
  ...props
}: { object: T } & Node<T, unknown>) {
  return <primitive object={object} {...props} />;
}
