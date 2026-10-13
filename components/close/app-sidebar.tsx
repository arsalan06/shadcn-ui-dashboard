"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BuildingIcon,
  ChartNoAxesColumnIcon,
  FileTextIcon,
  type LucideIcon,
  MailIcon,
  MegaphoneIcon,
  PartyPopperIcon,
  SettingsIcon,
  TrendingUpIcon,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { useClose } from "@/components/close/close-provider";
import { StatusChip } from "@/components/close/status-chip";

type NavItem = { label: string; href: string; icon: LucideIcon };

const CLOSE_NAV: NavItem[] = [
  { label: "Dashboard", href: "/", icon: BuildingIcon },
  { label: "White envelope", href: "/envelope", icon: MailIcon },
];

/** Routes the wider back office owns; listed here for orientation only. */
const BACK_OFFICE_NAV: NavItem[] = [
  { label: "Forms", href: "/forms", icon: FileTextIcon },
  { label: "Reports", href: "/reports", icon: ChartNoAxesColumnIcon },
  { label: "MTD sales", href: "/mtd-sales", icon: TrendingUpIcon },
  { label: "Announcements", href: "/announcements", icon: MegaphoneIcon },
  { label: "Grand opening", href: "/grand-opening", icon: PartyPopperIcon },
  { label: "Settings", href: "/settings", icon: SettingsIcon },
];

/** The back-office routes that exist. The rest are shown greyed out. */
const BACK_OFFICE_BUILT = new Set(["/forms", "/reports", "/mtd-sales"]);

export function AppSidebar() {
  const pathname = usePathname();
  const { submitted, submittedAt, issues } = useClose();

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              render={
                <Link href="/">
                  <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary font-semibold text-sidebar-primary-foreground">
                    C
                  </div>
                  <div className="grid flex-1 text-left leading-tight">
                    <span className="truncate text-sm font-semibold text-sidebar-foreground">
                      Family Thrift Center
                    </span>
                    <span className="truncate text-xs text-sidebar-foreground/70">
                      Corporate · 22 stores
                    </span>
                  </div>
                </Link>
              }
            />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Close</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {CLOSE_NAV.map((item) => (
                <SidebarMenuItem key={item.href} className="mt-2.5">
                  <SidebarMenuButton
                    isActive={isActive(item.href)}
                    tooltip={item.label}
                    render={
                      <Link href={item.href}>
                        <item.icon />
                        <span>{item.label}</span>
                      </Link>
                    }
                  />
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Back office</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {BACK_OFFICE_NAV.map((item) => {
                const enabled = BACK_OFFICE_BUILT.has(item.href);
                return (
                  <SidebarMenuItem key={item.href}>
                    {enabled ? (
                      <SidebarMenuButton
                        isActive={isActive(item.href)}
                        tooltip={item.label}
                        render={
                          <Link href={item.href}>
                            <item.icon />
                            <span>{item.label}</span>
                          </Link>
                        }
                      />
                    ) : (
                      <SidebarMenuButton
                        aria-disabled
                        className="pointer-events-none opacity-50"
                        tooltip={item.label}
                      >
                        <item.icon />
                        <span>{item.label}</span>
                      </SidebarMenuButton>
                    )}
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarRail />
    </Sidebar>
  );
}
