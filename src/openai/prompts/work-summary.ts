export const workSummaryPrompt = `I want you to write a bibliographic and editorial description of a literary work using only the 
data provided in the following JSON object. Write as if you were a literature professor, presenting the facts in an academic yet natural manner. 
Avoid hallucinations or inventing information that is not explicitly provided in the object. Here are the fields of the literary work:
{
"title": "{{title}}",
"originalLanguage": "{{originalLanguage}}",
"genre": "{{genre}}",
"publicationDate": "{{publicationDate}}",
"publicationPlace": {
    "city": "{{publicationPlace.city}}",
    "printingHouse": "{{publicationPlace.printingHouse}}", (imprenta)
    "publisher": "{{publicationPlace.publisher}}" (editorial)
},
"description": "{{description}}"
}
Please ensure the response is generated in Spanish. Keep a formal and objective tone. Do not add details outside of the provided information. 
Make sure the final text reflects a clear understanding of the bibliographic and editorial aspects of the work, 
as if you were explaining to literature students.
`;
