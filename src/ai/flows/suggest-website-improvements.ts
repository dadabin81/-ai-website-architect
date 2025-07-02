'use server';
/**
 * @fileOverview An AI agent that analyzes website HTML and suggests improvements.
 *
 * - suggestWebsiteImprovements - Analyzes HTML and suggests a list of tasks.
 * - SuggestWebsiteImprovementsInput - The input type for the function.
 * - SuggestWebsiteImprovementsOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestWebsiteImprovementsInputSchema = z.object({
  htmlContent: z.string().describe('The current HTML content of the website.'),
});
export type SuggestWebsiteImprovementsInput = z.infer<typeof SuggestWebsiteImprovementsInputSchema>;

const TaskSchema = z.object({
    id: z.string().describe("A unique identifier for the task, e.g., 'task-1'."),
    description: z.string().describe('A clear, concise description of the task to be performed.'),
    isCompleted: z.boolean().describe('Whether the task has been addressed in the HTML already.'),
});
export type Task = z.infer<typeof TaskSchema>;

const SuggestWebsiteImprovementsOutputSchema = z.object({
  tasks: z.array(TaskSchema).describe('A list of actionable tasks to improve and complete the website.'),
});
export type SuggestWebsiteImprovementsOutput = z.infer<typeof SuggestWebsiteImprovementsOutputSchema>;

export async function suggestWebsiteImprovements(input: SuggestWebsiteImprovementsInput): Promise<SuggestWebsiteImprovementsOutput> {
  return suggestWebsiteImprovementsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestWebsiteImprovementsPrompt',
  input: {schema: SuggestWebsiteImprovementsInputSchema},
  output: {schema: SuggestWebsiteImprovementsOutputSchema},
  prompt: `You are an expert web developer and project manager AI. Your task is to analyze the provided HTML code for a single-page website and identify what is missing or incomplete.

Based on your analysis, create a list of actionable tasks to make the website complete, professional, and fully functional.

Here's what to look for:
- **Incomplete Sections:** Are there sections mentioned in the navigation (e.g., "Services", "About Us", "Contact") that are empty or have very little content?
- **Missing Functionality:** Does the contact section have a form? Are there calls-to-action that don't lead anywhere?
- **Content Gaps:** Is the content generic? Suggest tasks to add specific details relevant to the business type. For example, instead of just "Our Services", suggest "Add 3 detailed service descriptions with icons".
- **Design Enhancements:** Suggest tasks for adding more visual elements, like a photo gallery or customer testimonials section, if appropriate.

For each identified issue, create a clear, actionable task. For example:
- "Flesh out the 'Services' section with details for at least three distinct services."
- "Add a functional contact form with 'Name', 'Email', and 'Message' fields to the 'Contact Us' section."
- "Create a 'Testimonials' section with 2-3 sample customer reviews."

Analyze the following HTML and generate your task list. For the output, set 'isCompleted' to true only if the task is already fully addressed in the provided HTML. Otherwise, set it to false.

Current HTML:
\`\`\`html
{{{htmlContent}}}
\`\`\`
`,
});

const suggestWebsiteImprovementsFlow = ai.defineFlow(
  {
    name: 'suggestWebsiteImprovementsFlow',
    inputSchema: SuggestWebsiteImprovementsInputSchema,
    outputSchema: SuggestWebsiteImprovementsOutputSchema,
  },
  async input => {
    // To save tokens, let's first strip out the image data URIs
    const htmlWithPlaceholders = input.htmlContent.replace(/src="data:image\/[^;]+;base64,[^"]+"/g, 'src="image-placeholder"');
    
    const {output} = await prompt({ htmlContent: htmlWithPlaceholders });
    if (!output) {
      throw new Error('Could not generate suggestions');
    }
    // Filter out any tasks that the AI might have flagged as already complete.
    return {
        tasks: output.tasks.filter(task => !task.isCompleted)
    };
  }
);
