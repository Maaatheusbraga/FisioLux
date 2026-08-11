"use client";

import { ConfirmProvider } from "@/components/ui/confirm-dialog";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return <ConfirmProvider>{children}</ConfirmProvider>;
}
