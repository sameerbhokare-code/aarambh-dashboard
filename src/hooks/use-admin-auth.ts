import { useEffect, useState } from "react";
import { isAuthed } from "@/lib/admin-auth";

export function useAdminAuth() {
  const [authed, setAuthed] = useState<boolean | null>(null);

  useEffect(() => {
    const sync = () => setAuthed(isAuthed());
    sync();
    window.addEventListener("jh-auth-change", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("jh-auth-change", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  return authed;
}
