// src/ai/flows/generate-content-for-website.ts
'use server';
/**
 * @fileOverview AI-powered content generation for website sections.
 *
 * - generateWebsiteContent - A function that generates content for a specified website section.
 * - GenerateWebsiteContentInput - The input type for the generateWebsiteContent function.
 * - GenerateWebsiteContentOutput - The return type for the generateWebsiteContent function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateWebsiteContentInputSchema = z.object({
  sectionType: z.string().describe('The type of website section to generate content for (e.g., About Us, Services).'),
  shortDescription: z.string().describe('A brief description of the website or business.'),
  keywords: z.string().optional().describe('Optional keywords to include in the generated content.'),
});
export type GenerateWebsiteContentInput = z.infer<typeof GenerateWebsiteContentInputSchema>;

const GenerateWebsiteContentOutputSchema = z.object({
  title: z.string().describe('The title of the section.'),
  content: z.string().describe('The generated content for the specified website section.'),
});
export type GenerateWebsiteContentOutput = z.infer<typeof GenerateWebsiteContentOutputSchema>;

export async function generateWebsiteContent(input: GenerateWebsiteContentInput): Promise<GenerateWebsiteContentOutput> {
  return generateWebsiteContentFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateWebsiteContentPrompt',
  input: {schema: GenerateWebsiteContentInputSchema},
  output: {schema: GenerateWebsiteContentOutputSchema},
  prompt: `You are an AI assistant that specializes in generating website content.

  Based on the provided description and section type, create compelling and informative content.

  Description: {{{shortDescription}}}
  Section Type: {{{sectionType}}}
  Keywords: {{{keywords}}}

  Content should be well-structured and engaging for website visitors.
  The title and content MUST be suitable for a professional website. Adhere to the schema.
  `,
});

const generateWebsiteContentFlow = ai.defineFlow(
  {
    name: 'generateWebsiteContentFlow',
    inputSchema: GenerateWebsiteContentInputSchema,
    outputSchema: GenerateWebsiteContentOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
