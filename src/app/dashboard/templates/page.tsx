
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { LayoutGrid, Eye } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const templates = [
  {
    slug: 'modern-tech-startup',
    title: 'Modern Tech Startup',
    description: 'A sleek, professional design for innovative tech companies. Features bold typography and a dark-mode-first approach.',
    category: 'Business',
    imageUrl: 'https://i.postimg.cc/KvZJ1SdM/image-7.png',
    imageHint: 'dark website'
  },
  {
    slug: 'cozy-coffee-shop',
    title: 'Cozy Coffee Shop',
    description: 'A warm and inviting template perfect for cafes and local eateries. Rustic elements meet modern design.',
    category: 'Local Business',
    imageUrl: 'https://i.postimg.cc/Y9zQ7j2y/image-9.png',
    imageHint: 'cafe website'
  },
  {
    slug: 'minimalist-portfolio',
    title: 'Minimalist Portfolio',
    description: 'A clean, content-focused layout for artists, designers, and photographers to showcase their work.',
    category: 'Portfolio',
    imageUrl: 'https://i.postimg.cc/9F60xCC4/image-14.png',
    imageHint: 'portfolio website'
  },
  {
    slug: 'vibrant-digital-agency',
    title: 'Vibrant Digital Agency',
    description: 'A colorful and energetic design to showcase the creativity of a digital marketing or design agency.',
    category: 'Business',
    imageUrl: 'https://i.postimg.cc/cCVx5Byq/image-15.png',
    imageHint: 'agency website'
  },
  {
    slug: 'personal-finance-blog',
    title: 'Personal Finance Blog',
    description: 'A trustworthy and clear design for financial advisors and bloggers. Focuses on readability and data visualization.',
    category: 'Blog',
    imageUrl: 'https://i.postimg.cc/wBT1NF9F/image-16.png',
    imageHint: 'finance website'
  },
  {
    slug: 'travel-influencer-blog',
    title: 'Travel Influencer Blog',
    description: 'An immersive, image-heavy design perfect for sharing travel stories and stunning photographs.',
    category: 'Blog',
    imageUrl: 'https://i.postimg.cc/MptTzR1B/image-18.png',
    imageHint: 'travel blog'
  },
];

export default function TemplatesPage() {
  return (
    <div className="flex flex-col gap-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-headline text-2xl">
            <LayoutGrid className="h-6 w-6" />
            Template Gallery
          </CardTitle>
          <CardDescription>
            Browse our curated collection of designs to find the perfect starting point for your next project. Each template is fully customizable with the AI assistant.
          </CardDescription>
        </CardHeader>
      </Card>
      
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {templates.map((template, index) => (
          <Card key={index} className="flex flex-col transition-all duration-300 hover:shadow-primary/10 hover:shadow-lg hover:-translate-y-1">
            <CardContent className="p-0">
                <div className="relative overflow-hidden rounded-t-lg aspect-video">
                     <Image
                        src={template.imageUrl}
                        alt={template.title}
                        width={600}
                        height={400}
                        data-ai-hint={template.imageHint}
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 right-2">
                        <Badge variant="secondary">{template.category}</Badge>
                    </div>
                </div>
            </CardContent>
            <CardHeader>
              <CardTitle className="text-xl font-headline">{template.title}</CardTitle>
              <CardDescription>{template.description}</CardDescription>
            </CardHeader>
            <CardFooter className="mt-auto justify-end gap-2">
              <Button asChild size="sm">
                <Link href={`/dashboard/templates/${template.slug}`}>
                   <Eye className="mr-2 h-4 w-4" /> Use Template
                </Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}

    