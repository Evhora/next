import { SidebarInset, SidebarProvider } from "@/shared/ui/sidebar";
import { Sidebar } from "./sidebar";

interface DashboardShellProps {
  children: React.ReactNode;
  user: { name: string; email: string; avatar: string };
}

export function DashboardShell({ children, user }: DashboardShellProps) {
  return (
    <SidebarProvider>
      <Sidebar user={user} />
      <SidebarInset>
        <main className="flex-1 overflow-y-auto flex flex-col">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
