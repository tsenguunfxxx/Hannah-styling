"use client";

import { useTransition } from "react";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { logoutAction } from "@/actions/auth.action";

export function LogoutButton() {
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      variant="outline"
      className="label"
      disabled={isPending}
      onClick={() => startTransition(() => logoutAction())}
    >
      <LogOut />
      Гарах
    </Button>
  );
}
