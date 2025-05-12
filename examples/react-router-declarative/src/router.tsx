import { createContext, use, type ReactNode } from "react";
import { BrowserRouter, StaticRouter } from "react-router";

const IsNested = createContext(false);

/**
 * The Router component renders the declarative router from react-router. When
 * running inside Triplex it runs as a static router provided by the
 * [GlobalProvider](../.triplex/providers.tsx), otherwise when running the app
 * in the browser is uses a standard browser router.
 */
export function Router({
  children,
  location = "/",
  type = "browser",
}: {
  children?: ReactNode;
  location?: string;
  type?: "browser" | "static";
}) {
  const isNestedRouter = use(IsNested);

  if (!isNestedRouter && type === "browser") {
    return (
      <BrowserRouter>
        <IsNested value>{children}</IsNested>
      </BrowserRouter>
    );
  }

  if (!isNestedRouter && type === "static") {
    return (
      <StaticRouter location={location}>
        <IsNested value>{children}</IsNested>
      </StaticRouter>
    );
  }

  return children;
}
