'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Bot, Loader2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { getSiteCreationGuidance, type SiteCreationGuidanceOutput } from '@/ai/flows/get-site-creation-guidance';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const formSchema = z.object({
  websiteDescription: z.string().min(20, { message: 'Please describe your website in at least 20 characters.' }),
  currentWebsiteState: z.string().min(20, { message: 'Please describe the current state or your ideas in at least 20 characters.' }),
});

export default function AssistantPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SiteCreationGuidanceOutput | null>(null);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      websiteDescription: '',
      currentWebsiteState: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true);
    setResult(null);
    try {
      const response = await getSiteCreationGuidance(values);
      setResult(response);
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Oh no! Something went wrong.",
        description: "There was a problem getting guidance from the AI.",
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
            <Bot className="h-6 w-6" />
            AI Website Assistant
          </CardTitle>
          <CardDescription>
            Need help or inspiration? Describe your website and goals, and our AI will provide expert guidance on design, content, and SEO best practices.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="websiteDescription"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Website Description</FormLabel>
                    <FormControl>
                      <Textarea placeholder="e.g., 'An e-commerce store selling handmade pottery. The target audience is people who appreciate unique, artisanal home goods.'" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="currentWebsiteState"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Current State or Questions</FormLabel>
                    <FormControl>
                      <Textarea placeholder="e.g., 'I have a basic homepage but I'm not sure what sections to add. How can I improve my product pages for better SEO? What's a good color scheme for a brand like this?'" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Get AI Guidance
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {loading && (
        <div className="flex items-center justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="ml-4 text-muted-foreground">Your AI assistant is thinking...</p>
        </div>
      )}

      {result && (
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">AI Recommendations</CardTitle>
          </CardHeader>
          <CardContent>
            <Alert>
              <Sparkles className="h-4 w-4" />
              <AlertTitle>Expert Guidance</AlertTitle>
              <AlertDescription>
                <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap">
                  {result.guidance}
                </div>
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
