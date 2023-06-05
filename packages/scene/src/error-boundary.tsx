import { ErrorBoundary } from "react-error-boundary";
import { useSearchParams } from "react-router-dom";

export function SceneErrorBoundary({
  children,
}: {
  children: React.ReactNode;
}) {
  const [searchParams] = useSearchParams();
  const path = searchParams.get("path") || "";
  const exportName = searchParams.get("exportName") || "";

  return (
    <ErrorBoundary resetKeys={[path, exportName]} fallbackRender={() => null}>
      {children}
    </ErrorBoundary>
  );
}
