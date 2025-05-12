export function File({ name }: { name: string }) {
  return (
    <div className="inline-flex cursor-pointer gap-1 rounded border border-slate-700 px-2 py-1 text-xs font-medium text-slate-300">
      {name}
    </div>
  );
}
