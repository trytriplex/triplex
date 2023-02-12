import { useCallback, useDeferredValue, useMemo } from "react";
import { useSearchParams } from "react-router-dom";

interface Params {
  props?: Record<string, unknown>;
  path?: string;
}

export function useEditorContext() {
  const [searchParams, setSearchParams] = useSearchParams({ path: "" });
  const path = searchParams.get("path") || "";
  const deferredPath = useDeferredValue(path);
  const stringifiedProps = searchParams.get("props");
  const props = useMemo(
    () =>
      stringifiedProps ? JSON.parse(decodeURIComponent(stringifiedProps)) : {},
    [stringifiedProps]
  );

  const set = useCallback(
    (params: Params) => {
      const newParams: Record<string, string> = {};

      if (params.path) {
        newParams.path = params.path;
      }

      if (params.props) {
        newParams.props = encodeURIComponent(JSON.stringify(params.props));
      }

      setSearchParams(newParams);
    },
    [setSearchParams]
  );

  return {
    path: deferredPath,
    props,
    set,
  };
}
