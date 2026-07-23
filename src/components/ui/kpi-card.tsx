export default function KpiCard({
  label, value, sub, color = "bg-brand",
}: {
  label: string;
  value: string | number;
  sub?: string;
  color?: string;
}) {
  return (
    <div className="card relative overflow-hidden p-5">
      <div className={`absolute top-0 left-0 right-0 h-[3px] ${color}`} />
      <div className="text-[12.5px] text-gray-label font-semibold">{label}</div>
      <div className="text-[30px] font-display text-brand-ink mt-1 mb-0.5">{value}</div>
      {sub && (
        <div className={`text-xs ${sub.startsWith("↑") ? "text-success font-semibold" : "text-gray-label"}`}>
          {sub}
        </div>
      )}
    </div>
  );
}