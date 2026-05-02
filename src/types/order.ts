export type OrderStatus = "Pending" | "Paid" | "Shipped";

export interface Order {
  _id?: string;
  orderId?: string;
  id?: string;
  productName?: string;
  customerName?: string;
  name?: string;
  contactNumber?: string;
  contact?: string;
  phone?: string;
  email?: string;
  address?: string;
  pincode?: string | number;
  jerseySize?: string;
  size?: string;
  jerseyNumber?: string | number;
  number?: string | number;
  jerseyName?: string;
  nameOnJersey?: string;
  amount?: number;
  price?: number;
  status?: OrderStatus | string;
  orderStatus?: OrderStatus | string;
  date?: string;
  createdAt?: string;
}

export interface NormalizedOrder {
  id: string;
  productName: string;
  customerName: string;
  contactNumber: string;
  email: string;
  address: string;
  pincode: string;
  jerseySize: string;
  jerseyNumber: string;
  nameOnJersey: string;
  amount: number;
  status: OrderStatus;
  date: string;
  raw: Order;
}

function toTitle(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
}

export function normalizeOrderStatus(rawStatus: string | undefined): OrderStatus {
  const normalized = (rawStatus || "").toString().trim().toLowerCase();
  const pendingLabels = [
    "pending",
    "pending payment",
    "payment pending",
    "awaiting payment",
    "unpaid",
    "not paid",
    "payment_not_done",
    "payment-not-done",
  ];
  const paidLabels = [
    "paid",
    "payment done",
    "payment-done",
    "payment_done",
    "paid successfully",
    "payment success",
    "completed",
  ];
  const shippedLabels = ["shipped", "delivered", "sent"];

  if (pendingLabels.includes(normalized)) return "Pending";
  if (paidLabels.includes(normalized)) return "Paid";
  if (shippedLabels.includes(normalized)) return "Shipped";
  return "Pending";
}

export function normalizeOrder(o: Order): NormalizedOrder {
  const status = normalizeOrderStatus(o.status || o.orderStatus || "Pending");

  return {
    id: (o.orderId || o.id || o._id || "").toString(),
    productName: o.productName || "—",
    customerName: o.customerName || o.name || o.email || "—",
    contactNumber: (o.contactNumber || o.contact || o.phone || "—").toString(),
    email: o.email || "—",
    address: o.address || "—",
    pincode: (o.pincode ?? "—").toString(),
    jerseySize: (o.jerseySize || o.size || "—").toString(),
    jerseyNumber: (o.jerseyNumber ?? o.number ?? "—").toString(),
    nameOnJersey: o.jerseyName || o.nameOnJersey || "—",
    amount: Number(o.amount ?? o.price ?? 0),
    status,
    date: o.date || o.createdAt || new Date().toISOString(),
    raw: o,
  };
}
