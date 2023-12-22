/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
// eslint-disable-next-line import/no-namespace
import * as Dialog from "@radix-ui/react-dialog";
import { useScreenView } from "../analytics";
import { cn } from "./cn";

export function Drawer({
  attach = "left",
  children,
  label,
  mode = "blocking",
  onClose,
  open,
}: {
  attach?: "left" | "bottom";
  children: React.ReactNode;
  label: string;
  mode?: "blocking" | "transparent";
  onClose: () => void;
  open: boolean;
}) {
  useScreenView(label, "Drawer");

  return (
    <Dialog.Root onOpenChange={(isOpen) => !isOpen && onClose()} open={open}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 cursor-default bg-black/20" />
        <Dialog.Content
          className={cn([
            mode === "blocking" && "bg-neutral-900",
            mode === "transparent" && "bg-neutral-900/[97%]",
            attach === "left" &&
              "slide-in bottom-0 left-0 w-[20.1rem] border-r",
            attach === "left" && "top-8",
            attach === "bottom" &&
              "slide-up bottom-2 left-2 right-2 h-48 rounded-lg border",
            "fixed flex flex-col overflow-hidden border-neutral-800 text-neutral-300 shadow-2xl shadow-black/50 outline-none",
          ])}
        >
          <Dialog.DialogTitle className="sr-only">{label}</Dialog.DialogTitle>
          {children}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
