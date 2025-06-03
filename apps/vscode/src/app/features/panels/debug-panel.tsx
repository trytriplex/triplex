/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */

import { on } from "@triplex/bridge/host";
import { useEffect, useState } from "react";
import * as Accordion from "../../components/accordion";
import { ScrollContainer } from "../../components/scroll-container";

function Data({
  channel,
  data,
}: {
  channel: string;
  data: string | number | object;
}) {
  return (
    <Accordion.Root defaultExpanded>
      <Accordion.Trigger actionId="scenepanel_debug_data_toggle">
        {channel}
      </Accordion.Trigger>
      <Accordion.Content>{JSON.stringify(data, null, 2)}</Accordion.Content>
    </Accordion.Root>
  );
}

export function DebugPanel() {
  const [panels, setPanels] = useState<
    {
      channel: string;
      data: string | number | object;
    }[]
  >([]);

  useEffect(() => {
    return on("api-debug", (data) => {
      setPanels((prev) => {
        const index = prev.findIndex((panel) => panel.channel === data.channel);

        if (index !== -1) {
          const newPanels = [...prev];
          newPanels[index] = data;
          return newPanels;
        }

        return [...prev, data];
      });
    });
  }, []);

  return (
    <ScrollContainer
      className="border-overlay max-h-[33%] flex-shrink-0 border-t"
      overflowIndicators="top"
    >
      <div className="px-1.5">
        <Accordion.Root defaultExpanded={false}>
          <Accordion.Trigger actionId="scenepanel_debug_toggle">
            {({ isExpanded }) =>
              isExpanded ? "Debug" : `Debug (${panels.length})`
            }
          </Accordion.Trigger>
          <Accordion.Content className=" ">
            <div className="-mb-1.5" />
            {panels.map((panel) => (
              <Data
                channel={panel.channel}
                data={panel.data}
                key={panel.channel}
              />
            ))}
            {panels.length === 0 && (
              <div className="p-1 pb-2">
                Data logged through the debug API will appear here.{" "}
                <a
                  className="text-link underline"
                  href="https://triplex.dev/docs/building-your-scene/console-logs/debug-panel"
                >
                  Learn how to use this feature.
                </a>
              </div>
            )}
          </Accordion.Content>
        </Accordion.Root>
      </div>
    </ScrollContainer>
  );
}
