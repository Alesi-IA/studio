"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarProvider,
  SidebarInset,
  SidebarFooter,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { CannaConnectLogo } from "@/components/icons/logo";
import Link from "next/link";
import {
  Home,
  Calendar,
  Bot,
  BookOpen,
  MessageSquare,
  User,
  Settings,
} from "lucide-react";
import { usePathname } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";

const menuItems = [
  { href: "/", label: "Feed", icon: Home },
  { href: "/calendar", label: "Calendar", icon: Calendar },
  { href: "/analyze", label: "Analyze", icon: Bot },
  { href: "/library", label: "Library", icon: BookOpen },
  { href: "/messages", label: "Messages", icon: MessageSquare },
  { href: "/profile", label: "Profile", icon: User },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center gap-3">
            <CannaConnectLogo />
            <span className="font-headline text-lg font-semibold">
              CannaConnect
            </span>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            {menuItems.map((item) => (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === item.href}
                  tooltip={item.label}
                >
                  <Link href={item.href}>
                    <item.icon />
                    <span>{item.label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarImage
                src="https://picsum.photos/seed/user-main/40/40"
                alt="@currentuser"
              />
              <AvatarFallback>CU</AvatarFallback>
            </Avatar>
            <div className="grid w-full min-w-0 gap-0.5 text-sm">
              <p className="font-headline font-semibold truncate">CannaChampion</p>
              <p className="text-muted-foreground truncate">@cannachampion</p>
            </div>
            <Button variant="ghost" size="icon" className="ml-auto shrink-0">
                <Settings />
                <span className="sr-only">Settings</span>
            </Button>
          </div>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="sticky top-0 z-10 flex h-14 items-center justify-between border-b bg-background/80 px-4 backdrop-blur-sm md:hidden">
          <Link href="/" className="flex items-center gap-2 font-headline font-semibold">
            <CannaConnectLogo />
            <span>CannaConnect</span>
          </Link>
          <SidebarTrigger />
        </header>
        <main className="flex flex-1 flex-col">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
