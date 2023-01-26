import { useSearchParams } from "react-router-dom";

export function Editor() {
  const [searchParams] = useSearchParams();
  const path = searchParams.get("path") || "";

  return (
    <iframe
      style={{ border: 0, height: "95vh", width: "100%" }}
      src={`/scene.html?path=${path}`}
    />
  );
}
