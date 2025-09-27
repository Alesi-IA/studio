
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Bot, BookOpen, MessageSquare, User, PlusCircle } from "lucide-react";
import { CannaConnectLogo } from "@/components/icons/logo";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { NewPostForm } from "./new-post-form";

const menuItems = [
  { href: "/", label: "Noticias", icon: Home },
  { href: "/analyze", label: "Analizar", icon: Bot },
  { href: "/library", label: "Biblioteca", icon: BookOpen },
  { href: "/messages", label: "Mensajes", icon: MessageSquare },
  { href: "/profile", label: "Perfil", icon: User },
];


export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isNewPostOpen, setIsNewPostOpen] = React.useState(false);


  if (pathname === '/login' || pathname === '/register') {
    return <main className="flex min-h-screen flex-col items-center justify-center p-4">{children}</main>;
  }

  return (
    <Dialog open={isNewPostOpen} onOpenChange={setIsNewPostOpen}>
      <div className="flex min-h-screen w-full">
        {/* Desktop Sidebar */}
        <aside className="hidden md:flex flex-col w-64 border-r fixed h-full">
          <div className="p-4">
            <Link href="/" className="flex items-center gap-3">
              <CannaConnectLogo />
              <span className="font-headline text-lg font-semibold">
                CannaConnect
              </span>
            </Link>
          </div>
          <nav className="flex-1 p-2">
            {menuItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-muted-foreground transition-all hover:text-primary hover:bg-accent",
                  pathname === item.href && "bg-accent text-primary"
                )}
              >
                <item.icon className="h-5 w-5" />
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>
          <div className="p-4 mt-auto">
            <DialogTrigger asChild>
              <Button className="w-full">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Nueva Publicación
              </Button>
            </DialogTrigger>
          </div>
        </aside>

        <div className="flex flex-col flex-1 md:ml-64 pb-16 md:pb-0">
            <header className="sticky top-0 z-10 flex h-14 items-center justify-between border-b bg-background/80 px-4 backdrop-blur-sm md:hidden">
                <Link href="/" className="flex items-center gap-2 font-headline font-semibold">
                  <CannaConnectLogo />
                  <span>CannaConnect</span>
                </Link>
                <Link href="/profile">
                  <Button variant="ghost" size="icon">
                      <Avatar>
                        <AvatarImage
                            src="https://picsum.photos/seed/user-main/40/40"
                            alt="@currentuser"
                        />
                        <AvatarFallback>AD</AvatarFallback>
                      </Avatar>
                      <span className="sr-only">Perfil</span>
                  </Button>
                </Link>
            </header>
          <main className="flex-1">{children}</main>
        </div>


        {/* Mobile Bottom Bar */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 border-t bg-background flex items-center justify-around z-20">
          {menuItems.map((item) => (
             <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center h-full w-full gap-1 p-2 rounded-md transition-colors text-muted-foreground hover:bg-accent",
                pathname === item.href ? "text-primary" : ""
              )}
            >
               {item.href === '/analyze' ? (
                 <DialogTrigger asChild>
                    <div className="flex flex-col items-center gap-1">
                      <item.icon className="h-6 w-6" />
                      <span className="text-xs sr-only">{item.label}</span>
                    </div>
                  </DialogTrigger>
               ) : (
                <>
                  <item.icon className="h-6 w-6" />
                  <span className="text-xs sr-only">{item.label}</span>
                </>
               )}
            </Link>
          ))}
           <DialogTrigger asChild>
             <button className="flex flex-col items-center justify-center h-full w-full gap-1 p-2 rounded-md transition-colors text-muted-foreground hover:bg-accent">
                <PlusCircle className="h-6 w-6" />
                <span className="text-xs sr-only">Nueva Publicación</span>
              </button>
           </DialogTrigger>
        </nav>
      </div>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Crear nueva publicación</DialogTitle>
        </DialogHeader>
        <NewPostForm onPostCreated={() => setIsNewPostOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}
