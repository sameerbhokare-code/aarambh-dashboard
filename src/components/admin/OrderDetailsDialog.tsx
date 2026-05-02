import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { StatusBadge } from "./StatusBadge";
import type { NormalizedOrder } from "@/types/order";
import { format } from "date-fns";

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs uppercase tracking-wide text-muted-foreground">{label}</span>
      <span className="text-sm font-medium text-foreground break-words">{value}</span>
    </div>
  );
}

export function OrderDetailsDialog({
  order,
  open,
  onOpenChange,
}: {
  order: NormalizedOrder | null;
  open: boolean;
  onOpenChange: (o: boolean) => void;
}) {
  if (!order) return null;
  const dateStr = (() => {
    try {
      return format(new Date(order.date), "PPpp");
    } catch {
      return order.date;
    }
  })();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="flex items-center justify-between gap-3 pr-6">
            <div>
              <DialogTitle className="text-lg font-mono break-all">{order.id}</DialogTitle>
              <DialogDescription>Placed on {dateStr}</DialogDescription>
            </div>
            <StatusBadge status={order.status} />
          </div>
        </DialogHeader>
        <Separator />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 py-2">
          <Row label="Product" value={order.productName} />
          <Row label="Customer" value={order.customerName} />
          <Row label="Contact" value={order.contactNumber} />
          <Row label="Email" value={order.email} />
          <Row label="Address" value={order.address} />
          <Row label="Pincode" value={order.pincode} />
          <Row label="Amount" value={`₹${order.amount.toLocaleString()}`} />
          <Row label="Jersey Size" value={order.jerseySize} />
          <Row label="Jersey Number" value={order.jerseyNumber} />
          <Row label="Name on Jersey" value={order.nameOnJersey} />
          <Row label="Order ID" value={<span className="font-mono text-xs">{order.id}</span>} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
