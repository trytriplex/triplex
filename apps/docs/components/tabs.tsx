/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */

import {
  Children,
  createContext,
  useContext,
  useState,
  type ReactNode,
} from "react";

const TabsContext = createContext(0);
const TabContext = createContext(0);
const TabOnClickContext = createContext((_index: number) => {});

export function Tab({
  children,
}: {
  children: ({
    isSelected,
    onClick,
  }: {
    isSelected: boolean;
    onClick: () => void;
  }) => ReactNode;
}) {
  const onClickHandler = useContext(TabOnClickContext);
  const index = useContext(TabContext);
  const shownIndex = useContext(TabsContext);

  return children({
    isSelected: index === shownIndex,
    onClick: () => onClickHandler(index),
  });
}

export function TabsRoot({ children }: { children: ReactNode }) {
  const [index, setIndex] = useState(0);

  return (
    <TabsContext value={index}>
      <TabOnClickContext value={setIndex}>{children}</TabOnClickContext>
    </TabsContext>
  );
}

export function Tabs({ children }: { children: ReactNode }) {
  return Children.map(children, (child, index) => {
    return <TabContext value={index}>{child}</TabContext>;
  });
}

export function TabsList({ children }: { children: ReactNode }) {
  const shownIndex = useContext(TabsContext);

  return Children.map(children, (child, index) => {
    if (index === shownIndex) {
      return <div className="contents">{child}</div>;
    }

    return <div className="hidden">{child}</div>;
  });
}
