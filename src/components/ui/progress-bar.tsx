export default function ProgressBar({ delivered, total }: { delivered: number; total: number }) {
  const pct = total > 0 ? (delivered / total) * 100 : 0;
  return (
    <div>
      <div className="h-[7px] bg-brand-soft rounded-full overflow-hidden min-w-[90px]">
        <div
          className={`h-full rounded-full ${pct === 100 ? "bg-success" : "bg-brand"}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-xs text-gray-label mt-1">
        {delivered} / {total} delivered
      </span>
    </div>
  );
}