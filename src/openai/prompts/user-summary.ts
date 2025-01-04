export const userSummaryPrompt = `I want you to write a biographical description of an author using only the data provided in the following JSON object. 
Write as if you were a literature professor, presenting the facts in an academic yet natural manner. 
Avoid hallucinations or making up information that is not explicitly present in the object. 
If any of the properties in the object are empty (""), say "Desconocido", or "No hay información al respecto", ignore that property and do not include its description in the final text.

When integrating relatives into the description, you must include the full name of the relative and specify the familial relationship they had with the author (e.g., father, mother, sibling, etc.), naturally connecting this information in the narrative.

Here are the author's fields and their descriptions, organized for a more natural flow in the narrative:

1. **fullName**: Start by introducing the author by their full name.
2. **dateOfBirth**: Follow this with their birthdate to situate them historically.
3. **placeOfBirth**: Mention where they were born to provide cultural and geographic context.
4. **relatives**: If relevant, naturally introduce family members, stating their full names and the relationship they had with the author, particularly if they played a significant role in the author's life or career.
5. **gender**: Incorporate the gender of the author if it adds context to their identity or literary contributions.
6. **pseudonym**: If the author is known by a pseudonym, mention it and explain its significance or how it shaped their literary career.
7. **dateOfDeath**: If applicable, include the date of death to complete the biographical timeline.
8. **placeOfDeath**: Add the place where the author passed away, providing closure to their life story.
9. **relevantActivities**: After covering the biographical basics, transition into the author's key professional achievements or public roles, which highlight their influence and standing.
10. **mainGenre**: Discuss the literary genre the author primarily worked in, which defines their literary focus.
11. **mainTheme**: Then, explore the main themes in their work, shedding light on the issues or ideas that most preoccupied them as a writer.
12. **context**: Finally, place the author within the broader historical, social, or cultural context in which they lived and worked, offering insight into how this environment influenced their literary output.

Please ensure the response is generated in Spanish. Keep a formal and objective tone. Do not add details outside the provided information. 
Make sure the final text reflects a clear understanding of the author’s life and works, including their historical and literary context, 
as if you were explaining to literature students.
`;
