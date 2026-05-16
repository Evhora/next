"use client";

import { createClient } from "@/shared/supabase/client";
import { ChevronRight, CreditCard, LogOut, User } from "lucide-react";
import Link from "next/link";

import { Avatar, AvatarFallback, AvatarImage } from "@/shared/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/shared/ui/sidebar";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";

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
  const router = useRouter();

  const logout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/auth/login");
  };

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
                <AvatarImage
                  src={user.avatar}
                  alt={user.name}
                  className="object-cover"
                />
                <AvatarFallback className="rounded-lg text-xs">
                  {user.name.slice(0, 2).toUpperCase()}
                </AvatarFallback>
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
                <DropdownMenuItem key={item.nameKey} asChild>
                  <Link href={item.href} className="flex items-center gap-2">
                    {item.icon}
                    {t(item.nameKey)}
                  </Link>
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="flex items-center gap-2"
                onClick={logout}
              >
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
