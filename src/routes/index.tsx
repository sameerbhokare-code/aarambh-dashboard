import { createFileRoute } from "@tanstack/react-router";
import { OrdersView } from "@/components/admin/OrdersView";

export const Route = createFileRoute("/")({
  component: Dashboard,
});

function Dashboard() {
  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Overview of your jersey store performance and recent orders.
        </p>
      </div>
      <OrdersView compact />
    </div>
  );
}
