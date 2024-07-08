/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import {
  Cross2Icon,
  CubeIcon,
  DashboardIcon,
  PlusIcon,
} from "@radix-ui/react-icons";
import { useEvent } from "@triplex/lib";
import { useTelemetry } from "@triplex/ux";
import { useLazySubscription } from "@triplex/ws/react";
import { useEffect, useRef } from "react";
import { IconButton } from "../ds/button";
import { cn } from "../ds/cn";
import { Pressable } from "../ds/pressable";
import { useEditor } from "../stores/editor";
import { useOverlayStore } from "../stores/overlay";
import { useScene } from "../stores/scene";

function FallbackTab({
  exportName,
  filePath,
  index,
  onClick,
}: {
  exportName: string;
  filePath: string;
  index: number;
  onClick: (fileName: string, exportName: string) => void;
}) {
  const onClickHandler = useEvent(() => {
    onClick(filePath, exportName);
  });

  useEffect(() => {
    const cleanup: (() => void)[] = [];

    for (let i = index; i <= 8; i++) {
      cleanup.push(
        window.triplex.accelerator(`CommandOrCtrl+${i + 1}`, onClickHandler),
      );
    }

    return () => {
      cleanup.forEach((clean) => clean());
    };
  }, [index, onClickHandler]);

  return null;
}

function FileTab({
  children,
  exportName,
  filePath,
  index,
  isActive,
  isDirty,
  isNew,
  onClick,
  onClose,
}: {
  children: string;
  exportName: string;
  filePath: string;
  index: number;
  isActive?: boolean;
  isDirty?: boolean;
  isNew?: boolean;
  onClick: (fileName: string, exportName: string) => void;
  onClose: (fileName: string, exportName: string, index: number) => void;
}) {
  const onClickHandler = useEvent(() => {
    onClick(filePath, exportName);
  });

  const onCloseHandler = useEvent(() => {
    if (
      import.meta.env.VITE_TRIPLEX_ENV !== "test" &&
      isDirty &&
      !confirm(
        `Closing this tab will throw away changes you have made to ${children}, continue?`,
      )
    ) {
      return;
    }

    onClose(filePath, exportName, index);
  });

  useEffect(() => {
    if (!isActive) {
      return;
    }

    return window.triplex.accelerator("CommandOrCtrl+W", onCloseHandler);
  }, [onCloseHandler, isActive]);

  useEffect(() => {
    if (index > 8) {
      return;
    }

    return window.triplex.accelerator(
      `CommandOrCtrl+${index + 1}`,
      onClickHandler,
    );
  }, [index, onClickHandler]);

  return (
    <Pressable
      className={cn([
        "group relative flex h-full items-center gap-3 whitespace-nowrap border-t-2 px-4 text-sm",
        isActive
          ? "border-blue-400 bg-white/5 text-blue-400"
          : "border-transparent text-neutral-400 hover:bg-white/5 active:bg-white/10",
      ])}
      focusRing="inset"
      onPress={isActive ? undefined : onClickHandler}
      pressActionId="tabbar_file_switch"
      testId={isActive ? "active-tab" : "tab"}
      title={[
        children,
        exportName,
        isDirty ? "Unsaved Changes" : "",
        isActive ? "Active Tab" : "",
      ]
        .filter(Boolean)
        .join(" • ")}
    >
      <span className={isNew ? "italic" : undefined}>{children}</span>
      <IconButton
        actionId="tabbar_file_close"
        className={cn([
          "peer absolute right-2 z-10 opacity-0 focus:opacity-100",
          isDirty ? "hover:opacity-100" : "group-hover:opacity-100",
        ])}
        color="inherit"
        icon={Cross2Icon}
        label={`Close ${children}`}
        onClick={onCloseHandler}
        size="sm"
      />
      <span
        aria-label={isDirty ? "Unsaved Changes" : undefined}
        className={cn([
          "h-2 w-2 flex-shrink-0 rounded-full peer-hover:opacity-0 peer-focus:opacity-0",
          isActive ? "" : "opacity-75",
          isDirty ? "bg-yellow-400" : "bg-white/5",
        ])}
      />
    </Pressable>
  );
}

export function FileTabs() {
  const projectState = useLazySubscription("/project/state");
  const showOverlay = useOverlayStore((store) => store.show);
  const { close, exportName, newFile, path, set } = useEditor();
  const lastActiveTab = useRef<
    { exportName: string; filePath: string } | undefined
  >(undefined);
  const previouslyClosedTabs = useRef<
    { exportName: string; filePath: string; index: number }[]
  >([]);
  const lastAvailableTab = projectState.at(-1);
  const playState = useScene((store) => store.playState);
  const telemetry = useTelemetry();

  const openLastTab = useEvent(() => {
    const closedTab = previouslyClosedTabs.current.pop();
    if (closedTab) {
      set({
        encodedProps: "",
        exportName: closedTab.exportName,
        index: closedTab.index,
        path: closedTab.filePath,
      });
      telemetry.event("tabbar_file_reopen");
    }
  });

  useEffect(() => {
    return window.triplex.accelerator("CommandOrCtrl+Shift+T", openLastTab);
  }, [openLastTab]);

  const onClickHandler = useEvent(
    (nextFilePath: string, nextExportName: string) => {
      lastActiveTab.current = { exportName, filePath: path };

      set({
        encodedProps: "",
        exportName: nextExportName,
        path: nextFilePath,
      });
      telemetry.event("tabbar_file_switch");
    },
  );

  const onCloseHandler = useEvent(
    (filePath: string, exportName: string, index: number) => {
      if (path === filePath) {
        // We are active so we need to transition away to another tab first.
        if (lastActiveTab.current) {
          // There was a previous active tab, let's transition to it!
          set({
            encodedProps: "",
            exportName: lastActiveTab.current.exportName,
            path: lastActiveTab.current.filePath,
          });
          lastActiveTab.current = undefined;
        } else {
          // Find the first available tab that isn't this one.
          const nextTab = projectState.find((file) => file.filePath !== path);
          if (nextTab) {
            // Sweet we found one, switch to it!
            set({
              encodedProps: "",
              exportName: nextTab.exportName,
              path: nextTab.filePath,
            });
          } else {
            // No other tabs were found, switch to empty!
            set({
              encodedProps: "",
              exportName: "",
              path: "",
            });
          }
        }
      }

      close(filePath);
      telemetry.event("tabbar_file_close");

      previouslyClosedTabs.current.push({ exportName, filePath, index });
    },
  );

  return (
    <nav
      aria-label="File Tabs"
      className="col-span-full row-start-2 flex h-9 items-center gap-1 overflow-hidden bg-neutral-900 px-1.5"
    >
      <IconButton
        actionId="tabbar_project_components"
        icon={DashboardIcon}
        isDisabled={playState === "play"}
        label="Open Component..."
        onClick={() => showOverlay("open-scene")}
      />

      {import.meta.env.VITE_TRIPLEX_ENV === "test" && (
        <>
          <IconButton
            actionId="(UNSAFE_SKIP)"
            icon={CubeIcon}
            label="Open Last Tab"
            onClick={openLastTab}
          />
        </>
      )}

      <div className="flex h-full w-full flex-shrink items-center overflow-hidden border-l border-neutral-800">
        {projectState.map((file, index) => (
          <FileTab
            exportName={file.exportName}
            filePath={file.filePath}
            index={index}
            isActive={path === file.filePath}
            isDirty={file.isDirty}
            isNew={file.isNew}
            key={file.filePath}
            onClick={onClickHandler}
            onClose={onCloseHandler}
          >
            {file.fileName}
          </FileTab>
        ))}

        {projectState.length < 8 && lastAvailableTab && (
          <FallbackTab
            exportName={lastAvailableTab.exportName}
            filePath={lastAvailableTab.filePath}
            index={projectState.length}
            onClick={onClickHandler}
          />
        )}

        <IconButton
          actionId="tabbar_file_new"
          className="ml-1"
          icon={PlusIcon}
          label="New File"
          onClick={newFile}
        />
      </div>
    </nav>
  );
}
