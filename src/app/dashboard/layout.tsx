
'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Bot,
  Globe,
  Home,
  PanelLeft,
  Settings,
  Rocket,
  LayoutTemplate,
  FileText,
  Newspaper,
  Image as ImageIcon,
  LogOut,
  Loader2,
  LayoutGrid,
  FileSearch,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/use-auth';
import { useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';


export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading, logout } = useAuth();
  
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);


  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const isDashboardActive = pathname === '/dashboard';
  const isSitesActive = pathname.startsWith('/dashboard/sites') || pathname.startsWith('/dashboard/create-site');
  const isBlogsActive = pathname.startsWith('/dashboard/blogs') || pathname.startsWith('/dashboard/create-blog');
  const isTemplatesActive = pathname.startsWith('/dashboard/templates');
  const isMediaActive = pathname.startsWith('/dashboard/media');
  const isSeoOptimizerActive = pathname.startsWith('/dashboard/seo-optimizer');
  
  const getInitials = (name: string | null | undefined) => {
    if (!name) return '??';
    const names = name.split(' ');
    if (names.length > 1) {
      return names[0][0] + names[names.length - 1][0];
    }
    return name.substring(0, 2);
  };

  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <aside className="fixed inset-y-0 left-0 z-10 hidden w-14 flex-col border-r bg-card sm:flex">
        <nav className="flex flex-col items-center gap-4 px-2 sm:py-5">
          <Link
            href="/"
            className="group mb-4 flex h-9 w-9 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:h-8 md:w-8 md:text-base"
          >
            <Rocket className="h-4 w-4 transition-all group-hover:scale-110" />
            <span className="sr-only">AI Website Architect</span>
          </Link>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Link
                  href="/dashboard"
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-lg transition-colors md:h-8 md:w-8",
                    isDashboardActive
                      ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                      : 'text-muted-foreground hover:text-primary hover:bg-primary/10'
                  )}
                >
                  <Home className="h-5 w-5" />
                  <span className="sr-only">Dashboard</span>
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right">Dashboard</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Link
                  href="/dashboard/sites"
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-lg transition-colors md:h-8 md:w-8",
                    isSitesActive
                      ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                      : 'text-muted-foreground hover:text-primary hover:bg-primary/10'
                  )}
                >
                  <LayoutTemplate className="h-5 w-5" />
                  <span className="sr-only">My Sites</span>
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right">My Sites</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Link
                  href="/dashboard/blogs"
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-lg transition-colors md:h-8 md:w-8",
                    isBlogsActive
                      ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                      : 'text-muted-foreground hover:text-primary hover:bg-primary/10'
                  )}
                >
                  <Newspaper className="h-5 w-5" />
                  <span className="sr-only">My Blogs</span>
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right">My Blogs</TooltipContent>
            </Tooltip>
             <Tooltip>
              <TooltipTrigger asChild>
                <Link
                  href="/dashboard/templates"
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-lg transition-colors md:h-8 md:w-8",
                    isTemplatesActive
                      ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                      : 'text-muted-foreground hover:text-primary hover:bg-primary/10'
                  )}
                >
                  <LayoutGrid className="h-5 w-5" />
                  <span className="sr-only">Templates</span>
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right">Templates</TooltipContent>
            </Tooltip>
             <Tooltip>
              <TooltipTrigger asChild>
                <Link
                  href="/dashboard/media"
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-lg transition-colors md:h-8 md:w-8",
                    isMediaActive
                      ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                      : 'text-muted-foreground hover:text-primary hover:bg-primary/10'
                  )}
                >
                  <ImageIcon className="h-5 w-5" />
                  <span className="sr-only">Media Library</span>
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right">Media Library</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Link
                  href="/dashboard/content-generator"
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-lg transition-colors md:h-8 md:w-8",
                    pathname.startsWith('/dashboard/content-generator')
                      ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                      : 'text-muted-foreground hover:text-primary hover:bg-primary/10'
                  )}
                >
                  <FileText className="h-5 w-5" />
                  <span className="sr-only">Content Writer</span>
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right">Content Writer</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Link
                  href="/dashboard/seo-optimizer"
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-lg transition-colors md:h-8 md:w-8",
                    isSeoOptimizerActive
                      ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                      : 'text-muted-foreground hover:text-primary hover:bg-primary/10'
                  )}
                >
                  <FileSearch className="h-5 w-5" />
                  <span className="sr-only">SEO Optimizer</span>
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right">SEO Optimizer</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Link
                  href="/dashboard/assistant"
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-lg transition-colors md:h-8 md:w-8",
                    pathname.startsWith('/dashboard/assistant')
                      ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                      : 'text-muted-foreground hover:text-primary hover:bg-primary/10'
                  )}
                >
                  <Bot className="h-5 w-5" />
                  <span className="sr-only">AI Assistant</span>
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right">AI Assistant</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Link
                  href="/dashboard/domains"
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-lg transition-colors md:h-8 md:w-8",
                    pathname.startsWith('/dashboard/domains')
                      ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                      : 'text-muted-foreground hover:text-primary hover:bg-primary/10'
                  )}
                >
                  <Globe className="h-5 w-5" />
                  <span className="sr-only">Domains</span>
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right">Domains</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </nav>
        <nav className="mt-auto flex flex-col items-center gap-4 px-2 sm:py-5">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Link
                  href="/dashboard/settings"
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-lg transition-colors md:h-8 md:w-8",
                    pathname.startsWith('/dashboard/settings')
                      ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                      : 'text-muted-foreground hover:text-primary hover:bg-primary/10'
                  )}
                >
                  <Settings className="h-5 w-5" />
                  <span className="sr-only">Settings</span>
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right">Settings</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </nav>
      </aside>
      <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-card px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
          <Sheet>
            <SheetTrigger asChild>
              <Button size="icon" variant="outline" className="sm:hidden">
                <PanelLeft className="h-5 w-5" />
                <span className="sr-only">Toggle Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="sm:max-w-xs">
              <nav className="grid gap-6 text-lg font-medium">
                <Link
                  href="/"
                  className="group flex h-10 w-10 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:text-base"
                >
                  <Rocket className="h-5 w-5 transition-all group-hover:scale-110" />
                  <span className="sr-only">AI Website Architect</span>
                </Link>
                <Link
                  href="/dashboard"
                  className={cn(
                    "flex items-center gap-4 px-2.5",
                    isDashboardActive
                      ? 'text-foreground'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  <Home className="h-5 w-5" />
                  Dashboard
                </Link>
                <Link
                  href="/dashboard/sites"
                  className={cn(
                    "flex items-center gap-4 px-2.5",
                    isSitesActive
                      ? 'text-foreground'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  <LayoutTemplate className="h-5 w-5" />
                  My Sites
                </Link>
                <Link
                  href="/dashboard/blogs"
                  className={cn(
                    "flex items-center gap-4 px-2.5",
                    isBlogsActive
                      ? 'text-foreground'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  <Newspaper className="h-5 w-5" />
                  My Blogs
                </Link>
                 <Link
                  href="/dashboard/templates"
                  className={cn(
                    "flex items-center gap-4 px-2.5",
                    isTemplatesActive
                      ? 'text-foreground'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  <LayoutGrid className="h-5 w-5" />
                  Templates
                </Link>
                <Link
                  href="/dashboard/media"
                  className={cn(
                    "flex items-center gap-4 px-2.5",
                    isMediaActive
                      ? 'text-foreground'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  <ImageIcon className="h-5 w-5" />
                  Media Library
                </Link>
                <Link
                  href="/dashboard/content-generator"
                   className={cn(
                    "flex items-center gap-4 px-2.5",
                    pathname.startsWith('/dashboard/content-generator')
                      ? 'text-foreground'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  <FileText className="h-5 w-5" />
                  Content Writer
                </Link>
                 <Link
                  href="/dashboard/seo-optimizer"
                   className={cn(
                    "flex items-center gap-4 px-2.5",
                    isSeoOptimizerActive
                      ? 'text-foreground'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  <FileSearch className="h-5 w-5" />
                  SEO Optimizer
                </Link>
                <Link
                  href="/dashboard/assistant"
                   className={cn(
                    "flex items-center gap-4 px-2.5",
                    pathname.startsWith('/dashboard/assistant')
                      ? 'text-foreground'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  <Bot className="h-5 w-5" />
                  AI Assistant
                </Link>
                <Link
                  href="/dashboard/domains"
                  className={cn(
                    "flex items-center gap-4 px-2.5",
                    pathname.startsWith('/dashboard/domains')
                      ? 'text-foreground'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  <Globe className="h-5 w-5" />
                  Domains
                </Link>
                <Link
                  href="/dashboard/settings"
                  className={cn(
                    "flex items-center gap-4 px-2.5",
                    pathname.startsWith('/dashboard/settings')
                      ? 'text-foreground'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  <Settings className="h-5 w-5" />
                  Settings
                </Link>
              </nav>
            </SheetContent>
          </Sheet>
          
          <div className="relative ml-auto flex-1 md:grow-0" />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="overflow-hidden rounded-full"
              >
                <Avatar>
                  <AvatarImage src={user.photoURL!} alt={user.displayName!} />
                  <AvatarFallback>{getInitials(user.displayName)}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>
                <div className="flex flex-col">
                  <span className="font-semibold">{user.displayName}</span>
                  <span className="text-xs text-muted-foreground">{user.email}</span>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/dashboard/settings">
                  <Settings className="mr-2" />
                  Settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem disabled>Support</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout}>
                <LogOut className="mr-2" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>
        <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
          {children}
        </main>
      </div>
    </div>
  );
}
