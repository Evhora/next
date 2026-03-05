"use client";

import { ChevronRight, CreditCard, LogOut, Settings, User } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { useTranslations } from "next-intl";

const navigation = [
  {
    nameKey: "pages.dashboard.sidebar.userNavigation.account",
    href: "/dashboard/account",
    icon: <User />,
  },
  {
    nameKey: "pages.dashboard.sidebar.userNavigation.billing",
    href: "/dashboard/account/billing",
    icon: <CreditCard />,
  },
  {
    nameKey: "pages.dashboard.sidebar.userNavigation.settings",
    href: "/dashboard/account/settings",
    icon: <Settings />,
  },
];

interface SidebarUserProps {
  user: {
    name: string;
    email: string;
    avatar: string;
  };
}

export function SidebarUser({ user }: SidebarUserProps) {
  const { isMobile } = useSidebar();
  const t = useTranslations();

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground hover:bg-primary-foreground"
            >
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback className="rounded-lg">CN</AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{user.name}</span>
                <span className="truncate text-xs">{user.email}</span>
              </div>
              <ChevronRight className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuGroup>
              {navigation.map((item) => (
                <DropdownMenuItem
                  key={item.nameKey}
                  className="flex items-center gap-2"
                >
                  {item.icon}
                  {t(item.nameKey)}
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem className="flex items-center gap-2">
                <LogOut className="size-4" />
                {t("pages.dashboard.sidebar.userNavigation.logout")}
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
