export interface AuthorSummary {
  fullName: string;
  gender: string;
  pseudonym: string;
  dateOfBirth: string;
  dateOfDeath: string;
  placeOfBirth: string;
  placeOfDeath: string;
  relatives: Relative[];
  relevantActivities: string;
  mainTheme: string;
  mainGenre: string;
  context: string;
}

export interface Relative {
  name?: string;
  relationship?: string;
}
