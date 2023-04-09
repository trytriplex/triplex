import * as Dialog from "@radix-ui/react-dialog";
import { cn } from "./cn";

export function Drawer({
  attach = "left",
  children,
  mode = "blocking",
  onClose,
  open,
  title,
}: {
  attach?: "left" | "bottom";
  children: React.ReactNode;
  mode?: "blocking" | "transparent";
  onClose: () => void;
  open: boolean;
  title?: string;
}) {
  return (
    <Dialog.Root
      modal={mode === "blocking"}
      open={open}
      onOpenChange={(isOpen) => !isOpen && onClose()}
    >
      {mode === "blocking" && (
        <Dialog.Close>
          <Dialog.Overlay className="fixed inset-0 cursor-default bg-black/20" />
        </Dialog.Close>
      )}
      <Dialog.Portal>
        <Dialog.Content
          className={cn([
            mode === "blocking" && "bg-neutral-900",
            mode === "transparent" && "bg-neutral-900/[97%]",
            attach === "left" && "slide-in top-0 left-0 bottom-0 w-64 border-r",
            attach === "bottom" &&
              "slide-up left-0 bottom-0 right-0 h-[186px] border-t",
            "fixed flex flex-col border-neutral-800 text-neutral-300 shadow-2xl shadow-black/50 outline-none",
          ])}
        >
          {title && (
            <Dialog.DialogTitle className="mt-6 mb-2 px-4 text-2xl font-medium text-neutral-100">
              {title}
            </Dialog.DialogTitle>
          )}
          {children}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
