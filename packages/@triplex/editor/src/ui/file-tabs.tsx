/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { Cross2Icon } from "@radix-ui/react-icons";
import { useLazySubscription } from "@triplex/ws/react";
import { useEffect, useRef } from "react";
import { IconButton } from "../ds/button";
import { cn } from "../ds/cn";
import { Pressable } from "../ds/pressable";
import { useEditor } from "../stores/editor";
import useEvent from "../util/use-event";

function FileTab({
  children,
  exportName,
  filePath,
  index,
  isActive,
  isDirty,
  onClick,
  onClose,
}: {
  children: string;
  exportName: string;
  filePath: string;
  index: number;
  isActive?: boolean;
  isDirty?: boolean;
  onClick: (fileName: string, exportName: string) => void;
  onClose: (fileName: string) => void;
}) {
  const onClickHandler = useEvent(() => {
    onClick(filePath, exportName);
  });

  const onCloseHandler = useEvent(() => {
    if (
      // Skip if it's a test environment
      import.meta.env.VITE_TRIPLEX_ENV !== "test" &&
      isDirty &&
      !confirm(
        `Closing this tab will throw away changes you have made to ${children}, continue?`
      )
    ) {
      return;
    }

    onClose(filePath);
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
      onClickHandler
    );
  }, [index, onClickHandler]);

  return (
    <Pressable
      className={cn([
        "group relative flex items-center gap-3 whitespace-nowrap border-t-2 px-4 text-sm",
        isActive
          ? "border-blue-400 bg-white/5 text-blue-400"
          : "border-transparent text-neutral-400 hover:bg-white/5 active:bg-white/10",
      ])}
      onPress={isActive ? undefined : onClickHandler}
      pressActionId="open-file"
      testId={isActive ? "active-tab" : "tab"}
      title={[
        children,
        exportName,
        isDirty ? "Unsaved changes" : "",
        isActive ? "Active tab" : "",
      ]
        .filter(Boolean)
        .join(" • ")}
    >
      <span>{children}</span>
      <IconButton
        actionId="close-file"
        className={cn([
          "peer absolute right-2 z-10 opacity-0 focus:opacity-100",
          isDirty ? "hover:opacity-100" : "group-hover:opacity-100",
        ])}
        icon={Cross2Icon}
        label={`Close ${children}`}
        onClick={onCloseHandler}
        size="sm"
      />
      <span
        aria-label={isDirty ? "Unsaved changes" : undefined}
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
  const { close, exportName, newFile, path, set } = useEditor();
  const lastActiveTab = useRef<
    { exportName: string; filePath: string } | undefined
  >(undefined);

  const onClickHandler = useEvent(
    (nextFilePath: string, nextExportName: string) => {
      lastActiveTab.current = { exportName, filePath: path };

      set({
        encodedProps: "",
        exportName: nextExportName,
        path: nextFilePath,
      });
    }
  );

  const onCloseHandler = useEvent((filePath: string) => {
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
  });

  return (
    <nav
      aria-label="File tabs"
      className="col-span-full row-start-2 flex h-9 border-b border-neutral-800"
    >
      {projectState.map((file, index) => (
        <FileTab
          exportName={file.exportName}
          filePath={file.filePath}
          index={index}
          isActive={path === file.filePath}
          isDirty={file.isDirty}
          key={file.filePath}
          onClick={onClickHandler}
          onClose={onCloseHandler}
        >
          {file.fileName}
        </FileTab>
      ))}
      <Pressable
        className="flex-grow"
        doublePressActionId="new-file"
        label="New file"
        onDoublePress={newFile}
        tabIndex={-1}
      />
    </nav>
  );
}
