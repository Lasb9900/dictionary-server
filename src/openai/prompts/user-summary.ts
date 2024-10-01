export const userSummaryPrompt = `I want you to write a biographical description of an author using only the data provided in the following JSON object. 
  Write as if you were a literature professor, presenting the facts in an academic yet natural manner. 
  Avoid hallucinations or making up information that is not explicitly present in the object. 
  If any of the properties in the object are empty (""), ignore that property and do not include its description in the final text. 
  Here are the author\'s fields: 
  {
    "fullName": "{{fullName}}", 
    "gender": "{{gender}}", 
    "pseudonym": "{{pseudonym}}", 
    "dateOfBirth": "{{dateOfBirth}}", 
    "dateOfDeath": "{{dateOfDeath}}", 
    "placeOfBirth": "{{placeOfBirth}}", 
    "placeOfDeath": "{{placeOfDeath}}", 
    "relatives": {{relatives}}, 
    "relevantActivities": "{{relevantActivities}}", 
    "mainTheme": "{{mainTheme}}", 
    "mainGenre": "{{mainGenre}}", 
    "context": "{{context}}"
  }
  Please ensure the response is generated in Spanish. Keep a formal and objective tone. Do not add details outside the provided information. 
  Make sure the final text reflects a clear understanding of the author’s life and works, including their historical and literary context, 
  as if you were explaining to literature students.
`;
