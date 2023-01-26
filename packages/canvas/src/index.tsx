import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { CanvasEditMode } from "./edit-mode";
import { SceneLoader } from "./loader";

createRoot(document.getElementById("root") as HTMLElement).render(
  <StrictMode>
    <BrowserRouter>
      <CanvasEditMode>
        <SceneLoader />
      </CanvasEditMode>
    </BrowserRouter>
  </StrictMode>
);
