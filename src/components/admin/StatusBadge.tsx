import { Badge } from "@/components/ui/badge";
import type { OrderStatus } from "@/types/order";
import { cn } from "@/lib/utils";

export function StatusBadge({ status }: { status: OrderStatus }) {
  const styles: Record<OrderStatus, string> = {
    Pending: "bg-warning/15 text-warning-foreground border border-warning/30",
    Paid: "bg-info/15 text-info border border-info/30",
    Shipped: "bg-success/15 text-success border border-success/30",
  };
  const label = status;
  return (
    <Badge className={cn("font-medium rounded-full px-2.5 py-0.5", styles[status])} variant="outline">
      <span className={cn("mr-1.5 h-1.5 w-1.5 rounded-full inline-block",
        status === "Pending" && "bg-warning",
        status === "Paid" && "bg-info",
        status === "Shipped" && "bg-success",
      )} />
      {label}
    </Badge>
  );
}
