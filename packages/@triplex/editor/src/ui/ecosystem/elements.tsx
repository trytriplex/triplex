/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
import { on, type Actions } from "@triplex/bridge/host";
import { createContext, useContext, useEffect, useState } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { Button, ButtonGroup, ToggleButton } from "./buttons";

const ElementActionContext = createContext<Actions>([]);

export function ElementActionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [actions, setActions] = useState<Actions>([]);

  useEffect(() => {
    return on("set-extension-points", (data) => {
      if (data.area === "elements") {
        setActions(data.controls);
      }
    });
  }, []);

  return (
    <ElementActionContext.Provider value={actions}>
      {children}
    </ElementActionContext.Provider>
  );
}

export function RenderActions({
  column,
  line,
  name,
  parentPath,
}: {
  column: number;
  line: number;
  name: string;
  parentPath: string;
}) {
  const actions = useContext(ElementActionContext);
  const data = { column, line, parentPath };

  return (
    <ErrorBoundary fallbackRender={() => null} resetKeys={[actions]}>
      {actions.map((action) => {
        if (new RegExp(action.filter).test(name) === false) {
          return null;
        }

        switch (action.type) {
          case "button": {
            return (
              <Button
                actionId="scenepanel_element"
                control={action}
                data={data}
                key={action.id}
                scope="element"
                size="sm"
              />
            );
          }

          case "button-group": {
            return (
              <ButtonGroup
                actionId="scenepanel_element"
                control={action}
                data={data}
                key={action.groupId}
                scope="element"
                size="sm"
              />
            );
          }

          case "toggle-button": {
            return (
              <ToggleButton
                actionId="scenepanel_element"
                control={action}
                data={data}
                key={action.groupId}
                scope="element"
                size="sm"
              />
            );
          }
        }
      })}
    </ErrorBoundary>
  );
}
