'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import {
  LayoutTemplate,
  Sparkles,
  Bot,
  Globe,
  Blocks,
  KeyRound,
  Rocket,
  MoveRight,
  PenTool,
  Wand2,
  Send,
} from 'lucide-react';
import * as React from 'react';
import Autoplay from 'embla-carousel-autoplay';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from '@/components/ui/carousel';

export default function Home() {
  const plugin = React.useRef(
    Autoplay({ delay: 10000, stopOnInteraction: true })
  );

  const images = [
    {
      src: 'https://i.postimg.cc/N0DYt4tq/image.png',
      alt: 'AI creating a vibrant website interface',
    },
    {
      src: 'https://i.postimg.cc/tJK7657v/image-6.png',
      alt: 'A wireframe of a website design with colorful abstract elements.',
      hint: 'website wireframe'
    }
  ];

  const features = [
    {
      icon: <LayoutTemplate className="h-8 w-8 text-primary" />,
      title: 'Visual Editor',
      description: 'Drag-and-drop interface to design your website visually. No code required.',
    },
    {
      icon: <Sparkles className="h-8 w-8 text-primary" />,
      title: 'AI Template Generator',
      description: 'Get AI-powered templates and styles based on your business type for brand consistency.',
    },
    {
      icon: <Bot className="h-8 w-8 text-primary" />,
      title: 'AI Assistant',
      description: 'Real-time guidance on site creation, SEO, and content generation.',
    },
    {
      icon: <Globe className="h-8 w-8 text-primary" />,
      title: 'Easy Deployment',
      description: 'Publish your site to a free subdomain or your custom domain with a single click.',
    },
    {
      icon: <Blocks className="h-8 w-8 text-primary" />,
      title: 'Content Management',
      description: 'A full-featured CMS for your blog, media, and other site content.',
    },
    {
      icon: <KeyRound className="h-8 w-8 text-primary" />,
      title: 'Secure Authentication',
      description: 'User authentication with social login and email/password options.',
    },
  ];

  const howItWorksSteps = [
    {
      icon: <PenTool className="h-10 w-10 text-primary" />,
      step: "Step 1",
      title: "Describe Your Vision",
      description: "Simply tell our AI about your business, your style preferences, and your goals. The more detail you provide, the better."
    },
    {
      icon: <Wand2 className="h-10 w-10 text-primary" />,
      step: "Step 2",
      title: "Generate & Preview",
      description: "In seconds, our AI architect will generate a complete, content-rich website or blog draft for you to review and preview."
    },
    {
      icon: <Send className="h-10 w-10 text-primary" />,
      step: "Step 3",
      title: "Refine & Publish",
      description: "Use our intuitive editor and AI assistant to make tweaks and refinements. When you're happy, publish your site to the world."
    }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="px-4 lg:px-6 h-14 flex items-center bg-background/80 backdrop-blur-sm sticky top-0 z-50 border-b">
        <Link href="#" className="flex items-center justify-center" prefetch={false}>
          <Rocket className="h-6 w-6 text-primary" />
          <span className="sr-only">AI Website Architect</span>
          <span className="ml-2 font-headline text-lg font-semibold">AI Website Architect</span>
        </Link>
        <nav className="ml-auto flex items-center gap-2">
          <Button asChild variant="ghost">
            <Link href="#features" prefetch={false}>
              Features
            </Link>
          </Button>
          <Button asChild variant="ghost">
            <Link href="#how-it-works" prefetch={false}>
              How It Works
            </Link>
          </Button>
          <Button asChild variant="ghost">
            <Link href="/login" prefetch={false}>
              Login
            </Link>
          </Button>
          <Button asChild>
            <Link href="/dashboard" prefetch={false}>
              Get Started
            </Link>
          </Button>
        </nav>
      </header>
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 relative">
          <div className="absolute inset-0 -z-10 h-full w-full bg-background bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,hsl(var(--primary)/0.15),rgba(255,255,255,0))]"></div>
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="font-headline text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                    Your Vision, Architected by AI.
                  </h1>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl">
                    Go beyond templates. Describe your brand, and our AI will architect a stunning website and engaging blog that are uniquely yours. Go from idea to live masterpiece in minutes.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Button asChild size="lg">
                    <Link href="/dashboard" className="flex items-center gap-2">
                      Start Building for Free
                      <MoveRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>
              <div className="mx-auto aspect-video overflow-hidden rounded-xl sm:w-full lg:order-last">
                <Carousel
                    plugins={[plugin.current]}
                    className="w-full h-full"
                    onMouseEnter={plugin.current.stop}
                    onMouseLeave={plugin.current.reset}
                >
                    <CarouselContent>
                        {images.map((image, index) => (
                            <CarouselItem key={index}>
                                <Image
                                    src={image.src}
                                    width={600}
                                    height={400}
                                    alt={image.alt}
                                    className="w-full h-full object-cover"
                                    {...(image.hint && { 'data-ai-hint': image.hint })}
                                />
                            </CarouselItem>
                        ))}
                    </CarouselContent>
                </Carousel>
              </div>
            </div>
          </div>
        </section>

        <section id="how-it-works" className="w-full py-12 md:py-24 lg:py-32 bg-background">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
              <div className="inline-block rounded-lg bg-secondary px-3 py-1 text-sm">How It Works</div>
              <h2 className="font-headline text-3xl font-bold tracking-tighter sm:text-5xl">From Idea to Live Site in 3 Simple Steps</h2>
              <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Our streamlined process makes website creation faster and more intuitive than ever before.
              </p>
            </div>
            <div className="relative mx-auto grid max-w-5xl items-start gap-10 md:grid-cols-3">
              <div className="absolute top-1/2 left-0 hidden w-full -translate-y-1/2 md:block">
                  <svg className="w-full" height="2" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path stroke="hsl(var(--border))" strokeWidth="2" strokeDasharray="6 6" d="M0 1h1000" />
                  </svg>
              </div>
              {howItWorksSteps.map((step, index) => (
                  <div key={index} className="grid gap-4 text-center relative bg-background p-4">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-card border shadow-sm mb-4">
                        {step.icon}
                    </div>
                    <h3 className="text-xl font-bold font-headline">{step.title}</h3>
                    <p className="text-sm text-muted-foreground">{step.description}</p>
                  </div>
              ))}
            </div>
          </div>
        </section>

        <section id="features" className="w-full py-12 md:py-24 lg:py-32 bg-card">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-secondary px-3 py-1 text-sm">Key Features</div>
                <h2 className="font-headline text-3xl font-bold tracking-tighter sm:text-5xl">Everything You Need to Succeed</h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Our platform is packed with features designed to help you build and grow your online presence effortlessly.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-start gap-8 sm:grid-cols-2 md:gap-12 lg:grid-cols-3 mt-12">
              {features.map((feature, index) => (
                <div key={index} className="grid gap-4 text-left p-6 rounded-lg transition-all hover:bg-background hover:shadow-lg hover:shadow-primary/10 border border-transparent hover:border-primary/20">
                  <div className="flex items-center gap-4">
                    {feature.icon}
                    <h3 className="text-lg font-bold font-headline">{feature.title}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
        
        <section id="cta" className="w-full py-12 md:py-24 lg:py-32">
          <div className="container grid items-center justify-center gap-4 px-4 text-center md:px-6">
            <div className="space-y-3">
              <h2 className="font-headline text-3xl font-bold tracking-tighter md:text-4xl/tight">
                Ready to Build the Future?
              </h2>
              <p className="mx-auto max-w-[600px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Stop dreaming and start creating. Your AI-powered website is just a few clicks away.
              </p>
            </div>
            <div className="mx-auto w-full max-w-sm space-y-2">
               <Button asChild size="lg" className="w-full">
                <Link href="/dashboard">
                  Sign Up and Start Building
                </Link>
              </Button>
               <p className="text-xs text-muted-foreground">Free to start. No credit card required.</p>
            </div>
          </div>
        </section>

      </main>
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
        <p className="text-xs text-muted-foreground">&copy; 2024 AI Website Architect. All rights reserved.</p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link href="#" className="text-xs hover:underline underline-offset-4" prefetch={false}>
            Terms of Service
          </Link>
          <Link href="#" className="text-xs hover:underline underline-offset-4" prefetch={false}>
            Privacy
          </Link>
        </nav>
      </footer>
    </div>
  );
}
