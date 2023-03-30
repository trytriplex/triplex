import { type ReactNode } from "react";

export function PropField({
  htmlFor,
  label,
  description,
  children,
}: {
  label: string;
  htmlFor: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <div className="-mt-2 flex w-full flex-shrink gap-2 py-2 px-4 hover:bg-white/[2%]">
      <div className="h-7 w-[61px] flex-grow overflow-hidden text-ellipsis pt-1 text-right text-sm text-neutral-400">
        <label
          title={description ? `${label} — ${description}` : label}
          htmlFor={htmlFor}
        >
          {label}
        </label>
      </div>

      <div className="flex w-[139px] flex-shrink-0 flex-col justify-center gap-1">
        {children}
      </div>
    </div>
  );
}
