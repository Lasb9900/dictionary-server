import { Inject, Injectable, OnApplicationShutdown } from '@nestjs/common';
import { Connection, Query } from 'cypher-query-builder';
import { NEO4J_CONNECTION } from './neo4j.constants';

@Injectable()
export class QueryRepository implements OnApplicationShutdown {
  constructor(
    @Inject(NEO4J_CONNECTION)
    private readonly connection: Connection,
  ) {}
  onApplicationShutdown() {
    this.connection.close();
  }

  initQuery(): Query {
    return this.connection.query();
  }

  async deleteCardNodes(id: string): Promise<void> {
    const query = this.connection.query();

    await query
      .raw(
        `
        MATCH (n)
        WHERE n.fichaId = $id
        DETACH DELETE n
        `,
        { id },
      )
      .run();
  }

  async createAuthorCardNodes(authorData: any): Promise<void> {
    const query = this.connection.query();

    console.log(authorData);
    await query
      .raw(
        `
    // Crear o actualizar el nodo del autor
    MERGE (card:Author {fichaId: $id})
    ON CREATE SET card.fullName = $fullName,  
                  card.pseudonym = $pseudonym, 
                  card.dateOfBirth = $dateOfBirth, 
                  card.dateOfDeath = $dateOfDeath, 
                  card.placeOfBirth = $placeOfBirth, 
                  card.placeOfDeath = $placeOfDeath, 
                  card.gender = $gender, 
                  card.relevantActivities = $relevantActivities, 
                  card.mainTheme = $mainTheme, 
                  card.mainGenre = $mainGenre, 
                  card.context = $context,
                  card.text = $text
    ON MATCH SET card.fullName = $fullName,
                  card.pseudonym = $pseudonym, 
                  card.dateOfBirth = $dateOfBirth, 
                  card.dateOfDeath = $dateOfDeath, 
                  card.placeOfBirth = $placeOfBirth, 
                  card.placeOfDeath = $placeOfDeath, 
                  card.gender = $gender, 
                  card.relevantActivities = $relevantActivities, 
                  card.mainTheme = $mainTheme, 
                  card.mainGenre = $mainGenre, 
                  card.context = $context,
                  card.text = $text

    // Crear nodos de relatives relacionados con el autor
    WITH card, $relatives AS relativesData
    UNWIND relativesData AS relativeData
    MERGE (relative:Relative {name: relativeData.name, fichaId: $id})
    ON CREATE SET relative.relationship = relativeData.relationship
    ON MATCH SET relative.relationship = relativeData.relationship
    MERGE (card)-[:HAS_RELATIVE]->(relative)

    // Crear nodos multimedia relacionados con el autor
    WITH card, $multimedia AS multimediaData
    UNWIND multimediaData AS media
    MERGE (mediaNode:Multimedia {link: media.link, fichaId: $id})
    ON CREATE SET mediaNode.type = media.type, 
                  mediaNode.description = media.description,
                  mediaNode.title = media.title
    ON MATCH SET mediaNode.type = media.type, 
                  mediaNode.description = media.description,
                  mediaNode.title = media.title
    MERGE (card)-[:HAS_MULTIMEDIA]->(mediaNode)

    // Crear nodos de obras y sus multimedia
    WITH card, $works AS worksData
    UNWIND worksData AS workData
    MERGE (work:Work {title: workData.title, fichaId: $id})
    ON CREATE SET work.originalLanguage = workData.originalLanguage, 
                  work.genre = workData.genre, 
                  work.publicationDate = workData.publicationDate, 
                  work.description = workData.description,
                  work.text = workData.text
    ON MATCH SET work.originalLanguage = workData.originalLanguage, 
                  work.genre = workData.genre, 
                  work.publicationDate = workData.publicationDate, 
                  work.description = workData.description,
                  work.text = workData.text
    MERGE (card)-[:CREATED]->(work)

    // Crear o actualizar el lugar de publicación de la obra
    WITH card, work, workData, workData.publicationPlace AS pubPlace
    MERGE (place:Publication {fichaId: $id, city: pubPlace.city, printingHouse: pubPlace.printingHouse, publisher: pubPlace.publisher})
    ON CREATE SET place.city = pubPlace.city, 
                  place.printingHouse = pubPlace.printingHouse, 
                  place.publisher = pubPlace.publisher
    ON MATCH SET place.city = pubPlace.city, 
                  place.printingHouse = pubPlace.printingHouse, 
                  place.publisher = pubPlace.publisher
    MERGE (work)-[:PUBLISHED_IN]->(place)

    // Crear multimedia de las obras
    WITH card, work, workData.multimedia AS workMultimedia
    UNWIND workMultimedia AS workMedia
    MERGE (workMediaNode:Multimedia {link: workMedia.link, fichaId: $id})
    ON CREATE SET workMediaNode.type = workMedia.type, 
                  workMediaNode.description = workMedia.description
    ON MATCH SET workMediaNode.type = workMedia.type, 
                  workMediaNode.description = workMedia.description
    MERGE (work)-[:HAS_MULTIMEDIA]->(workMediaNode)

    // Crear nodos de críticas y sus multimedia
    WITH card, $criticism AS criticismData
    UNWIND criticismData AS crit
    MERGE (criticism:Criticism {title: crit.title, fichaId: $id})
    ON CREATE SET criticism.type = crit.type, 
                  criticism.author = crit.author, 
                  criticism.publicationDate = crit.publicationDate, 
                  criticism.link = crit.link, 
                  criticism.bibliographicReference = crit.bibliographicReference, 
                  criticism.description = crit.description,
                  criticism.text = crit.text
    ON MATCH SET criticism.type = crit.type, 
                  criticism.author = crit.author, 
                  criticism.publicationDate = crit.publicationDate, 
                  criticism.link = crit.link, 
                  criticism.bibliographicReference = crit.bibliographicReference, 
                  criticism.description = crit.description,
                  criticism.text = crit.text
    MERGE (criticism)-[:CRITICIZES_ABOUT]->(card)

    // Crear multimedia de las críticas
    WITH card, criticism, crit
    UNWIND crit.multimedia AS critMedia
    MERGE (critMediaNode:Multimedia {link: critMedia.link, fichaId: $id})
    ON CREATE SET critMediaNode.type = critMedia.type, 
                  critMediaNode.description = critMedia.description,
                  critMediaNode.title = critMedia.title
    ON MATCH SET critMediaNode.type = critMedia.type, 
                  critMediaNode.description = critMedia.description,
                  critMediaNode.title = critMedia.title
    MERGE (criticism)-[:HAS_MULTIMEDIA]->(critMediaNode)
      `,
        authorData,
      )
      .run();
  }

  async createMagazineCardNodes(magazineData: any): Promise<void> {
    const query = this.connection.query();

    await query
      .raw(
        `
        // Crear o actualizar el nodo de la revista
        MERGE (magazine:Magazine {fichaId: $id})
        ON CREATE SET magazine.magazineTitle = $magazineTitle, 
                      magazine.originalLanguage = $originalLanguage,  
                      magazine.sections = $sections, 
                      magazine.description = $description,
                      magazine.text = $text
        ON MATCH SET magazine.magazineTitle = $magazineTitle, 
                      magazine.originalLanguage = $originalLanguage,  
                      magazine.sections = $sections, 
                      magazine.description = $description,
                      magazine.text = $text

        // Crear o actualizar números de la revista
        WITH magazine, $numbers AS numbersData
        UNWIND numbersData AS numberData
        MERGE (number:MagazineIssue {number: numberData.number, fichaId: $id})
        ON CREATE SET number.issueDate = numberData.issueDate, 
                      number.language = numberData.language, 
                      number.translator = numberData.translator
        ON MATCH SET number.issueDate = numberData.issueDate,
                      number.language = numberData.language, 
                      number.translator = numberData.translator
        MERGE (magazine)-[:HAS_NUMBER]->(number)

        // Crear o actualizar lugar de publicación de la revista
        WITH magazine, number, numberData.publicationPlace AS pubPlace
        MERGE (place:Publication {fichaId: $id, city: pubPlace.city, printingHouse: pubPlace.printingHouse, publisher: pubPlace.publisher})
        ON CREATE SET place.city = pubPlace.city, 
                      place.printingHouse = pubPlace.printingHouse, 
                      place.publisher = pubPlace.publisher
        ON MATCH SET place.city = pubPlace.city,
                      place.printingHouse = pubPlace.printingHouse, 
                      place.publisher = pubPlace.publisher
        MERGE (number)-[:PUBLISHED_IN]->(place)

        // Crear o actualizar multimedia de la revista
        WITH magazine, $multimedia AS multimediaData
        UNWIND multimediaData AS media
        MERGE (mediaNode:Multimedia {link: media.link, fichaId: $id})
        ON CREATE SET mediaNode.type = media.type, mediaNode.description = media.description, mediaNode.title = media.title
        ON MATCH SET mediaNode.type = media.type, mediaNode.description = media.description, mediaNode.title = media.title
        MERGE (magazine)-[:HAS_MULTIMEDIA]->(mediaNode)

        // Crear o actualizar creadores de la revista
        WITH magazine, $creators AS creatorsData
        UNWIND creatorsData AS creatorData
        MERGE (creator:Creator {name: creatorData.name, fichaId: $id})
        ON CREATE SET creator.role = creatorData.role
        ON MATCH SET creator.role = creatorData.role
        MERGE (magazine)-[:HAS_CREATORS]->(creator)

        // Crear o actualizar críticas de la revista
        WITH magazine, $criticism AS criticismData
        UNWIND criticismData AS crit
        MERGE (criticism:Criticism {title: crit.title, fichaId: $id})
        ON CREATE SET criticism.type = crit.type, criticism.author = crit.author, 
                      criticism.publicationDate = crit.publicationDate, 
                      criticism.link = crit.link, 
                      criticism.bibliographicReference = crit.bibliographicReference, 
                      criticism.description = crit.description,
                      criticism.text = crit.text
        ON MATCH SET criticism.type = crit.type, criticism.author = crit.author, 
                      criticism.publicationDate = crit.publicationDate, 
                      criticism.link = crit.link, 
                      criticism.bibliographicReference = crit.bibliographicReference, 
                      criticism.description = crit.description,
                      criticism.text = crit.text
        MERGE (criticism)-[:CRITICIZES_ABOUT]->(magazine)

        // Crear o actualizar multimedia de las críticas
        WITH criticism, crit
        UNWIND crit.multimedia AS critMedia
        MERGE (critMediaNode:Multimedia {link: critMedia.link, fichaId: $id})
        ON CREATE SET critMediaNode.type = critMedia.type, critMediaNode.description = critMedia.description, critMediaNode.title = critMedia.title
        ON MATCH SET critMediaNode.type = critMedia.type, critMediaNode.description = critMedia.description, critMediaNode.title = critMedia.title
        MERGE (criticism)-[:HAS_MULTIMEDIA]->(critMediaNode)
        `,
        magazineData,
      )
      .run();
  }

  async createAnthologyCardNodes(anthologyData: any): Promise<void> {
    const query = this.connection.query();

    await query
      .raw(
        `
        // Crear o actualizar el nodo de la antología
        MERGE (anthology:Anthology {fichaId: $id})
        ON CREATE SET anthology.title = $anthologyTitle, 
                      anthology.genre = $genre, 
                      anthology.author = $author, 
                      anthology.originalLanguage = $originalLanguage, 
                      anthology.publicationDate = $publicationDate, 
                      anthology.description = $description,
                      anthology.text = $text
        ON MATCH SET anthology.title = $anthologyTitle, 
                      anthology.genre = $genre, 
                      anthology.author = $author, 
                      anthology.originalLanguage = $originalLanguage, 
                      anthology.publicationDate = $publicationDate, 
                      anthology.description = $description,
                      anthology.text = $text

        // Crear o actualizar el lugar de publicación
        WITH anthology, $publicationPlace AS pubPlace
        MERGE (place:Publication {fichaId: $id})
        ON CREATE SET place.city = pubPlace.city, 
                      place.printingHouse = pubPlace.printingHouse, 
                      place.publisher = pubPlace.publisher
        ON MATCH SET place.city = pubPlace.city, 
                      place.printingHouse = pubPlace.printingHouse, 
                      place.publisher = pubPlace.publisher
        MERGE (anthology)-[:PUBLISHED_IN]->(place)

        // Crear o actualizar multimedia de la antología
        WITH anthology, $multimedia AS multimediaData
        UNWIND multimediaData AS media
        MERGE (mediaNode:Multimedia {link: media.link, fichaId: $id})
        ON CREATE SET mediaNode.type = media.type, mediaNode.description = media.description, mediaNode.title = media.title
        ON MATCH SET mediaNode.type = media.type, mediaNode.description = media.description, mediaNode.title = media.title
        MERGE (anthology)-[:HAS_MULTIMEDIA]->(mediaNode)

        // Crear o actualizar críticas de la antología
        WITH anthology, $criticism AS criticismData
        UNWIND criticismData AS crit
        MERGE (criticism:Criticism {title: crit.title, fichaId: $id})
        ON CREATE SET criticism.type = crit.type, criticism.author = crit.author, 
                      criticism.publicationDate = crit.publicationDate, 
                      criticism.link = crit.link, 
                      criticism.bibliographicReference = crit.bibliographicReference, 
                      criticism.description = crit.description,
                      criticism.text = crit.text
        ON MATCH SET criticism.type = crit.type, criticism.author = crit.author, 
                      criticism.publicationDate = crit.publicationDate, 
                      criticism.link = crit.link, 
                      criticism.bibliographicReference = crit.bibliographicReference, 
                      criticism.description = crit.description,
                      criticism.text = crit.text
        MERGE (criticism)-[:CRITICIZES_ABOUT]->(anthology)

        // Crear o actualizar multimedia de las críticas
        WITH anthology, criticism, crit
        UNWIND crit.multimedia AS critMedia
        MERGE (critMediaNode:Multimedia {link: critMedia.link, fichaId: $id})
        ON CREATE SET critMediaNode.type = critMedia.type, critMediaNode.description = critMedia.description, critMediaNode.title = critMedia.title
        ON MATCH SET critMediaNode.type = critMedia.type, critMediaNode.description = critMedia.description, critMediaNode.title = critMedia.title
        MERGE (criticism)-[:HAS_MULTIMEDIA]->(critMediaNode)
        `,
        anthologyData,
      )
      .run();
  }

  async createGroupingCardNodes(groupingData: any): Promise<void> {
    const query = this.connection.query();

    await query
      .raw(
        `
        // Crear o actualizar el nodo del grupo
        MERGE (group:Grouping {fichaId: $id})
        ON CREATE SET group.name = $name, 
                      group.startDate = $startDate, 
                      group.endDate = $endDate, 
                      group.generalCharacteristics = $generalCharacteristics, 
                      group.groupActivities = $groupActivities,
                      group.text = $text
        ON MATCH SET group.name = $name, 
                      group.startDate = $startDate, 
                      group.endDate = $endDate, 
                      group.generalCharacteristics = $generalCharacteristics, 
                      group.groupActivities = $groupActivities,
                      group.text = $text

        // Crear o actualizar el lugar de reuniones
        WITH group, $meetingPlace AS meetingPlaceData
        MERGE (place:MeetingPlace {fichaId: $id})
        ON CREATE SET place.city = meetingPlaceData.city, place.municipality = meetingPlaceData.municipality
        ON MATCH SET place.city = meetingPlaceData.city, place.municipality = meetingPlaceData.municipality
        MERGE (group)-[:MET_IN]->(place)

        // Crear o actualizar multimedia del grupo
        WITH group, $multimedia AS multimediaData
        UNWIND multimediaData AS media
        MERGE (mediaNode:Multimedia {link: media.link, fichaId: $id})
        ON CREATE SET mediaNode.type = media.type, mediaNode.description = media.description, mediaNode.title = media.title
        ON MATCH SET mediaNode.type = media.type, mediaNode.description = media.description, mediaNode.title = media.title
        MERGE (group)-[:HAS_MULTIMEDIA]->(mediaNode)

        // Crear o actualizar publicaciones del grupo
        WITH group, $groupPublications AS publicationsData
        UNWIND publicationsData AS pub
        MERGE (publication:GroupPublication {title: pub.title, fichaId: $id})
        ON CREATE SET publication.year = pub.year, publication.authors = pub.authors, publication.summary = pub.summary
        ON MATCH SET publication.year = pub.year, publication.authors = pub.authors, publication.summary = pub.summary
        MERGE (group)-[:PUBLISHED]->(publication)

        // Crear o actualizar críticas del grupo
        WITH group, $criticism AS criticismData
        UNWIND criticismData AS crit
        MERGE (criticism:Criticism {title: crit.title, fichaId: $id})
        ON CREATE SET criticism.type = crit.type, criticism.author = crit.author, 
                      criticism.publicationDate = crit.publicationDate, 
                      criticism.link = crit.link, 
                      criticism.bibliographicReference = crit.bibliographicReference, 
                      criticism.description = crit.description,
                      criticism.text = crit.text
        ON MATCH SET criticism.type = crit.type, criticism.author = crit.author, 
                      criticism.publicationDate = crit.publicationDate, 
                      criticism.link = crit.link, 
                      criticism.bibliographicReference = crit.bibliographicReference, 
                      criticism.description = crit.description,
                      criticism.text = crit.text
        MERGE (criticism)-[:CRITICIZES_ABOUT]->(group)

        // Crear o actualizar multimedia de las críticas
        WITH group, criticism, crit
        UNWIND crit.multimedia AS critMedia
        MERGE (critMediaNode:Multimedia {link: critMedia.link, fichaId: $id})
        ON CREATE SET critMediaNode.type = critMedia.type, critMediaNode.description = critMedia.description, critMediaNode.title = critMedia.title
        ON MATCH SET critMediaNode.type = critMedia.type, critMediaNode.description = critMedia.description, critMediaNode.title = critMedia.title
        MERGE (criticism)-[:HAS_MULTIMEDIA]->(critMediaNode)
        `,
        groupingData,
      )
      .run();
  }

  async encodeWorkDescription(openAiToken: any): Promise<void> {
    const query = this.connection.query();

    await query
      .raw(
        `

        `,
        openAiToken,
      )
      .run();
  }
}
