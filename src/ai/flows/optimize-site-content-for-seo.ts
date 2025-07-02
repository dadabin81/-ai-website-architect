'use server';
/**
 * @fileOverview An AI agent that optimizes website content for SEO.
 *
 * - optimizeSiteContentForSeo - A function that handles the SEO optimization process.
 * - OptimizeSiteContentForSeoInput - The input type for the optimizeSiteContentForSeo function.
 * - OptimizeSiteContentForSeoOutput - The return type for the optimizeSiteContentForSeo function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const OptimizeSiteContentForSeoInputSchema = z.object({
  content: z
    .string()
    .describe('The content of the website page to be optimized.'),
  focusKeyword: z
    .string()
    .optional()
    .describe('The primary keyword for which the page should be optimized.'),
});
export type OptimizeSiteContentForSeoInput = z.infer<typeof OptimizeSiteContentForSeoInputSchema>;

const OptimizeSiteContentForSeoOutputSchema = z.object({
  title: z.string().describe('The optimized title for the page.'),
  metaDescription: z
    .string()
    .describe('The optimized meta description for the page.'),
  keywords: z.array(z.string()).describe('Suggested keywords for the page.'),
  contentSuggestions: z
    .string()
    .describe('Suggestions for improving the content for SEO.'),
});
export type OptimizeSiteContentForSeoOutput = z.infer<typeof OptimizeSiteContentForSeoOutputSchema>;

export async function optimizeSiteContentForSeo(
  input: OptimizeSiteContentForSeoInput
): Promise<OptimizeSiteContentForSeoOutput> {
  return optimizeSiteContentForSeoFlow(input);
}

const prompt = ai.definePrompt({
  name: 'optimizeSiteContentForSeoPrompt',
  input: {schema: OptimizeSiteContentForSeoInputSchema},
  output: {schema: OptimizeSiteContentForSeoOutputSchema},
  prompt: `You are an SEO expert. Analyze the given website content and provide suggestions to optimize it for search engines.

  Content: {{{content}}}
  Focus Keyword: {{{focusKeyword}}}

  Provide the following:
  - An optimized title for the page.
  - An optimized meta description for the page.
  - A list of suggested keywords for the page.
  - Suggestions for improving the content for SEO.`,
});

const optimizeSiteContentForSeoFlow = ai.defineFlow(
  {
    name: 'optimizeSiteContentForSeoFlow',
    inputSchema: OptimizeSiteContentForSeoInputSchema,
    outputSchema: OptimizeSiteContentForSeoOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
