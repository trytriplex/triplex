import { BrowserRouter } from "react-router-dom";
import { createRoot } from "react-dom/client";
import { EditorFrame } from "./editor";
import { TitleBar } from "./ui/title-bar";
import { cn } from "./ds/cn";
import "./styles.css";

createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <div
      className={cn([
        "fixed inset-0 grid select-none grid-cols-[14rem_auto_18rem] gap-3 bg-neutral-900 pb-3",
        __TRIPLEX_TARGET__ === "electron" ? "grid-rows-[32px_auto]" : "pt-3",
      ])}
    >
      <TitleBar />
      <EditorFrame />
    </div>
  </BrowserRouter>
);
