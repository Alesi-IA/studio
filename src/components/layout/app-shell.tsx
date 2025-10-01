

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, Bot, Wrench, MessageSquare, PlusCircle, LogOut, ScanEye } from "lucide-react";
import { CannaConnectLogo } from "@/components/icons/logo";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { NewPostForm } from "./new-post-form";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { Skeleton } from "../ui/skeleton";

const menuItems = [
  { href: "/", label: "Noticias", icon: Home },
  { href: "/search", label: "Buscar", icon: Search },
  { href: "/identify", label: "Identificar", icon: ScanEye },
  { href: "/analyze", label: "Analizar", icon: Bot },
  { href: "/tools", label: "Herramientas", icon: Wrench },
  { href: "/messages", label: "Mensajes", icon: MessageSquare },
];


export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isNewPostOpen, setIsNewPostOpen] = React.useState(false);
  const { user, loading, logOut, _injectUser } = useAuth();
  const router = useRouter();

  const showOnboarding = pathname === '/login' || pathname === '/register';

  React.useEffect(() => {
    // This is a temporary solution to keep the user logged in for preview purposes.
    // We'll replace this with a real authentication flow later.
    _injectUser({
        uid: 'admin-uid',
        email: 'admin@cannaconnect.com',
        displayName: 'Admin Canna',
        role: 'admin',
        photoURL: `https://picsum.photos/seed/admin-uid/128/128`
    });
  }, [_injectUser]);


  if (loading || (!user && !showOnboarding)) {
    return (
        <div className="flex min-h-screen w-full items-center justify-center">
             <div className="flex items-center gap-3">
              <CannaConnectLogo />
              <span className="font-headline text-lg font-semibold">
                CannaConnect
              </span>
            </div>
        </div>
    )
  }
  
  if (showOnboarding) {
    return <main className="flex min-h-screen flex-col items-center justify-center p-4">{children}</main>;
  }

  const mobileNavItems = menuItems.filter(item => item.href !== '/analyze' && item.href !== '/tools');


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
          <nav className="flex-1 p-2 space-y-1">
            {menuItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-muted-foreground transition-all hover:text-primary hover:bg-accent",
                  (pathname.startsWith(item.href) && item.href !== '/') || pathname === item.href ? "bg-accent text-primary" : ""
                )}
              >
                <item.icon className="h-5 w-5" />
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>
          <div className="p-4 mt-auto space-y-2">
            <DialogTrigger asChild>
              <Button className="w-full">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Nueva Publicación
              </Button>
            </DialogTrigger>
             <Button variant="outline" className="w-full" onClick={logOut}>
                <LogOut className="mr-2 h-4 w-4" />
                Cerrar Sesión
            </Button>
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
                      <Avatar className="h-8 w-8">
                        <AvatarImage
                            src={user?.photoURL || `https://picsum.photos/seed/${user?.uid}/40/40`}
                            alt={user?.displayName || 'User'}
                        />
                        <AvatarFallback>{user?.displayName?.charAt(0) || 'U'}</AvatarFallback>
                      </Avatar>
                      <span className="sr-only">Perfil</span>
                  </Button>
                </Link>
            </header>
          <main className="flex-1">{children}</main>
        </div>


        {/* Mobile Bottom Bar */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 border-t bg-background grid grid-cols-5 z-20">
          {mobileNavItems.slice(0, 2).map((item) => (
             <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center h-full w-full gap-1 p-2 rounded-md transition-colors text-muted-foreground hover:bg-accent",
                (pathname.startsWith(item.href) && item.href !== '/') || pathname === item.href ? "text-primary" : ""
              )}
            >
                <item.icon className="h-6 w-6" />
                <span className="text-xs sr-only">{item.label}</span>
            </Link>
          ))}
           <DialogTrigger asChild>
             <button className="flex flex-col items-center justify-center h-full w-full gap-1 p-2 rounded-md transition-colors text-primary-foreground bg-primary/90 hover:bg-primary">
                <PlusCircle className="h-6 w-6" />
                <span className="text-xs sr-only">Nueva Publicación</span>
              </button>
           </DialogTrigger>
           {mobileNavItems.slice(2, 4).map((item) => ( 
             <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center h-full w-full gap-1 p-2 rounded-md transition-colors text-muted-foreground hover:bg-accent",
                (pathname.startsWith(item.href) && item.href !== '/') || pathname === item.href ? "text-primary" : ""
              )}
            >
                <item.icon className="h-6 w-6" />
                <span className="text-xs sr-only">{item.label}</span>
            </Link>
          ))}
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
