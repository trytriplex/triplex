export default function Provider({
  children,
  foo = true,
  bar = "baz",
  bat = 100,
  baz = "jelly",
}: {
  children: React.ReactNode;
  foo?: boolean;
  bar?: "foo" | "baz";
  bat?: number;
  baz?: string;
}) {
  return children;
}
