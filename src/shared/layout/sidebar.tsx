"use client";

import {
  ChartBar,
  ChartLine,
  Command,
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
    icon: <ChartBar className="h-5 w-5" />,
  },
  {
    nameKey: "pages.dashboard.sidebar.routes.dreamBoard",
    href: "/dashboard/dream-board",
    icon: <Sparkles className="h-5 w-5" />,
  },
  {
    nameKey: "pages.dashboard.sidebar.routes.dreams",
    href: "/dashboard/dreams",
    icon: <Target className="h-5 w-5" />,
  },
  {
    nameKey: "pages.dashboard.sidebar.routes.actions",
    href: "/dashboard/actions",
    icon: <ListChecks className="h-5 w-5" />,
  },
  {
    nameKey: "pages.dashboard.sidebar.routes.progress",
    href: "/dashboard/progress",
    icon: <ChartLine className="h-5 w-5" />,
  },
];

export function Sidebar() {
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
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarUser
          user={{
            name: "John Doe",
            email: "john.doe@example.com",
            avatar: "https://github.com/shadcn.png",
          }}
        />
      </SidebarFooter>
    </ShadcnSidebar>
  );
}
