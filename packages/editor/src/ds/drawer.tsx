import * as Dialog from "@radix-ui/react-dialog";

export function Drawer({
  children,
  open,
  onClose,
}: {
  children: React.ReactNode;
  open: boolean;
  onClose: () => void;
}) {
  return (
    <Dialog.Root open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      {children}
    </Dialog.Root>
  );
}

export function DrawerContent({
  children,
  title,
}: {
  children: React.ReactNode;
  title: string;
}) {
  return (
    <Dialog.Portal>
      <Dialog.Close>
        <Dialog.Overlay className="fixed inset-0 cursor-default bg-black/20" />
      </Dialog.Close>
      <Dialog.Content className="slide-in fixed top-0 left-0 bottom-0 w-48 bg-neutral-800 p-2 text-neutral-300 shadow-2xl shadow-black/50 outline-none">
        <Dialog.DialogTitle className="mt-4 mb-2 px-2 text-2xl font-medium text-neutral-100">
          {title}
        </Dialog.DialogTitle>
        {children}
        <Dialog.Close asChild>Close</Dialog.Close>
      </Dialog.Content>
    </Dialog.Portal>
  );
}
