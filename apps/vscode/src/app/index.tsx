/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { Suspense } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";
import { App } from "./components/app";

createRoot(document.getElementById("root")!).render(
  <Suspense>
    <App />
  </Suspense>
);
