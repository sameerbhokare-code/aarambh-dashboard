import { createFileRoute } from "@tanstack/react-router";
import { OrdersView } from "@/components/admin/OrdersView";

export const Route = createFileRoute("/orders")({
  head: () => ({
    meta: [
      { title: "Orders — JerseyHub Admin" },
      { name: "description", content: "View, filter and manage all jersey store orders." },
    ],
  }),
  component: OrdersPage,
});

function OrdersPage() {
  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Orders</h1>
        <p className="text-sm text-muted-foreground">
          Filter, search, and export your customer orders.
        </p>
      </div>
      <OrdersView />
    </div>
  );
}
