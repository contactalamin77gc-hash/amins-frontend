// ─── Enums ─────────────────────────────────────
export type RoleName = "SUPER_ADMIN" | "ADMIN" | "MANAGER" | "CUSTOMER";

export type ShipmentStatus =
  | "ORDER_CREATED" | "RECEIVED_CHINA_WAREHOUSE" | "PACKED"
  | "READY_FOR_SHIPMENT" | "LEFT_CHINA" | "IN_TRANSIT"
  | "ARRIVED_BANGLADESH" | "CUSTOMS_CLEARANCE" | "WAREHOUSE"
  | "PARTIALLY_DELIVERED" | "FULLY_DELIVERED" | "CANCELLED";

export type ShipmentMethod = "AIR" | "SEA" | "LAND";
export type BoxStatus = "IN_CHINA" | "IN_TRANSIT" | "ARRIVED" | "DELIVERED";
export type PaymentStatus = "UNPAID" | "PARTIAL" | "PAID";

// ─── Models ────────────────────────────────────
export interface Role {
  id: number;
  name: RoleName;
}

export interface UserProfile {
  id: string;
  fullName: string;
  email?: string;
  companyName?: string;
  address?: string;
}

export interface User {
  id: string;
  phone: string;
  isActive: boolean;
  mustChangePassword: boolean;
  role: Role;
  profile: UserProfile;
  createdAt: string;
}

export interface ShipmentBox {
  id: string;
  boxNumber: string;
  weightKg: number;
  cbm: number;
  dimensions?: string;
  status: BoxStatus;
  arrivalDate?: string;
  images: string[];
  remarks?: string;
}

export interface TrackingEntry {
  id: string;
  status: ShipmentStatus;
  remark?: string;
  updatedByName?: string;
  createdAt: string;
}

export interface Shipment {
  id: string;
  trackingNumber: string;
  orderNumber: string;
  customer: {
    id: string;
    phone: string;
    fullName?: string;
    companyName?: string;
  } | null;
  supplierName: string;
  chinaWarehouse?: string;
  bangladeshWarehouse?: string;
  method: ShipmentMethod;
  containerNumber?: string;
  status: ShipmentStatus;
  statusLabel: string;
  shipmentDate?: string;
  estimatedArrival?: string;
  actualArrival?: string;
  notes?: string;
  boxes: {
    total: number;
    delivered: number;
    remaining: number;
    items: ShipmentBox[];
  };
  trackingHistory: TrackingEntry[];
  invoices: Invoice[];
  createdAt: string;
  updatedAt: string;
}

export type ShippingMethod = "AIR" | "SEA";

export interface Lot {
  id: string;
  lotNumber: string;
  method: ShippingMethod;
  containerNumber?: string;
  chinaWarehouse?: string;
  bangladeshWarehouse?: string;
  departureDate?: string;
  estimatedArrival?: string;
  actualArrival?: string;
  status: string;
  notes?: string;
  customerCount: number;
  totalBoxes: number;
  deliveredBoxes: number;
  remainingBoxes: number;
  createdAt: string;
  updatedAt: string;
}

export interface CustomerInLot {
  shipmentId: string;
  trackingNumber: string;
  orderNumber: string;
  supplierName?: string;
  customer: {
    id: string | null;
    phone?: string;
    fullName?: string;
    companyName?: string;
    isWalkIn: boolean;
  };
  status: string;
  boxes: {
    total: number;
    delivered: number;
    remaining: number;
    items: Array<{
      id: string;
      boxNumber: string;
      weightKg?: number;
      cbm?: number;
      productName?: string;
      productType?: string;
      productPrice?: number;
      shippingCharge?: number;
      status: string;
      remarks?: string;
      carriedOverFromLotNumber?: string;
    }>;
  };
  invoices: Array<{
    id: string;
    invoiceNumber: string;
    description: string;
    totalAmount: number;
    paidAmount: number;
    paymentStatus: string;
  }>;
}

export interface LotDetail extends Lot {
  customerGroups: Array<{
    customer: {
      id: string | null;
      phone?: string;
      fullName?: string;
      companyName?: string;
      isWalkIn: boolean;
    };
    entries: CustomerInLot[];
  }>;
  trackingHistory: Array<{
    id: string;
    status: string;
    remark?: string;
    updatedByName?: string;
    createdAt: string;
  }>;
  totals: {
    customers: number;
    totalBoxes: number;
    delivered: number;
    inTransit: number;
    inChina: number;
    arrived: number;
    totalRevenue: number;
    totalCollected: number;
    totalOutstanding: number;
  };
}

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  description: string;
  invoiceDate: string;
  totalAmount: number;
  paidAmount: number;
  due: number;
  paymentStatus: PaymentStatus;
  shipment?: {
    id: string;
    trackingNumber: string;
    orderNumber: string;
    customer?: {
      id: string;
      phone: string;
      fullName?: string;
      companyName?: string;
    };
  };
  items: InvoiceItem[];
  createdAt: string;
}

export interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export interface ActivityLog {
  id: string;
  action: string;
  actionLabel: string;
  description: string;
  actor: {
    id: string;
    phone: string;
    fullName: string;
    role: string;
  } | null;
  createdAt: string;
}

// ─── API Response ──────────────────────────────
export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// ─── Status Helpers ────────────────────────────
export const STATUS_LABELS: Record<ShipmentStatus, string> = {
  ORDER_CREATED: "Order Created",
  RECEIVED_CHINA_WAREHOUSE: "China Warehouse",
  PACKED: "Packed",
  READY_FOR_SHIPMENT: "Ready for Shipment",
  LEFT_CHINA: "Left China",
  IN_TRANSIT: "In Transit",
  ARRIVED_BANGLADESH: "Arrived Bangladesh",
  CUSTOMS_CLEARANCE: "Customs Clearance",
  WAREHOUSE: "Warehouse",
  PARTIALLY_DELIVERED: "Partially Delivered",
  FULLY_DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
};

export const STATUS_COLORS: Record<ShipmentStatus, { bg: string; text: string }> = {
  ORDER_CREATED: { bg: "bg-brand-soft", text: "text-brand" },
  RECEIVED_CHINA_WAREHOUSE: { bg: "bg-brand-soft", text: "text-brand" },
  PACKED: { bg: "bg-brand-soft", text: "text-brand" },
  READY_FOR_SHIPMENT: { bg: "bg-brand-soft", text: "text-brand" },
  LEFT_CHINA: { bg: "bg-brand-soft", text: "text-brand" },
  IN_TRANSIT: { bg: "bg-warning-soft", text: "text-warning" },
  ARRIVED_BANGLADESH: { bg: "bg-brand-soft", text: "text-brand" },
  CUSTOMS_CLEARANCE: { bg: "bg-warning-soft", text: "text-warning" },
  WAREHOUSE: { bg: "bg-brand-soft", text: "text-brand" },
  PARTIALLY_DELIVERED: { bg: "bg-warning-soft", text: "text-warning" },
  FULLY_DELIVERED: { bg: "bg-success-soft", text: "text-success" },
  CANCELLED: { bg: "bg-danger-soft", text: "text-danger" },
};

export const BOX_STATUS_COLORS: Record<BoxStatus, { bg: string; text: string; border: string }> = {
  IN_CHINA: { bg: "bg-brand-soft", text: "text-brand", border: "border-brand" },
  IN_TRANSIT: { bg: "bg-warning-soft", text: "text-warning", border: "border-warning" },
  ARRIVED: { bg: "bg-brand-soft", text: "text-brand", border: "border-brand" },
  DELIVERED: { bg: "bg-success-soft", text: "text-success", border: "border-success" },
};

export const PAYMENT_COLORS: Record<PaymentStatus, { bg: string; text: string }> = {
  UNPAID: { bg: "bg-danger-soft", text: "text-danger" },
  PARTIAL: { bg: "bg-warning-soft", text: "text-warning" },
  PAID: { bg: "bg-success-soft", text: "text-success" },
};