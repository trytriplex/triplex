/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */

import {
  UNSAFE_useXRStore as useSafeAccessXRStore,
  XR,
  type XRStore,
} from "@react-three/xr";
import { useLayoutEffect, type ReactNode } from "react";
import { usePlayState } from "../../stores/use-play-state";

export function WebXRProvider({
  children,
  store,
}: {
  children: ReactNode;
  store: XRStore;
}) {
  const playState = usePlayState();
  const userLandStore = useSafeAccessXRStore();

  useLayoutEffect(() => {
    if (playState === "edit" || !userLandStore) {
      // Nothing to do.
      return;
    }

    store.setState(userLandStore.getInitialState());

    return () => {
      store.setState(store.getInitialState());
    };
  }, [playState, store, userLandStore]);

  return <XR store={store}>{children}</XR>;
}
