'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FileSearch, Loader2, Sparkles, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { optimizeSiteContentForSeo, type OptimizeSiteContentForSeoOutput } from '@/ai/flows/optimize-site-content-for-seo';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';

const formSchema = z.object({
  content: z.string().min(50, { message: 'Please provide at least 50 characters of content to analyze.' }),
  focusKeyword: z.string().min(2, { message: 'Please provide a focus keyword.' }),
});

export default function SeoOptimizerPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<OptimizeSiteContentForSeoOutput | null>(null);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      content: '',
      focusKeyword: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true);
    setResult(null);
    try {
      const response = await optimizeSiteContentForSeo(values);
      setResult(response);
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Oh no! Something went wrong.",
        description: "There was a problem optimizing your content.",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid gap-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-headline text-2xl">
            <FileSearch className="h-6 w-6" />
            AI SEO Optimizer
          </CardTitle>
          <CardDescription>
            Paste your website or blog content and provide a focus keyword. The AI will provide SEO recommendations to improve your search engine ranking.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Content to Optimize</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Paste your full page content here..." {...field} className="min-h-[200px]" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="focusKeyword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Focus Keyword</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., 'artisanal coffee', 'handmade pottery'" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Optimize Content
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {loading && (
        <div className="flex items-center justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="ml-4 text-muted-foreground">The AI is analyzing your content for SEO...</p>
        </div>
      )}

      {result && (
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Optimization Results</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <Alert>
              <Sparkles className="h-4 w-4" />
              <AlertTitle>Optimized Title</AlertTitle>
              <AlertDescription>
                 <div className="prose prose-sm dark:prose-invert max-w-none rounded-md bg-muted p-3 mt-2 font-semibold">
                    {result.title}
                 </div>
              </AlertDescription>
            </Alert>
            <Alert>
              <Sparkles className="h-4 w-4" />
              <AlertTitle>Optimized Meta Description</AlertTitle>
              <AlertDescription>
                 <div className="prose prose-sm dark:prose-invert max-w-none rounded-md bg-muted p-3 mt-2">
                    {result.metaDescription}
                 </div>
              </AlertDescription>
            </Alert>
            <Alert>
              <Sparkles className="h-4 w-4" />
              <AlertTitle>Suggested Keywords</AlertTitle>
              <AlertDescription className="mt-2 flex flex-wrap gap-2">
                 {result.keywords.map((keyword, index) => (
                    <Badge key={index} variant="secondary">{keyword}</Badge>
                 ))}
              </AlertDescription>
            </Alert>
             <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertTitle>Content Suggestions</AlertTitle>
              <AlertDescription>
                 <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap rounded-md bg-muted p-4 mt-2">
                    {result.contentSuggestions}
                 </div>
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
