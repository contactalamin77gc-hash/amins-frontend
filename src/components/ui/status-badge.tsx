import { ShipmentStatus, STATUS_LABELS, STATUS_COLORS, PaymentStatus, PAYMENT_COLORS, BoxStatus, BOX_STATUS_COLORS } from "@/lib/types";

export function ShipmentBadge({ status }: { status: ShipmentStatus }) {
  const colors = STATUS_COLORS[status] || { bg: "bg-gray-100", text: "text-gray-500" };
  return (
    <span className={`badge ${colors.bg} ${colors.text}`}>
      {STATUS_LABELS[status] || status}
    </span>
  );
}

export function PaymentBadge({ status }: { status: PaymentStatus }) {
  const colors = PAYMENT_COLORS[status] || { bg: "bg-gray-100", text: "text-gray-500" };
  return (
    <span className={`badge ${colors.bg} ${colors.text}`}>
      {status === "UNPAID" ? "Unpaid" : status === "PARTIAL" ? "Partial" : "Paid"}
    </span>
  );
}

export function BoxBadge({ status }: { status: BoxStatus }) {
  const colors = BOX_STATUS_COLORS[status] || { bg: "bg-gray-100", text: "text-gray-500", border: "border-gray-300" };
  const label = status === "IN_CHINA" ? "In China" : status === "IN_TRANSIT" ? "In Transit" : status === "ARRIVED" ? "Arrived" : "Delivered";
  return (
    <span className={`badge ${colors.bg} ${colors.text}`}>
      {label}
    </span>
  );
}