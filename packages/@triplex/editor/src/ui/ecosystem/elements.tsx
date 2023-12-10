/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { on, send, type Actions } from "@triplex/bridge/host";
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
    return on("set-element-actions", (data) => {
      setActions(data.actions);
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
        if (!name.includes(action.filter)) {
          return null;
        }

        switch (action.type) {
          case "button": {
            return (
              <Button
                control={action}
                key={action.id}
                onClick={(id) => send("element-action-triggered", { data, id })}
                size="sm"
              />
            );
          }

          case "button-group": {
            return (
              <ButtonGroup
                control={action}
                key={action.id}
                onClick={(id) => send("element-action-triggered", { data, id })}
                size="sm"
              />
            );
          }

          case "toggle-button": {
            return (
              <ToggleButton
                control={action}
                key={action.id}
                onClick={(id) =>
                  send("element-action-triggered", { data, id }, true)
                }
                size="sm"
              />
            );
          }
        }
      })}
    </ErrorBoundary>
  );
}
