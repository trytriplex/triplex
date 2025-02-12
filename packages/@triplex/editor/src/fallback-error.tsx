/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
import { createRoot } from "react-dom/client";
import "./styles.css";
import { StrictMode } from "react";
import { ErrorSplash } from "./ui/error-splash";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ErrorSplash />
  </StrictMode>,
);
