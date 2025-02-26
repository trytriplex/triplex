/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  forwardRef,
  lazy as reactLazy,
  useState,
  type ComponentType,
} from "react";

export type PreloadableComponent<T extends ComponentType<any>> = T & {
  preload: () => Promise<T>;
};

export function lazy<T extends ComponentType<any>>(
  factory: () => Promise<{ default: T }>,
): PreloadableComponent<T> {
  const ReactLazyComponent = reactLazy(factory);
  let PreloadedComponent: T | undefined;
  let factoryPromise: Promise<T> | undefined;

  const Component = forwardRef(function LazyWithPreload(props, ref) {
    const [InnerComponent] = useState<ComponentType<any>>(
      () => PreloadedComponent ?? ReactLazyComponent,
    );

    return <InnerComponent {...props} {...(ref ? { ref } : {})} />;
  });

  const LazyWithPreload = Component as unknown as PreloadableComponent<T>;

  LazyWithPreload.preload = () => {
    if (!factoryPromise) {
      factoryPromise = factory().then((module) => {
        PreloadedComponent = module.default;
        return PreloadedComponent;
      });
    }

    return factoryPromise;
  };

  return LazyWithPreload;
}
