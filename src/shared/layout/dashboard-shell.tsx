import { SidebarInset, SidebarProvider } from "@/shared/ui/sidebar";
import { ResumeBanner } from "@/modules/discovery/ui/resume-banner";
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
        {/* Client banner: refetches on every nav, hides on /dashboard/discovery,
            dismissible via X (stored in localStorage per session). */}
        <ResumeBanner />
        <main className="flex-1 overflow-y-auto flex flex-col">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
