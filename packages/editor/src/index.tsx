import { BrowserRouter } from "react-router-dom";
import { EditorFrame } from "./editor";

export function Editor() {
  return (
    <BrowserRouter>
      <EditorFrame />
    </BrowserRouter>
  );
}
