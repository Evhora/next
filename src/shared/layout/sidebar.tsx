"use client";

import {
  ChartBar,
  Command,
  Compass,
  ListChecks,
  Sparkles,
  Target,
} from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Sidebar as ShadcnSidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "../ui/sidebar";
import { SidebarUser } from "./sidebar-user";

const navigation = [
  {
    nameKey: "pages.dashboard.sidebar.routes.dashboard",
    href: "/dashboard",
    icon: <ChartBar className="h-5 w-5 text-purple-500" />,
  },
  {
    nameKey: "pages.dashboard.sidebar.routes.dreamBoard",
    href: "/dashboard/dream-board",
    icon: <Sparkles className="h-5 w-5 text-purple-400" />,
  },
  {
    nameKey: "pages.dashboard.sidebar.routes.dreams",
    href: "/dashboard/dreams",
    icon: <Target className="h-5 w-5 text-purple-400" />,
  },
  {
    nameKey: "pages.dashboard.sidebar.routes.actions",
    href: "/dashboard/actions",
    icon: <ListChecks className="h-5 w-5 text-purple-400" />,
  },
  {
    nameKey: "pages.dashboard.sidebar.routes.discovery",
    href: "/dashboard/discovery",
    icon: <Compass className="h-5 w-5 text-purple-400" />,
    isNew: true,
  },
];

interface SidebarProps {
  user: { name: string; email: string; avatar: string };
}

export function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();
  const t = useTranslations();
  const { setOpenMobile, isMobile } = useSidebar();

  const closeMobile = () => {
    if (isMobile) setOpenMobile(false);
  };

  return (
    <ShadcnSidebar>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <div className="flex gap-2">
              <div className="bg-primary flex aspect-square size-8 items-center justify-center rounded-lg">
                <Command className="size-4" color="white" />
              </div>
              <div className="grid flex-1 text-sm leading-tight">
                <span className="truncate font-medium">
                  {t("pages.dashboard.sidebar.title")}
                </span>
                <span className="truncate text-xs">
                  {t("pages.dashboard.sidebar.subtitle")}
                </span>
              </div>
            </div>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            {navigation.map((item) => (
              <SidebarMenuItem key={item.nameKey}>
                <SidebarMenuButton asChild isActive={pathname === item.href}>
                  <Link href={item.href} onClick={closeMobile}>
                    {item.icon}
                    <span>{t(item.nameKey)}</span>
                    {item.isNew && (
                      <span className="ml-auto text-[10px] font-semibold uppercase tracking-wide bg-primary text-primary-foreground rounded-full px-1.5 py-0.5 leading-none">
                        Novo
                      </span>
                    )}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarUser user={user} />
      </SidebarFooter>
    </ShadcnSidebar>
  );
}
