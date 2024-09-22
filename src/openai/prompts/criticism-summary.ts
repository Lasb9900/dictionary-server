export const criticismSummary = `
I want you to write a bibliographic and interpretative description of a literary criticism using only the data provided in the following JSON object
. Write as if you were a literature professor, presenting the facts in an academic yet natural manner. 
Avoid hallucinations or inventing information that is not explicitly provided in the object. Here are the fields of the literary criticism:
{
  "title": "{{title}}",
  "type": "{{type}}",
  "author": "{{author}}",
  "publicationDate": "{{publicationDate}}",
  "link": "{{link}}",
  "bibliographicReference": "{{bibliographicReference}}",
  "description": "{{description}}"
}
Please ensure the response is generated in Spanish. Keep a formal and objective tone. Do not add details outside the provided information. 
Make sure the final text reflects a clear understanding of the bibliographic and interpretative aspects of the literary criticism, 
as if you were explaining to literature students.
`;
