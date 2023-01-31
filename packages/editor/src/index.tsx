import { darkTheme, Provider } from "@adobe/react-spectrum";
import { BrowserRouter } from "react-router-dom";
import { EditorFrame } from "./editor";

export function Editor() {
  return (
    <Provider theme={darkTheme}>
      <BrowserRouter>
        <EditorFrame />
      </BrowserRouter>
    </Provider>
  );
}
