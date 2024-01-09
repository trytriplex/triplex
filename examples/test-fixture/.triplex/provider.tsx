const Provider: React.FC<{
  children: React.ReactNode;
  foofoo?: boolean;
  barbar?: "foo" | "baz";
  batbat?: number;
  bazbaz?: string;
}> = ({
  children,
  foofoo = true,
  barbar = "baz",
  batbat = 100,
  bazbaz = "jelly",
}) => {
  return <>{children}</>;
};

export default Provider;
