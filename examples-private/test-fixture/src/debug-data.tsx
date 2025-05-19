/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */

import { useEffect } from "react";

export function DebugData() {
  useEffect(() => {
    window.triplex?.api.debug("object", { hello: () => {}, yes: true });
    window.triplex?.api.debug("string", "foobar");
    window.triplex?.api.debug("number", 1234);
    window.triplex?.api.debug("array", [1234]);
    window.triplex?.api.debug("function", () => {});
  }, []);

  return <div>hi mate</div>;
}
