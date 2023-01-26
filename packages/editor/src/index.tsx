import { darkTheme, Provider } from "@adobe/react-spectrum";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Editor } from "./editor";

createRoot(document.getElementById("root") as HTMLElement).render(
  <StrictMode>
    <Provider theme={darkTheme}>
      <BrowserRouter>
        <Editor />
      </BrowserRouter>
    </Provider>
  </StrictMode>
);
