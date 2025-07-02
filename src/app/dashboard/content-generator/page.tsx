'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FileText, Loader2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { generateWebsiteContent, type GenerateWebsiteContentOutput } from '@/ai/flows/generate-content-for-website';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const formSchema = z.object({
  sectionType: z.string().min(3, { message: 'Please specify a section type (e.g., About Us).' }),
  shortDescription: z.string().min(20, { message: 'Please describe your website/business in at least 20 characters.' }),
  keywords: z.string().optional(),
});

export default function ContentGeneratorPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<GenerateWebsiteContentOutput | null>(null);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      sectionType: '',
      shortDescription: '',
      keywords: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true);
    setResult(null);
    try {
      const response = await generateWebsiteContent(values);
      setResult(response);
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Oh no! Something went wrong.",
        description: "There was a problem generating your content.",
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
            <FileText className="h-6 w-6" />
            AI Content Writer
          </CardTitle>
          <CardDescription>
            Generate high-quality, engaging content for any section of your website. Just provide a few details and let the AI do the writing.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="sectionType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Website Section</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., About Us, Services, Product Description, Blog Post" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="shortDescription"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Brief Description of Your Business</FormLabel>
                    <FormControl>
                      <Textarea placeholder="e.g., 'A cozy coffee shop in downtown that serves artisanal coffee and locally-sourced pastries.'" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="keywords"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Keywords (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., specialty coffee, handmade, local, cozy atmosphere" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Generate Content
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {loading && (
        <div className="flex items-center justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="ml-4 text-muted-foreground">The AI is writing your content...</p>
        </div>
      )}

      {result && (
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">{result.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <Alert>
              <Sparkles className="h-4 w-4" />
              <AlertTitle>Generated Content</AlertTitle>
              <AlertDescription>
                 <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap rounded-md bg-muted p-4 mt-2">
                    {result.content}
                 </div>
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
