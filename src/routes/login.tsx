import { createFileRoute, useNavigate, useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Shirt, Lock, Mail, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { isAuthed, login } from "@/lib/admin-auth";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Admin Login — JerseyHub" },
      { name: "description", content: "Sign in to manage your jersey store." },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isAuthed()) navigate({ to: "/" });
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 350));
    const ok = login(email, password);
    setSubmitting(false);
    if (ok) {
      toast.success("Welcome back, Admin");
      router.invalidate();
      navigate({ to: "/" });
    } else {
      toast.error("Invalid credentials", {
        description: "Please check your email and password.",
      });
    }
  };

  return (
    <div className="min-h-screen w-full grid lg:grid-cols-2 bg-background">
      <div className="hidden lg:flex flex-col justify-between p-10 bg-gradient-to-br from-primary via-primary to-primary/70 text-primary-foreground relative overflow-hidden">
        <div className="absolute -top-24 -right-24 h-80 w-80 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-32 -left-16 h-96 w-96 rounded-full bg-white/10 blur-3xl" />
        <div className="relative flex items-center gap-3">
          <div className="h-11 w-11 rounded-xl bg-white/15 backdrop-blur flex items-center justify-center">
            <Shirt className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-semibold leading-tight">JerseyHub</p>
            <p className="text-xs opacity-80">Admin Console</p>
          </div>
        </div>
        <div className="relative space-y-4 max-w-sm">
          <h1 className="text-3xl font-semibold tracking-tight leading-tight">
            Manage every order from one clean dashboard.
          </h1>
          <p className="text-sm opacity-90">
            Track orders, monitor revenue, and ship customer jerseys faster — all in one place.
          </p>
        </div>
        <p className="relative text-xs opacity-70">© 2026 JerseyHub Admin | develop by SAMEER BHOKARE</p>
      </div>

      <div className="flex items-center justify-center p-6 sm:p-10">
        <Card className="w-full max-w-md border-border/60 shadow-sm">
          <CardContent className="p-7 sm:p-8 space-y-6">
            <div className="space-y-1.5">
              <div className="lg:hidden flex items-center gap-2 mb-3">
                <div className="h-9 w-9 rounded-lg bg-primary text-primary-foreground flex items-center justify-center">
                  <Shirt className="h-5 w-5" />
                </div>
                <span className="font-semibold">JerseyHub Admin</span>
              </div>
              <h2 className="text-2xl font-semibold tracking-tight">Sign in</h2>
              <p className="text-sm text-muted-foreground">
                Enter your admin credentials to continue.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@aarambh.com"
                    className="pl-9"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="pl-9"
                  />
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Signing in...
                  </>
                ) : (
                  "Sign in"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
