'use server';
/**
 * @fileOverview An AI agent that refines and edits website HTML content based on user requests.
 *
 * - refineWebsite - A function that handles the website refinement process.
 * - RefineWebsiteInput - The input type for the refineWebsite function.
 * - RefineWebsiteOutput - The return type for the refineWebsite function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const RefineWebsiteInputSchema = z.object({
  htmlContent: z.string().describe('The current HTML content of the website.'),
  request: z.string().describe('The user\'s request for refinement (e.g., "change the color scheme to blue", "make the header bigger"). This can be a simple instruction or a list of tasks.'),
});
export type RefineWebsiteInput = z.infer<typeof RefineWebsiteInputSchema>;

const RefineWebsiteOutputSchema = z.object({
  refinedHtmlContent: z.string().describe('The full, updated HTML content of the website after applying the refinements.'),
});
export type RefineWebsiteOutput = z.infer<typeof RefineWebsiteOutputSchema>;

export async function refineWebsite(input: RefineWebsiteInput): Promise<RefineWebsiteOutput> {
  return refineWebsiteFlow(input);
}

const prompt = ai.definePrompt({
  name: 'refineWebsitePrompt',
  input: {schema: RefineWebsiteInputSchema},
  output: {schema: RefineWebsiteOutputSchema},
  prompt: `You are an expert web developer and designer AI. Your task is to modify the provided HTML code based on the user's request.

The request might be a simple instruction (e.g., "change the theme to blue") or a list of specific tasks to complete. You must apply ALL requested changes and return the ENTIRE, complete, self-contained HTML document. Do not provide explanations or partial code snippets.

**CRITICAL IMAGE HANDLING RULES:**
1.  **Preserve Existing Images:** The provided HTML contains placeholders for existing images, like \`src="---image-placeholder-0---"\`. You MUST preserve these placeholders exactly as they are. Do not alter them.
2.  **Generate New Images:** If the user's request requires you to add a new image (e.g., "add a picture of a cat"), you MUST use the AI image generation format: \`src="image-prompt:A descriptive prompt for the new image"\`. For example: \`src="image-prompt:a photo of a fluffy ginger cat napping in a sunbeam"\`. Do NOT use any other placeholder format like \`https://placehold.co\`.

User's Request: "{{{request}}}"

Current HTML:
\`\`\`html
{{{htmlContent}}}
\`\`\`
`,
});

const refineWebsiteFlow = ai.defineFlow(
  {
    name: 'refineWebsiteFlow',
    inputSchema: RefineWebsiteInputSchema,
    outputSchema: RefineWebsiteOutputSchema,
  },
  async (input) => {
    // 1. Extract existing data URI images and replace with placeholders to avoid exceeding token limit.
    const existingImages: string[] = [];
    const dataUriRegex = /src="(data:image\/[^;]+;base64,[^"]+)"/g;
    const placeholderPrefix = "---image-placeholder-";
    
    const htmlWithPlaceholders = input.htmlContent.replace(dataUriRegex, (match, p1) => {
      const imageIndex = existingImages.length;
      existingImages.push(p1);
      return `src="${placeholderPrefix}${imageIndex}---"`;
    });
    
    const promptInput = {
      ...input,
      htmlContent: htmlWithPlaceholders,
    };

    // 2. Call the prompt with the placeholder HTML
    const {output} = await prompt(promptInput);
    if (!output) {
        throw new Error('Failed to refine website.');
    }

    let refinedHtml = output.refinedHtmlContent;

    // 3. Handle NEW image generation from `image-prompt` placeholders
    const imagePrompts: string[] = [];
    const imagePromptRegex = /src="image-prompt:([^"]+)"/g;

    let match;
    while ((match = imagePromptRegex.exec(refinedHtml)) !== null) {
      imagePrompts.push(match[1]);
    }

    if (imagePrompts.length > 0) {
      const imageGenerationPromises = imagePrompts.map(p =>
        ai.generate({
          model: 'googleai/gemini-2.0-flash-preview-image-generation',
          prompt: p,
          config: {
            responseModalities: ['TEXT', 'IMAGE'],
          },
        })
      );

      const imageResults = await Promise.all(imageGenerationPromises);
      const generatedImageUrls = imageResults.map(result => result.media?.url || '');

      let imageIndex = 0;
      refinedHtml = refinedHtml.replace(imagePromptRegex, () => {
        const imageUrl = generatedImageUrls[imageIndex];
        imageIndex++;
        // If image generation failed for some reason, use a placeholder
        return `src="${imageUrl || 'https://placehold.co/600x400.png'}"`;
      });
    }

    // 4. Restore EXISTING images from the original placeholders
    const restoreRegex = /src="---image-placeholder-(\d+)---"/g;
    refinedHtml = refinedHtml.replace(restoreRegex, (match, p1) => {
        const imageIndex = parseInt(p1, 10);
        if (imageIndex >= 0 && imageIndex < existingImages.length) {
            return `src="${existingImages[imageIndex]}"`;
        }
        // If the model hallucinated a new placeholder, use a default placeholder image.
        return `src="https://placehold.co/600x400.png"`;
    });

    return { refinedHtmlContent: refinedHtml };
  }
);
