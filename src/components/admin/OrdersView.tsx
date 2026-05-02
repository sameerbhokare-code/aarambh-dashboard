import { useEffect, useMemo, useState } from "react";
import {
  ShoppingCart,
  CheckCircle2,
  PackageCheck,
  IndianRupee,
  CalendarDays,
  Users,
  Search,
  Download,
  Eye,
  Truck,
  Trash2,
  RefreshCw,
  Loader2,
} from "lucide-react";
import { StatCard } from "./StatCard";
import { StatusBadge } from "./StatusBadge";
import { OrderDetailsDialog } from "./OrderDetailsDialog";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Tabs,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { format } from "date-fns";
import * as XLSX from "xlsx";
import { normalizeOrder, type NormalizedOrder, type Order, type OrderStatus } from "@/types/order";

const API_URL = "https://style-haven-main-backend.onrender.com/orders";

type FilterStatus = "All" | OrderStatus;

export function OrdersView({ compact = false }: { compact?: boolean }) {
  const [orders, setOrders] = useState<NormalizedOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterStatus>("All");
  const [selected, setSelected] = useState<NormalizedOrder | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<NormalizedOrder | null>(null);

  const loadOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(API_URL);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: Order[] = await res.json();
      console.log(data);
      const list = Array.isArray(data) ? data : (data as { orders?: Order[] }).orders || [];
      setOrders(list.map(normalizeOrder));
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to load orders";
      setError(msg);
      toast.error("Failed to load orders", { description: msg });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const stats = useMemo(() => {
    const total = orders.length;
    const paid = orders.filter((o) => o.status === "Paid" || o.status === "Shipped").length;
    const pendingShip = orders.filter((o) => o.status === "Paid").length;
    const revenue = orders
      .filter((o) => o.status !== "Pending")
      .reduce((s, o) => s + (Number.isFinite(o.amount) ? o.amount : 0), 0);
    const today = new Date();
    const todayOrders = orders.filter((o) => {
      const d = new Date(o.date);
      return (
        d.getFullYear() === today.getFullYear() &&
        d.getMonth() === today.getMonth() &&
        d.getDate() === today.getDate()
      );
    }).length;
    const customers = new Set(
      orders.map((o) => (o.email !== "—" ? o.email : o.contactNumber)).filter((v) => v && v !== "—")
    ).size;
    return { total, paid, pendingShip, revenue, todayOrders, customers };
  }, [orders]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return orders.filter((o) => {
      if (filter !== "All" && o.status !== filter) return false;
      if (!q) return true;
      return (
        o.customerName.toLowerCase().includes(q) ||
        o.id.toLowerCase().includes(q) ||
        o.contactNumber.toLowerCase().includes(q) ||
        o.email.toLowerCase().includes(q)
      );
    });
  }, [orders, search, filter]);

  const visible = compact ? filtered.slice(0, 5) : filtered;

  const exportExcel = () => {
    if (!filtered.length) {
      toast.info("Nothing to export");
      return;
    }
    const rows = filtered.map((o) => ({
      "Order ID": o.id,
      "Product Name": o.productName,
      "Customer Name": o.customerName,
      "Contact Number": o.contactNumber,
      Email: o.email,
      Address: o.address,
      Pincode: o.pincode,
      "Jersey Size": o.jerseySize,
      "Jersey Number": o.jerseyNumber,
      "Name on Jersey": o.nameOnJersey,
      Amount: o.amount,
      Status: o.status,
      Date: o.date,
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Orders");
    XLSX.writeFile(wb, `orders-${format(new Date(), "yyyy-MM-dd")}.xlsx`);
    toast.success("Exported to Excel");
  };

  const togglePaymentStatus = (o: NormalizedOrder) => {
    setOrders((prev) =>
      prev.map((p) => {
        if (p.id !== o.id) return p;
        if (p.status === "Pending") return { ...p, status: "Paid" };
        if (p.status === "Paid") return { ...p, status: "Pending" };
        return p;
      })
    );
    toast.success(
      o.status === "Pending" ? "Order marked as Paid" : "Order marked as Pending"
    );
  };

  const markShipped = (o: NormalizedOrder) => {
    setOrders((prev) =>
      prev.map((p) => (p.id === o.id ? { ...p, status: "Shipped" } : p))
    );
    toast.success(`Order marked as Shipped`);
  };

  const deleteOrder = (o: NormalizedOrder) => {
    setOrders((prev) => prev.filter((p) => p.id !== o.id));
    toast.success("Order deleted");
    setDeleteTarget(null);
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard label="Total Orders" value={stats.total} icon={ShoppingCart} tone="primary" />
        <StatCard
          label="Total Revenue"
          value={`₹${stats.revenue.toLocaleString()}`}
          icon={IndianRupee}
          tone="info"
        />
        <StatCard label="Today's Orders" value={stats.todayOrders} icon={CalendarDays} tone="primary" />
        <StatCard label="Paid Orders" value={stats.paid} icon={CheckCircle2} tone="success" />
        <StatCard label="Pending to Ship" value={stats.pendingShip} icon={PackageCheck} tone="warning" />
        <StatCard label="Total Customers" value={stats.customers} icon={Users} tone="info" />
      </div>

      <Card className="border-border/60 shadow-sm">
        <div className="p-5 border-b flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-lg font-semibold tracking-tight">
              {compact ? "Recent Orders" : "All Orders"}
            </h2>
            <p className="text-sm text-muted-foreground">
              {compact ? "Latest activity from your store" : "Manage and track every customer order"}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name, ID, or phone"
                className="pl-9 w-full sm:w-72"
              />
            </div>
            <Button variant="outline" size="icon" onClick={loadOrders} disabled={loading} title="Refresh">
              <RefreshCw className={loading ? "h-4 w-4 animate-spin" : "h-4 w-4"} />
            </Button>
            <Button onClick={exportExcel} className="gap-2">
              <Download className="h-4 w-4" />
              Export Excel
            </Button>
          </div>
        </div>

        <div className="px-5 pt-4">
          <Tabs value={filter} onValueChange={(v) => setFilter(v as FilterStatus)}>
            <TabsList>
              <TabsTrigger value="All">All</TabsTrigger>
              <TabsTrigger value="Pending">Pending</TabsTrigger>
              <TabsTrigger value="Paid">Paid</TabsTrigger>
              <TabsTrigger value="Shipped">Shipped</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="p-5 pt-4 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-[110px]">Order ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead className="max-w-[180px]">Address</TableHead>
                <TableHead>Pincode</TableHead>
                <TableHead>Size</TableHead>
                <TableHead>No.</TableHead>
                <TableHead>Name on Jersey</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading && (
                <TableRow>
                  <TableCell colSpan={12} className="h-32 text-center text-muted-foreground">
                    <Loader2 className="h-5 w-5 animate-spin inline mr-2" />
                    Loading orders...
                  </TableCell>
                </TableRow>
              )}
              {!loading && error && (
                <TableRow>
                  <TableCell colSpan={12} className="h-24 text-center text-destructive">
                    {error}
                  </TableCell>
                </TableRow>
              )}
              {!loading && !error && visible.length === 0 && (
                <TableRow>
                  <TableCell colSpan={12} className="h-24 text-center text-muted-foreground">
                    No orders found.
                  </TableCell>
                </TableRow>
              )}
              {!loading && !error &&
                visible.map((o) => {
                  let dateLabel = o.date;
                  try {
                    dateLabel = format(new Date(o.date), "dd MMM yyyy");
                  } catch {
                    /* keep raw */
                  }
                  return (
                    <TableRow key={o.id} className="hover:bg-muted/40">
                      <TableCell className="font-mono text-xs whitespace-nowrap" title={o.id}>
                        {o.id}
                      </TableCell>
                      <TableCell className="font-medium">{o.customerName}</TableCell>
                      <TableCell className="text-muted-foreground">{o.contactNumber}</TableCell>
                      <TableCell className="max-w-[180px] truncate text-muted-foreground" title={o.address}>
                        {o.address}
                      </TableCell>
                      <TableCell className="text-muted-foreground whitespace-nowrap">{o.pincode}</TableCell>
                      <TableCell>{o.jerseySize}</TableCell>
                      <TableCell>{o.jerseyNumber}</TableCell>
                      <TableCell>{o.nameOnJersey}</TableCell>
                      <TableCell className="text-right font-medium">
                        ₹{o.amount.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={o.status} />
                      </TableCell>
                      <TableCell className="text-muted-foreground whitespace-nowrap">
                        {dateLabel}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            size="icon"
                            variant="ghost"
                            title="View details"
                            onClick={() => {
                              setSelected(o);
                              setDetailsOpen(true);
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {(o.status === "Pending" || o.status === "Paid") && (
                            <Button
                              size="icon"
                              variant="ghost"
                              title={o.status === "Pending" ? "Mark as Paid" : "Mark as Pending"}
                              onClick={() => togglePaymentStatus(o)}
                            >
                              <CheckCircle2 className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            size="icon"
                            variant="ghost"
                            title="Mark as shipped"
                            disabled={o.status === "Shipped"}
                            onClick={() => markShipped(o)}
                          >
                            <Truck className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            title="Delete order"
                            onClick={() => setDeleteTarget(o)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
            </TableBody>
          </Table>
        </div>
      </Card>

      <OrderDetailsDialog order={selected} open={detailsOpen} onOpenChange={setDetailsOpen} />

      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this order?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove the order from your dashboard. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteTarget && deleteOrder(deleteTarget)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
