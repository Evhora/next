"use client";

import { SidebarInset, SidebarProvider } from "@/shared/ui/sidebar";
import { Sidebar } from "./sidebar";

export function DashboardShell({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <Sidebar />
      <SidebarInset>
        <main className="flex-1 overflow-y-auto flex flex-col">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
