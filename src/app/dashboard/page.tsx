'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { PlusCircle, LayoutTemplate, Bot, Rocket, BarChart3, FileText, Newspaper, Image as ImageIcon, FileSearch } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { firestore } from '@/lib/firebase';
import { collection, query, where, onSnapshot } from "firebase/firestore";

export default function DashboardOverviewPage() {
  const [siteCount, setSiteCount] = useState(0);
  const [blogCount, setBlogCount] = useState(0);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    const sitesQuery = query(collection(firestore, "sites"), where("userId", "==", user.uid));
    const blogsQuery = query(collection(firestore, "blogs"), where("userId", "==", user.uid));

    const unsubscribeSites = onSnapshot(sitesQuery, (snapshot) => {
      setSiteCount(snapshot.size);
    });

    const unsubscribeBlogs = onSnapshot(blogsQuery, (snapshot) => {
      setBlogCount(snapshot.size);
    });

    return () => {
      unsubscribeSites();
      unsubscribeBlogs();
    };
  }, [user]);

  const featureCards = [
    {
      icon: <PlusCircle className="h-8 w-8 text-primary" />,
      title: 'Create a New Site',
      description: 'Start with an idea and let our AI build a business or portfolio website.',
      href: '/dashboard/create-site',
      cta: 'Create a Site',
    },
    {
      icon: <Newspaper className="h-8 w-8 text-primary" />,
      title: 'Create a New Blog',
      description: 'Generate a complete, content-rich blog on any topic in minutes.',
      href: '/dashboard/create-blog',
      cta: 'Create a Blog',
    },
     {
      icon: <ImageIcon className="h-8 w-8 text-primary" />,
      title: 'Media Library',
      description: 'Upload and manage all of the images for your projects in one central place.',
      href: '/dashboard/media',
      cta: 'Manage Media',
    },
    {
      icon: <FileText className="h-8 w-8 text-primary" />,
      title: 'AI Content Writer',
      description: 'Generate high-quality text for any section of your site or blog.',
      href: '/dashboard/content-generator',
      cta: 'Write Content',
    },
    {
      icon: <FileSearch className="h-8 w-8 text-primary" />,
      title: 'SEO Optimizer',
      description: 'Analyze your content and get AI-powered suggestions to improve your search engine ranking.',
      href: '/dashboard/seo-optimizer',
      cta: 'Optimize Now',
    },
    {
      icon: <Bot className="h-8 w-8 text-primary" />,
      title: 'AI Assistant',
      description: 'Get expert advice on design, content, and SEO to improve your projects.',
      href: '/dashboard/assistant',
      cta: 'Ask AI',
    },
  ];

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
            <h1 className="text-3xl font-bold font-headline tracking-tight">Welcome to Your Dashboard</h1>
            <p className="text-muted-foreground mt-2">This is your command center for creating and managing your AI-powered websites and blogs.</p>
        </div>
        <div className="flex gap-2">
            <Button asChild>
                <Link href="/dashboard/create-site">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    New Site
                </Link>
            </Button>
            <Button asChild variant="secondary">
                <Link href="/dashboard/create-blog">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    New Blog
                </Link>
            </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
         <Card className="flex flex-col justify-between">
            <CardHeader>
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-primary/10 rounded-lg">
                        <LayoutTemplate className="w-6 h-6 text-primary" />
                    </div>
                    <CardTitle className="font-headline">Total Sites</CardTitle>
                </div>
            </CardHeader>
            <CardContent>
                <p className="text-5xl font-bold">{siteCount}</p>
                <p className="text-xs text-muted-foreground">website projects created</p>
            </CardContent>
        </Card>
        <Card className="flex flex-col justify-between">
            <CardHeader>
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-primary/10 rounded-lg">
                        <Newspaper className="w-6 h-6 text-primary" />
                    </div>
                    <CardTitle className="font-headline">Total Blogs</CardTitle>
                </div>
            </CardHeader>
            <CardContent>
                <p className="text-5xl font-bold">{blogCount}</p>
                <p className="text-xs text-muted-foreground">blog projects created</p>
            </CardContent>
        </Card>
         <Card className="flex flex-col justify-between">
            <CardHeader>
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-primary/10 rounded-lg">
                        <BarChart3 className="w-6 h-6 text-primary" />
                    </div>
                    <CardTitle className="font-headline">Analytics</CardTitle>
                </div>
            </CardHeader>
            <CardContent>
                <p className="text-2xl font-semibold text-muted-foreground">Coming Soon</p>
                 <p className="text-xs text-muted-foreground">Track your visitors</p>
            </CardContent>
        </Card>
      </div>

      <div className="border-t border-dashed border-border pt-8">
        <h2 className="text-2xl font-bold font-headline mb-4">What's Next?</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4">
            {featureCards.filter(c => c.title !== 'AI Assistant').map((card) => (
            <Card key={card.title} className="flex flex-col transition-all duration-300 hover:shadow-primary/10 hover:shadow-lg hover:-translate-y-1">
                <CardHeader className="flex-row items-start gap-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                    {card.icon}
                </div>
                <div>
                    <CardTitle className="font-headline text-xl">{card.title}</CardTitle>
                    <CardDescription className="mt-1">{card.description}</CardDescription>
                </div>
                </CardHeader>
                <CardContent className="flex-grow" />
                <CardFooter>
                <Button asChild className="w-full">
                    <Link href={card.href}>{card.cta}</Link>
                </Button>
                </CardFooter>
            </Card>
            ))}
        </div>
      </div>
    </div>
  );
}
