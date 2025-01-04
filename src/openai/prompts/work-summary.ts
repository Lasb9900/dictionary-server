export const workSummaryPrompt = `I want you to write a bibliographic and editorial description of a literary work using only the 
data provided in the following JSON object. Write as if you were a literature professor, presenting the facts in an academic yet natural manner. 
Avoid hallucinations or inventing information that is not explicitly provided in the object. Here are the fields of the literary work:
works: [{
        author: string;
        text: string;
        title: string;
        originalLanguage: string;
        genre: string;
        publicationDate: string;
        publicationPlace: { city: string; printingHouse: string; publisher: string };
        editions: [{ 
            publicationDate: string;
            editiontitle: string;
            publicationPlace: { city: string; printingHouse: string; publisher: string };
            language: string;
            translator: string;
        }]; 
        description: string;
        multimedia: [{ 
            title: string;
            link: string;
            type: string;
            description: string;
        }]; 
    }]; 

Make sure the response is generated in Spanish. Keep a formal and objective tone. Do not add details outside of the provided information. 
Ensure that the final text reflects a clear understanding of the bibliographic and editorial aspects of the work, 
as if you were explaining it to literature students.
`;
