'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating a monthly budget plan.
 *
 * - generateBudgetPlan - A function that returns a suggested budget plan.
 * - GenerateBudgetPlanInput - The input type for the generateBudgetPlan function.
 * - GenerateBudgetPlanOutput - The return type for the generateBudgetPlan function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CategorySchema = z.object({
  name: z.string().describe('The name of the category.'),
});

const GenerateBudgetPlanInputSchema = z.object({
  totalBudget: z.number().positive().describe('The total monthly budget.'),
  categories: z.array(CategorySchema).describe('The list of spending categories.'),
});
export type GenerateBudgetPlanInput = z.infer<typeof GenerateBudgetPlanInputSchema>;

const BudgetItemSchema = z.object({
  categoryName: z.string().describe('The name of the category.'),
  amount: z.number().describe('The suggested budget amount for this category.'),
});

const GenerateBudgetPlanOutputSchema = z.object({
  plan: z
    .array(BudgetItemSchema)
    .describe('An array of budget allocations for each category.'),
});
export type GenerateBudgetPlanOutput = z.infer<typeof GenerateBudgetPlanOutputSchema>;

export async function generateBudgetPlan(
  input: GenerateBudgetPlanInput
): Promise<GenerateBudgetPlanOutput> {
  return generateBudgetPlanFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateBudgetPlanPrompt',
  input: {schema: GenerateBudgetPlanInputSchema},
  output: {schema: GenerateBudgetPlanOutputSchema},
  prompt: `You are a friendly and helpful personal finance advisor.
A user wants to create a monthly budget. Their total budget is {{totalBudget}}.

Please create a sensible budget plan by allocating the total budget across the following categories:
{{#each categories}}
- {{name}}
{{/each}}

Your response should be a plan that allocates the entire {{totalBudget}} across the categories.
Ensure the sum of all category amounts in your plan equals the provided total budget.
Provide the output as an array of objects, where each object has "categoryName" and "amount".`,
});

const generateBudgetPlanFlow = ai.defineFlow(
  {
    name: 'generateBudgetPlanFlow',
    inputSchema: GenerateBudgetPlanInputSchema,
    outputSchema: GenerateBudgetPlanOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
