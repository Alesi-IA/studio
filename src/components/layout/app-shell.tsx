
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, Calendar, MessageSquare, PlusCircle, ScanEye, UserCog } from "lucide-react";
import { CannaGrowLogo } from "@/components/icons/logo";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { NewPostForm } from "./new-post-form";
import { useAuth, AuthProvider } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";

const navItems = [
  { href: "/", label: "Noticias", icon: Home, requiredRole: "" },
  { href: "/search", label: "Buscar", icon: Search, requiredRole: "" },
  { href: "/identify", label: "Asistente IA", icon: ScanEye, requiredRole: "" },
  { href: "/tools", label: "Herramientas", icon: Calendar, requiredRole: "" },
  { href: "/messages", label: "Mensajes", icon: MessageSquare, requiredRole: "" },
  { href: "/admin", label: "Admin", icon: UserCog, requiredRole: "owner" },
];

function AppShellContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isNewPostOpen, setIsNewPostOpen] = React.useState(false);
  const { user, loading, role } = useAuth();
  const router = useRouter();

  const showOnboarding = pathname === '/login' || pathname === '/register';
  
  const accessibleNavItems = navItems.filter(item => {
    if (!item.requiredRole) return true;
    return item.requiredRole === role;
  });
  
  React.useEffect(() => {
    if (!loading && !user && !showOnboarding) {
      router.push('/login');
    }
  }, [user, loading, showOnboarding, router]);
  
  if (loading || (!user && !showOnboarding)) {
    return (
        <div className="flex min-h-screen w-full items-center justify-center">
             <div className="flex items-center gap-3">
              <CannaGrowLogo />
              <span className="font-headline text-lg font-semibold">
                CannaGrow
              </span>
            </div>
        </div>
    )
  }
  
  if (showOnboarding) {
    return <main className="flex min-h-screen flex-col items-center justify-center p-4">{children}</main>;
  }

  return (
    <Dialog open={isNewPostOpen} onOpenChange={setIsNewPostOpen}>
      <div className="flex min-h-screen w-full">
        {/* Desktop Sidebar */}
        <aside className="hidden md:flex flex-col w-64 border-r fixed h-full">
          <div className="p-4">
            <Link href="/" className="flex items-center gap-3">
              <CannaGrowLogo />
              <span className="font-headline text-lg font-semibold">
                CannaGrow
              </span>
            </Link>
          </div>
          <nav className="flex-1 p-2 space-y-1">
            {accessibleNavItems.map((item) => (
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
          <div className="p-4 mt-auto">
            <DialogTrigger asChild>
              <Button className="w-full">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Nueva Publicación
              </Button>
            </DialogTrigger>
          </div>
           <div className="border-t p-4">
              <Link href="/profile" className="flex items-center gap-3">
                <Avatar className="h-9 w-9">
                    <AvatarImage
                        src={user?.photoURL || `https://picsum.photos/seed/${user?.uid}/40/40`}
                        alt={user?.displayName || 'User'}
                    />
                    <AvatarFallback>{user?.displayName?.charAt(0) || 'U'}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                    <span className="font-semibold">{user?.displayName || 'Usuario'}</span>
                    <span className="text-xs text-muted-foreground">Ver perfil</span>
                </div>
              </Link>
          </div>
        </aside>

        <div className="flex flex-col flex-1 md:ml-64">
            <header className="sticky top-0 z-10 flex h-14 items-center justify-between border-b bg-background/80 px-4 backdrop-blur-sm md:hidden shrink-0">
                <Link href="/" className="flex items-center gap-2 font-headline font-semibold">
                  <CannaGrowLogo />
                  <span>CannaGrow</span>
                </Link>
                 <div className="flex items-center gap-2">
                    <Link href="/messages">
                        <Button variant="ghost" size="icon">
                            <MessageSquare className="h-5 w-5" />
                            <span className="sr-only">Mensajes</span>
                        </Button>
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
                </div>
            </header>
          <main className="flex-1 overflow-auto pb-16 md:pb-0">{children}</main>
        </div>


        {/* Mobile Bottom Bar */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 border-t bg-background grid grid-cols-5 items-center z-20 place-items-center">
          {accessibleNavItems.filter(i => i.href !== '/admin' && i.href !== '/messages').map((item, index) => {
            if (index === 2) {
              return (
                <React.Fragment key="new-post-trigger">
                  <DialogTrigger asChild>
                    <button className="flex items-center justify-center h-12 w-12 rounded-full bg-gradient-to-br from-green-400 to-primary text-primary-foreground shadow-lg hover:from-green-500 hover:to-primary/90 transition-all duration-200 transform hover:scale-110">
                      <PlusCircle className="h-7 w-7" />
                      <span className="sr-only">Nueva Publicación</span>
                    </button>
                  </DialogTrigger>
                  <Link
                    href={item.href}
                    className={cn(
                      "flex flex-col items-center justify-center h-full w-full gap-1 p-2 rounded-md transition-colors text-muted-foreground hover:bg-accent",
                      pathname.startsWith(item.href) ? "text-primary" : ""
                    )}
                  >
                    <item.icon className="h-6 w-6" />
                    <span className="text-xs sr-only">{item.label}</span>
                  </Link>
                </React.Fragment>
              );
            }
            return (
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
            )
          })}
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

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <AppShellContent>{children}</AppShellContent>
    </AuthProvider>
  );
}
