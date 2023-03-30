import { type ReactNode } from "react";
import { camelToStartCase } from "../util/string";

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
      <div className="w-[61px] flex-grow items-center overflow-hidden text-ellipsis text-right text-neutral-400">
        <label
          className="whitespace-nowrap text-xs text-neutral-400"
          title={description ? `${label} — ${description}` : label}
          htmlFor={htmlFor}
        >
          {camelToStartCase(label)}
        </label>
      </div>

      <div className="flex w-[139px] flex-shrink-0 flex-col justify-center gap-1">
        {children}
      </div>
    </div>
  );
}
