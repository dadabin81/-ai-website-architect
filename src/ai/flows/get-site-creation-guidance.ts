'use server';
/**
 * @fileOverview Provides real-time guidance and suggestions on site creation best practices.
 *
 * - getSiteCreationGuidance - A function that provides site creation guidance.
 * - SiteCreationGuidanceInput - The input type for the getSiteCreationGuidance function.
 * - SiteCreationGuidanceOutput - The return type for the getSiteCreationGuidance function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SiteCreationGuidanceInputSchema = z.object({
  websiteDescription: z
    .string()
    .describe('Description of the website being created, including its purpose and target audience.'),
  currentWebsiteState: z
    .string()
    .describe('Current state of the website, including layout, content, and any specific issues or questions.'),
});
export type SiteCreationGuidanceInput = z.infer<typeof SiteCreationGuidanceInputSchema>;

const SiteCreationGuidanceOutputSchema = z.object({
  guidance: z
    .string()
    .describe('AI-generated guidance and suggestions for improving the website, including layout, image optimization, content, and SEO.'),
});
export type SiteCreationGuidanceOutput = z.infer<typeof SiteCreationGuidanceOutputSchema>;

export async function getSiteCreationGuidance(input: SiteCreationGuidanceInput): Promise<SiteCreationGuidanceOutput> {
  return getSiteCreationGuidanceFlow(input);
}

const prompt = ai.definePrompt({
  name: 'siteCreationGuidancePrompt',
  input: {schema: SiteCreationGuidanceInputSchema},
  output: {schema: SiteCreationGuidanceOutputSchema},
  prompt: `You are an AI assistant providing expert guidance on website creation.

  Based on the description of the website and its current state, provide specific and actionable suggestions for improvement.
  Consider best practices for layout, image optimization, content strategy, and SEO.

  Website Description: {{{websiteDescription}}}
  Current Website State: {{{currentWebsiteState}}}

  Guidance:
`,
});

const getSiteCreationGuidanceFlow = ai.defineFlow(
  {
    name: 'getSiteCreationGuidanceFlow',
    inputSchema: SiteCreationGuidanceInputSchema,
    outputSchema: SiteCreationGuidanceOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
