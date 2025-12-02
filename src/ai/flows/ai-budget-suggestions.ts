'use server';

/**
 * @fileOverview This file defines a Genkit flow for providing AI-driven budget suggestions based on user spending habits.
 *
 * - getAIBudgetSuggestions - A function that returns AI-driven budget suggestions.
 * - AIBudgetSuggestionsInput - The input type for the getAIBudgetSuggestions function.
 * - AIBudgetSuggestionsOutput - The return type for the getAIBudgetSuggestions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CategoryDataSchema = z.object({
  name: z.string().describe('The name of the category.'),
  spent: z.number().describe('The amount spent in this category.'),
  budget: z.number().describe('The budget for this category.'),
});

const AIBudgetSuggestionsInputSchema = z.object({
  categories: z.array(CategoryDataSchema).describe('An array of category spending and budget data.'),
});
export type AIBudgetSuggestionsInput = z.infer<typeof AIBudgetSuggestionsInputSchema>;

const SuggestionSchema = z.object({
  categoryName: z.string().describe('The name of the category for the suggestion.'),
  suggestion: z.string().describe('The AI-driven suggestion for budget adjustment.'),
});

const AIBudgetSuggestionsOutputSchema = z.object({
  suggestions: z.array(SuggestionSchema).describe('An array of AI-driven budget suggestions.'),
});
export type AIBudgetSuggestionsOutput = z.infer<typeof AIBudgetSuggestionsOutputSchema>;

export async function getAIBudgetSuggestions(input: AIBudgetSuggestionsInput): Promise<AIBudgetSuggestionsOutput> {
  return aiBudgetSuggestionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiBudgetSuggestionsPrompt',
  input: {schema: AIBudgetSuggestionsInputSchema},
  output: {schema: AIBudgetSuggestionsOutputSchema},
  prompt: `You are a personal finance advisor. Analyze the following spending data and budget goals for each category, and provide a suggestion for each.

{{#each categories}}
- Category: {{name}}
  - Spent: {{spent}}
  - Budget: {{budget}}
{{/each}}

Provide your suggestions as an array of objects, where each object has a "categoryName" and a "suggestion". Focus on actionable advice to optimize spending and savings. For instance:
{
  "suggestions": [
    {"categoryName": "Food", "suggestion": "Reduce eating out by 10% and cook at home more often."},
    {"categoryName": "Transportation", "suggestion": "Consider biking or public transport for short commutes."},
    {"categoryName": "Utilities", "suggestion": "Lower the thermostat by 2 degrees to reduce energy consumption."}
  ]
}`,
});

const aiBudgetSuggestionsFlow = ai.defineFlow(
  {
    name: 'aiBudgetSuggestionsFlow',
    inputSchema: AIBudgetSuggestionsInputSchema,
    outputSchema: AIBudgetSuggestionsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
