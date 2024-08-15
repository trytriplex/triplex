import { useEffect } from "react";

const Provider: React.FC<{
  children: React.ReactNode;
  foofoo?: boolean;
  barbar?: "foo" | "baz";
  batbat?: number;
  bazbaz?: string;
  bgColor?: string;
}> = ({
  children,
  bgColor = "#ccc",
  foofoo = true,
  barbar = "baz",
  batbat = 100,
  bazbaz = "jelly",
}) => {
  useEffect(() => {
    const element = document.createElement("div");
    element.setAttribute("data-testid", "provider-props");
    element.textContent = JSON.stringify({
      bgColor,
      foofoo,
      barbar,
      batbat,
      bazbaz,
    });
    element.style.display = "none";
    document.body.appendChild(element);

    return () => {
      element.remove();
    };
  }, [bgColor, foofoo, barbar, batbat, bazbaz]);

  return (
    <>
      {bgColor && <color args={[bgColor]} attach="background" />}
      {children}
    </>
  );
};

export default Provider;
