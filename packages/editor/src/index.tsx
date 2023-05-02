import { BrowserRouter } from "react-router-dom";
import { createRoot } from "react-dom/client";
import { EditorFrame } from "./editor";
import "./styles.css";

createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <EditorFrame />
  </BrowserRouter>
);
