/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */

export function File({ name }: { name: string }) {
  return (
    <div className="inline-flex cursor-pointer gap-1 rounded border border-slate-700 px-2 py-1 text-xs font-medium text-slate-300">
      {name}
    </div>
  );
}
