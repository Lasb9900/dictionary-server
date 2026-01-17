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

    const familiares = authorData.relatives
      .map((familiar) => `${familiar.relationship}: ${familiar.name}`)
      .join(', ');
    authorData.relatives = familiares;

    await query
      .raw(
        `
    // Crear o actualizar el nodo del autor
        MERGE (card:Author {fichaId: $id})
        ON CREATE SET card.fullName = COALESCE($fullName, 'No hay información'),  
                    card.pseudonym = COALESCE($pseudonym, 'No hay información'), 
                    card.dateOfBirth = COALESCE($dateOfBirth, 'No hay información'), 
                    card.dateOfDeath = COALESCE($dateOfDeath, 'No hay información'), 
                    card.placeOfBirth = COALESCE($placeOfBirth, 'No hay información'), 
                    card.placeOfDeath = COALESCE($placeOfDeath, 'No hay información'), 
                    card.gender = COALESCE($gender, 'No hay información'), 
                    card.relevantActivities = COALESCE($relevantActivities, 'No hay información'), 
                    card.mainTheme = COALESCE($mainTheme, 'No hay información'), 
                    card.mainGenre = COALESCE($mainGenre, 'No hay información'), 
                    card.context = COALESCE($context, 'No hay información'),
                    card.relatives = COALESCE($relatives, 'No hay información'),
                    card.text = COALESCE($text, 'No hay información')
        ON MATCH SET card.fullName = COALESCE($fullName, 'No hay información'),
                    card.pseudonym = COALESCE($pseudonym, 'No hay información'), 
                    card.dateOfBirth = COALESCE($dateOfBirth, 'No hay información'), 
                    card.dateOfDeath = COALESCE($dateOfDeath, 'No hay información'), 
                    card.placeOfBirth = COALESCE($placeOfBirth, 'No hay información'), 
                    card.placeOfDeath = COALESCE($placeOfDeath, 'No hay información'), 
                    card.gender = COALESCE($gender, 'No hay información'), 
                    card.relevantActivities = COALESCE($relevantActivities, 'No hay información'), 
                    card.mainTheme = COALESCE($mainTheme, 'No hay información'), 
                    card.mainGenre = COALESCE($mainGenre, 'No hay información'), 
                    card.context = COALESCE($context, 'No hay información'),
                    card.relatives = COALESCE($relatives, 'No hay información'),
                    card.text = COALESCE($text, 'No hay información')

        // Crear nodos multimedia relacionados con el autor si multimedia no es vacío
        WITH card, $multimedia AS multimediaData
        FOREACH (media IN CASE WHEN size(multimediaData) > 0 THEN multimediaData ELSE [] END | 
            MERGE (mediaNode:Multimedia {link: media.link, fichaId: $id})
            ON CREATE SET mediaNode.type = COALESCE(media.type, 'No hay información'), 
                            mediaNode.description = COALESCE(media.description, 'No hay información'),
                            mediaNode.title = COALESCE(media.title, 'No hay información')
            ON MATCH SET mediaNode.type = COALESCE(media.type, 'No hay información'), 
                            mediaNode.description = COALESCE(media.description, 'No hay información'),
                            mediaNode.title = COALESCE(media.title, 'No hay información')
            MERGE (card)-[:HAS_MULTIMEDIA]->(mediaNode)
        )

        // Crear nodos de obras
        WITH card, $works AS worksData
        FOREACH (workData IN CASE WHEN size(worksData) > 0 THEN worksData ELSE [] END |
            MERGE (work:Work {title: workData.title, fichaId: $id})
            ON CREATE SET work.originalLanguage = COALESCE(workData.originalLanguage, 'No hay información'), 
                            work.genre = COALESCE(workData.genre, 'No hay información'), 
                            work.publicationDate = COALESCE(workData.publicationDate, 'No hay información'), 
                            work.description = COALESCE(workData.description, 'No hay información'),
                            work.text = COALESCE(workData.text, 'No hay información')
            ON MATCH SET work.originalLanguage = COALESCE(workData.originalLanguage, 'No hay información'), 
                            work.genre = COALESCE(workData.genre, 'No hay información'), 
                            work.publicationDate = COALESCE(workData.publicationDate, 'No hay información'), 
                            work.description = COALESCE(workData.description, 'No hay información'),
                            work.text = COALESCE(workData.text, 'No hay información')
            FOREACH (_ IN CASE WHEN workData.embedding IS NOT NULL THEN [1] ELSE [] END |
                SET work.descriptionEmbedding = workData.embedding
            )
            MERGE (card)-[:CREATED]->(work)

            // Crear o actualizar el lugar de publicación de la obra
            FOREACH (_ IN CASE WHEN workData.publicationPlace IS NOT NULL THEN [1] ELSE [] END | 
                MERGE (place:Publication {fichaId: $id, city: workData.publicationPlace.city, printingHouse: workData.publicationPlace.printingHouse, publisher: workData.publicationPlace.publisher})
                ON CREATE SET place.city = COALESCE(workData.publicationPlace.city, 'No hay información'), 
                            place.printingHouse = COALESCE(workData.publicationPlace.printingHouse, 'No hay información'), 
                            place.publisher = COALESCE(workData.publicationPlace.publisher, 'No hay información')
                ON MATCH SET place.city = COALESCE(workData.publicationPlace.city, 'No hay información'), 
                            place.printingHouse = COALESCE(workData.publicationPlace.printingHouse, 'No hay información'), 
                            place.publisher = COALESCE(workData.publicationPlace.publisher, 'No hay información')
                MERGE (work)-[:PUBLISHED_IN]->(place)
            )

            // Crear ediciones de la obra
            FOREACH (editionData IN CASE WHEN size(workData.editions) > 0 THEN workData.editions ELSE [] END |
                MERGE (edition:Edition {fichaId: $id, editionTitle: editionData.editionTitle, publicationDate: editionData.publicationDate})
                ON CREATE SET edition.language = COALESCE(editionData.language, 'No hay información'), 
                            edition.translator = COALESCE(editionData.translator, 'No hay información')
                ON MATCH SET edition.language = COALESCE(editionData.language, 'No hay información'), 
                            edition.translator = COALESCE(editionData.translator, 'No hay información')

                // Crear o actualizar el lugar de publicación de la edición
                FOREACH (_ IN CASE WHEN editionData.publicationPlace IS NOT NULL THEN [1] ELSE [] END | 
                    MERGE (editionPlace:Publication {fichaId: $id, city: editionData.publicationPlace.city, printingHouse: editionData.publicationPlace.printingHouse, publisher: editionData.publicationPlace.publisher})
                    ON CREATE SET editionPlace.city = COALESCE(editionData.publicationPlace.city, 'No hay información'), 
                                    editionPlace.printingHouse = COALESCE(editionData.publicationPlace.printingHouse, 'No hay información'), 
                                    editionPlace.publisher = COALESCE(editionData.publicationPlace.publisher, 'No hay información')
                    ON MATCH SET editionPlace.city = COALESCE(editionData.publicationPlace.city, 'No hay información'), 
                                    editionPlace.printingHouse = COALESCE(editionData.publicationPlace.printingHouse, 'No hay información'), 
                                    editionPlace.publisher = COALESCE(editionData.publicationPlace.publisher, 'No hay información')
                    MERGE (edition)-[:PUBLISHED_IN]->(editionPlace)
                )

                // Relacionar la edición con la obra
                MERGE (work)-[:HAS_EDITION]->(edition)
            )

            // Crear multimedia de la obra
            FOREACH (workMedia IN CASE WHEN workData.multimedia IS NOT NULL AND size(workData.multimedia) > 0 THEN workData.multimedia ELSE [] END | 
                MERGE (workMediaNode:Multimedia {link: workMedia.link, fichaId: $id})
                ON CREATE SET workMediaNode.type = COALESCE(workMedia.type, 'No hay información'), 
                            workMediaNode.description = COALESCE(workMedia.description, 'No hay información'),
                            workMediaNode.title = COALESCE(workMedia.title, 'No hay información')
                ON MATCH SET workMediaNode.type = COALESCE(workMedia.type, 'No hay información'), 
                            workMediaNode.description = COALESCE(workMedia.description, 'No hay información'),
                            workMediaNode.title = COALESCE(workMedia.title, 'No hay información')
                MERGE (work)-[:HAS_MULTIMEDIA]->(workMediaNode)
            )
        )

        // Crear críticas
        WITH card, $criticism AS criticismData
        FOREACH (crit IN CASE WHEN size(criticismData) > 0 THEN criticismData ELSE [] END |
            MERGE (criticism:Criticism {title: crit.title, fichaId: $id})
            ON CREATE SET criticism.type = COALESCE(crit.type, 'No hay información'), 
                            criticism.author = COALESCE(crit.author, 'No hay información'), 
                            criticism.publicationDate = COALESCE(crit.publicationDate, 'No hay información'), 
                            criticism.link = COALESCE(crit.link, 'No hay información'), 
                            criticism.bibliographicReference = COALESCE(crit.bibliographicReference, 'No hay información'), 
                            criticism.description = COALESCE(crit.description, 'No hay información'),
                            criticism.text = COALESCE(crit.text, 'No hay información')
            ON MATCH SET criticism.type = COALESCE(crit.type, 'No hay información'), 
                            criticism.author = COALESCE(crit.author, 'No hay información'), 
                            criticism.publicationDate = COALESCE(crit.publicationDate, 'No hay información'), 
                            criticism.link = COALESCE(crit.link, 'No hay información'), 
                            criticism.bibliographicReference = COALESCE(crit.bibliographicReference, 'No hay información'), 
                            criticism.description = COALESCE(crit.description, 'No hay información'),
                            criticism.text = COALESCE(crit.text, 'No hay información')
            MERGE (criticism)-[:CRITICIZES_ABOUT]->(card)

            // Crear multimedia de las críticas
            FOREACH (critMedia IN CASE WHEN crit.multimedia IS NOT NULL AND size(crit.multimedia) > 0 THEN crit.multimedia ELSE [] END |
                MERGE (critMediaNode:Multimedia {link: critMedia.link, fichaId: $id})
                ON CREATE SET critMediaNode.type = COALESCE(critMedia.type, 'No hay información'), 
                            critMediaNode.description = COALESCE(critMedia.description, 'No hay información'),
                            critMediaNode.title = COALESCE(critMedia.title, 'No hay información')
                ON MATCH SET critMediaNode.type = COALESCE(critMedia.type, 'No hay información'), 
                            critMediaNode.description = COALESCE(critMedia.description, 'No hay información'),
                            critMediaNode.title = COALESCE(critMedia.title, 'No hay información')
                MERGE (criticism)-[:HAS_MULTIMEDIA]->(critMediaNode)
            )
        )
        
      `,
        authorData,
      )
      .run();
  }

  async createMagazineCardNodes(magazineData: any): Promise<void> {
    const query = this.connection.query();

    const creators = magazineData.creators
      .map((creator) => `${creator.role}: ${creator.name}`)
      .join(', ');
    magazineData.creators = creators;

    await query
      .raw(
        `
        // Crear o actualizar el nodo de la revista
        MERGE (magazine:Magazine {fichaId: $id})
        ON CREATE SET 
            magazine.magazineTitle = COALESCE($magazineTitle, 'No hay información'), 
            magazine.originalLanguage = COALESCE($originalLanguage, 'No hay información'),
            magazine.firstIssueDate = COALESCE($firstIssueDate, 'No hay información'),
            magazine.lastIssueDate = COALESCE($lastIssueDate, 'No hay información'),
            magazine.issuesPublished = COALESCE($issuesPublished, 'No hay información'),
            magazine.bibliographicReference = COALESCE($bibliographicReference, 'No hay información'),
            magazine.link = COALESCE($link, 'No hay información'),
            magazine.sections = COALESCE($sections, 'No hay información'),
            magazine.description = COALESCE($description, 'No hay información'),
            magazine.creators = COALESCE($creators, 'No hay información'),
            magazine.text = COALESCE($text, 'No hay información')
        ON MATCH SET 
            magazine.magazineTitle = COALESCE($magazineTitle, 'No hay información'), 
            magazine.originalLanguage = COALESCE($originalLanguage, 'No hay información'),
            magazine.firstIssueDate = COALESCE($firstIssueDate, 'No hay información'),
            magazine.lastIssueDate = COALESCE($lastIssueDate, 'No hay información'),
            magazine.issuesPublished = COALESCE($issuesPublished, 'No hay información'),
            magazine.bibliographicReference = COALESCE($bibliographicReference, 'No hay información'),
            magazine.link = COALESCE($link, 'No hay información'), 
            magazine.sections = COALESCE($sections, 'No hay información'), 
            magazine.description = COALESCE($description, 'No hay información'),
            magazine.creators = COALESCE($creators, 'No hay información'),
            magazine.text = COALESCE($text, 'No hay información')

        // Crear o actualizar el lugar de publicación de la revista
        WITH magazine, $publicationPlace AS pubPlace
        FOREACH (_ IN CASE WHEN pubPlace IS NOT NULL THEN [1] ELSE [] END | 
        MERGE (place:Publication {fichaId: $id, city: pubPlace.city})
            ON CREATE SET 
                place.city = COALESCE(pubPlace.city, "Desconocido"), 
                place.publisher = COALESCE(pubPlace.publisher, "Desconocido"),
                place.printingHouse = COALESCE(pubPlace.printingHouse, "Desconocido")
            ON MATCH SET 
                place.city = COALESCE(pubPlace.city, "Desconocido"), 
                place.publisher = COALESCE(pubPlace.publisher, "Desconocido"),
                place.printingHouse = COALESCE(pubPlace.printingHouse, "Desconocido")
            MERGE (magazine)-[:PUBLISHED_IN]->(place)
        )

        // Crear o actualizar multimedia de la revista si multimedia no es vacío
        WITH magazine, $multimedia AS multimediaData
        FOREACH (media IN CASE WHEN size(multimediaData) > 0 THEN multimediaData ELSE [] END | 
            MERGE (mediaNode:Multimedia {link: media.link, fichaId: $id})
            ON CREATE SET 
                mediaNode.type = COALESCE(media.type, 'No hay información'), 
                mediaNode.description = COALESCE(media.description, 'No hay información'), 
                mediaNode.title = COALESCE(media.title, 'No hay información')
            ON MATCH SET 
                mediaNode.type = COALESCE(media.type, 'No hay información'), 
                mediaNode.description = COALESCE(media.description, 'No hay información'), 
                mediaNode.title = COALESCE(media.title, 'No hay información')
            MERGE (magazine)-[:HAS_MULTIMEDIA]->(mediaNode)
        )

        // Crear o actualizar críticas de la revista
        WITH magazine, $criticism AS criticismData
        FOREACH (crit IN CASE WHEN size(criticismData) > 0 THEN criticismData ELSE [] END |
            MERGE (criticism:Criticism {title: crit.title, fichaId: $id})
            ON CREATE SET 
                criticism.type = COALESCE(crit.type, 'No hay información'), 
                criticism.author = COALESCE(crit.author, 'No hay información'), 
                criticism.publicationDate = COALESCE(crit.publicationDate, 'No hay información'), 
                criticism.link = COALESCE(crit.link, 'No hay información'), 
                criticism.bibliographicReference = COALESCE(crit.bibliographicReference, 'No hay información'), 
                criticism.description = COALESCE(crit.description, 'No hay información'),
                criticism.text = COALESCE(crit.text, 'No hay información')
            ON MATCH SET 
                criticism.type = COALESCE(crit.type, 'No hay información'), 
                criticism.author = COALESCE(crit.author, 'No hay información'), 
                criticism.publicationDate = COALESCE(crit.publicationDate, 'No hay información'), 
                criticism.link = COALESCE(crit.link, 'No hay información'), 
                criticism.bibliographicReference = COALESCE(crit.bibliographicReference, 'No hay información'), 
                criticism.description = COALESCE(crit.description, 'No hay información'),
                criticism.text = COALESCE(crit.text, 'No hay información')
            MERGE (criticism)-[:CRITICIZES_ABOUT]->(magazine)
            
            // Crear o actualizar multimedia de las críticas si multimedia no es vacío
            FOREACH (critMedia IN CASE WHEN crit.multimedia IS NOT NULL AND size(crit.multimedia) > 0 THEN crit.multimedia ELSE [] END |
                MERGE (critMediaNode:Multimedia {link: critMedia.link, fichaId: $id})
                ON CREATE SET 
                    critMediaNode.type = COALESCE(critMedia.type, 'No hay información'), 
                    critMediaNode.description = COALESCE(critMedia.description, 'No hay información'),
                    critMediaNode.title = COALESCE(critMedia.title, 'No hay información')
                ON MATCH SET 
                    critMediaNode.type = COALESCE(critMedia.type, 'No hay información'), 
                    critMediaNode.description = COALESCE(critMedia.description, 'No hay información'),
                    critMediaNode.title = COALESCE(critMedia.title, 'No hay información')
                MERGE (criticism)-[:HAS_MULTIMEDIA]->(critMediaNode)
            )
        )
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
        ON CREATE SET 
            anthology.title = COALESCE($anthologyTitle, 'No hay información'), 
            anthology.genre = COALESCE($genre, 'No hay información'), 
            anthology.author = COALESCE($author, 'No hay información'), 
            anthology.originalLanguage = COALESCE($originalLanguage, 'No hay información'), 
            anthology.publicationDate = COALESCE($publicationDate, 'No hay información'), 
            anthology.description = COALESCE($description, 'No hay información'),
            anthology.text = COALESCE($text, 'No hay información')
        ON MATCH SET 
            anthology.title = COALESCE($anthologyTitle, 'No hay información'), 
            anthology.genre = COALESCE($genre, 'No hay información'), 
            anthology.author = COALESCE($author, 'No hay información'), 
            anthology.originalLanguage = COALESCE($originalLanguage, 'No hay información'), 
            anthology.publicationDate = COALESCE($publicationDate, 'No hay información'), 
            anthology.description = COALESCE($description, 'No hay información'),
            anthology.text = COALESCE($text, 'No hay información')

        // Crear o actualizar el lugar de publicación de la antología
        WITH anthology, $publicationPlace AS pubPlace
        FOREACH (_ IN CASE WHEN pubPlace IS NOT NULL THEN [1] ELSE [] END | 
        MERGE (place:Publication {fichaId: $id, city: pubPlace.city})
            ON CREATE SET 
                place.city = COALESCE(pubPlace.city, "Desconocido"), 
                place.publisher = COALESCE(pubPlace.publisher, "Desconocido"),
                place.printingHouse = COALESCE(pubPlace.printingHouse, "Desconocido")
            ON MATCH SET 
                place.city = COALESCE(pubPlace.city, "Desconocido"), 
                place.publisher = COALESCE(pubPlace.publisher, "Desconocido"),
                place.printingHouse = COALESCE(pubPlace.printingHouse, "Desconocido")
            MERGE (anthology)-[:PUBLISHED_IN]->(place)
        )

        // Crear o actualizar multimedia de la antología si multimedia no es vacío
        WITH anthology, $multimedia AS multimediaData
        FOREACH (media IN CASE WHEN size(multimediaData) > 0 THEN multimediaData ELSE [] END | 
            MERGE (mediaNode:Multimedia {link: media.link, fichaId: $id})
            ON CREATE SET 
                mediaNode.type = COALESCE(media.type, 'No hay información'), 
                mediaNode.description = COALESCE(media.description, 'No hay información'), 
                mediaNode.title = COALESCE(media.title, 'No hay información')
            ON MATCH SET 
                mediaNode.type = COALESCE(media.type, 'No hay información'), 
                mediaNode.description = COALESCE(media.description, 'No hay información'), 
                mediaNode.title = COALESCE(media.title, 'No hay información')
            MERGE (anthology)-[:HAS_MULTIMEDIA]->(mediaNode)
        )

        // Crear o actualizar críticas de la antología
        WITH anthology, $criticism AS criticismData
        FOREACH (crit IN CASE WHEN size(criticismData) > 0 THEN criticismData ELSE [] END |
            MERGE (criticism:Criticism {title: crit.title, fichaId: $id})
            ON CREATE SET 
                criticism.type = COALESCE(crit.type, 'No hay información'), 
                criticism.author = COALESCE(crit.author, 'No hay información'), 
                criticism.publicationDate = COALESCE(crit.publicationDate, 'No hay información'), 
                criticism.link = COALESCE(crit.link, 'No hay información'), 
                criticism.bibliographicReference = COALESCE(crit.bibliographicReference, 'No hay información'), 
                criticism.description = COALESCE(crit.description, 'No hay información'),
                criticism.text = COALESCE(crit.text, 'No hay información')
            ON MATCH SET 
                criticism.type = COALESCE(crit.type, 'No hay información'), 
                criticism.author = COALESCE(crit.author, 'No hay información'), 
                criticism.publicationDate = COALESCE(crit.publicationDate, 'No hay información'), 
                criticism.link = COALESCE(crit.link, 'No hay información'), 
                criticism.bibliographicReference = COALESCE(crit.bibliographicReference, 'No hay información'), 
                criticism.description = COALESCE(crit.description, 'No hay información'),
                criticism.text = COALESCE(crit.text, 'No hay información')
            MERGE (criticism)-[:CRITICIZES_ABOUT]->(anthology)
            
            // Crear o actualizar multimedia de las críticas si multimedia no es vacío
            FOREACH (critMedia IN CASE WHEN crit.multimedia IS NOT NULL AND size(crit.multimedia) > 0 THEN crit.multimedia ELSE [] END |
                MERGE (critMediaNode:Multimedia {link: critMedia.link, fichaId: $id})
                ON CREATE SET 
                    critMediaNode.type = COALESCE(critMedia.type, 'No hay información'), 
                    critMediaNode.description = COALESCE(critMedia.description, 'No hay información'),
                    critMediaNode.title = COALESCE(critMedia.title, 'No hay información')
                ON MATCH SET 
                    critMediaNode.type = COALESCE(critMedia.type, 'No hay información'), 
                    critMediaNode.description = COALESCE(critMedia.description, 'No hay información'),
                    critMediaNode.title = COALESCE(critMedia.title, 'No hay información')
                MERGE (criticism)-[:HAS_MULTIMEDIA]->(critMediaNode)
            )
        )
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
        ON CREATE SET 
            group.name = COALESCE($name, 'No hay información'), 
            group.startDate = COALESCE($startDate, 'No hay información'), 
            group.endDate = COALESCE($endDate, 'No hay información'), 
            group.generalCharacteristics = COALESCE($generalCharacteristics, 'No hay información'), 
            group.groupActivities = COALESCE($groupActivities, 'No hay información'),
            group.text = COALESCE($text, 'No hay información')
        ON MATCH SET 
            group.name = COALESCE($name, 'No hay información'), 
            group.startDate = COALESCE($startDate, 'No hay información'), 
            group.endDate = COALESCE($endDate, 'No hay información'), 
            group.generalCharacteristics = COALESCE($generalCharacteristics, 'No hay información'), 
            group.groupActivities = COALESCE($groupActivities, 'No hay información'),
            group.text = COALESCE($text, 'No hay información')

        // Crear o actualizar el lugar de reuniones del grupo
        WITH group, $meetingPlace AS meetingPlaceData
        FOREACH (_ IN CASE WHEN meetingPlaceData IS NOT NULL THEN [1] ELSE [] END | 
            MERGE (place:MeetingPlace {fichaId: $id})
            ON CREATE SET 
                place.city = COALESCE(meetingPlaceData.city, 'No hay información'),
                place.municipality = COALESCE(meetingPlaceData.municipality, "Desconocido")
            ON MATCH SET 
                place.city = COALESCE(meetingPlaceData.city, 'No hay información'),
                place.municipality = COALESCE(meetingPlaceData.municipality, "Desconocido")
            MERGE (group)-[:MET_IN]->(place)
        )

        // Crear o actualizar multimedia del grupo si multimedia no es vacío
        WITH group, $multimedia AS multimediaData
        FOREACH (media IN CASE WHEN size(multimediaData) > 0 THEN multimediaData ELSE [] END | 
            MERGE (mediaNode:Multimedia {link: media.link, fichaId: $id})
            ON CREATE SET 
                mediaNode.type = COALESCE(media.type, 'No hay información'), 
                mediaNode.description = COALESCE(media.description, 'No hay información'),
                mediaNode.title = COALESCE(media.title, 'No hay información')
            ON MATCH SET 
                mediaNode.type = COALESCE(media.type, 'No hay información'), 
                mediaNode.description = COALESCE(media.description, 'No hay información'),
                mediaNode.title = COALESCE(media.title, 'No hay información')
            MERGE (group)-[:HAS_MULTIMEDIA]->(mediaNode)
        )

        // Crear o actualizar publicaciones del grupo y sus validaciones
        WITH group, $groupPublications AS publicationsData
        FOREACH (pub IN CASE WHEN size(publicationsData) > 0 THEN publicationsData ELSE [] END |
            MERGE (publication:GroupPublication {title: pub.title, fichaId: $id})
            ON CREATE SET 
                publication.year = COALESCE(pub.year, 'No hay información'), 
                publication.authors = COALESCE(pub.authors, 'No hay información'), 
                publication.summary = COALESCE(pub.summary, 'No hay información')
            ON MATCH SET 
                publication.year = COALESCE(pub.year, 'No hay información'), 
                publication.authors = COALESCE(pub.authors, 'No hay información'), 
                publication.summary = COALESCE(pub.summary, 'No hay información')
            MERGE (group)-[:PUBLISHED]->(publication)
        )

        // Crear o actualizar críticas del grupo y sus multimedia
        WITH group, $criticism AS criticismData
        FOREACH (crit IN CASE WHEN size(criticismData) > 0 THEN criticismData ELSE [] END |
            MERGE (criticism:Criticism {title: crit.title, fichaId: $id})
            ON CREATE SET 
                criticism.type = COALESCE(crit.type, 'No hay información'), 
                criticism.author = COALESCE(crit.author, 'No hay información'), 
                criticism.publicationDate = COALESCE(crit.publicationDate, 'No hay información'), 
                criticism.link = COALESCE(crit.link, 'No hay información'), 
                criticism.bibliographicReference = COALESCE(crit.bibliographicReference, 'No hay información'), 
                criticism.description = COALESCE(crit.description, 'No hay información'),
                criticism.text = COALESCE(crit.text, 'No hay información')
            ON MATCH SET 
                criticism.type = COALESCE(crit.type, 'No hay información'), 
                criticism.author = COALESCE(crit.author, 'No hay información'), 
                criticism.publicationDate = COALESCE(crit.publicationDate, 'No hay información'), 
                criticism.link = COALESCE(crit.link, 'No hay información'), 
                criticism.bibliographicReference = COALESCE(crit.bibliographicReference, 'No hay información'), 
                criticism.description = COALESCE(crit.description, 'No hay información'),
                criticism.text = COALESCE(crit.text, 'No hay información')
            MERGE (criticism)-[:CRITICIZES_ABOUT]->(group)
            
            // Crear o actualizar multimedia de las críticas si multimedia no es vacío
            FOREACH (critMedia IN CASE WHEN crit.multimedia IS NOT NULL AND size(crit.multimedia) > 0 THEN crit.multimedia ELSE [] END |
                MERGE (critMediaNode:Multimedia {link: critMedia.link, fichaId: $id})
                ON CREATE SET 
                    critMediaNode.type = COALESCE(critMedia.type, 'No hay información'), 
                    critMediaNode.description = COALESCE(critMedia.description, 'No hay información'),
                    critMediaNode.title = COALESCE(critMedia.title, 'No hay información')
                ON MATCH SET 
                    critMediaNode.type = COALESCE(critMedia.type, 'No hay información'), 
                    critMediaNode.description = COALESCE(critMedia.description, 'No hay información'),
                    critMediaNode.title = COALESCE(critMedia.title, 'No hay información')
                MERGE (criticism)-[:HAS_MULTIMEDIA]->(critMediaNode)
            )
        )
        `,
        groupingData,
      )
      .run();
  }

  async createMythLegendCardNodes(mythLegendData: any): Promise<void> {
    const query = this.connection.query();

    await query
      .raw(
        `
            // Crear o actualizar el nodo del mito o leyenda
            MERGE (mythLegend:MythLegend {fichaId: $id})
            ON CREATE SET 
                mythLegend.title = COALESCE($mlTitle, 'No hay información'),
                mythLegend.type = COALESCE($mlType, 'No hay información'), 
                mythLegend.creatorCommunity = COALESCE($creatorCommunity, 'No hay información'), 
                mythLegend.diffusionPlace = COALESCE($diffusionPlace, 'No hay información'), 
                mythLegend.originalLanguage = COALESCE($originalLanguage, 'No hay información'), 
                mythLegend.fullText = COALESCE($fullText, 'No hay información'), 
                mythLegend.mainTheme = COALESCE($mainTheme, 'No hay información'), 
                mythLegend.description = COALESCE($description, 'No hay información')
            ON MATCH SET 
                mythLegend.title = COALESCE($mlTitle, 'No hay información'), 
                mythLegend.type = COALESCE($mlType, 'No hay información'),
                mythLegend.creatorCommunity = COALESCE($creatorCommunity, 'No hay información'), 
                mythLegend.diffusionPlace = COALESCE($diffusionPlace, 'No hay información'), 
                mythLegend.originalLanguage = COALESCE($originalLanguage, 'No hay información'), 
                mythLegend.fullText = COALESCE($fullText, 'No hay información'), 
                mythLegend.mainTheme = COALESCE($mainTheme, 'No hay información'), 
                mythLegend.description = COALESCE($description, 'No hay información')

            // Crear o actualizar multimedia del mito o leyenda si multimedia no es vacío
            WITH mythLegend, $multimedia AS multimediaData
            FOREACH (media IN CASE WHEN size(multimediaData) > 0 THEN multimediaData ELSE [] END | 
                MERGE (mediaNode:Multimedia {link: media.link, fichaId: $id})
                ON CREATE SET 
                    mediaNode.type = COALESCE(media.type, 'No hay información'), 
                    mediaNode.description = COALESCE(media.description, 'No hay información'), 
                    mediaNode.title = COALESCE(media.title, 'No hay información')
                ON MATCH SET 
                    mediaNode.type = COALESCE(media.type, 'No hay información'), 
                    mediaNode.description = COALESCE(media.description, 'No hay información'), 
                    mediaNode.title = COALESCE(media.title, 'No hay información')
                MERGE (mythLegend)-[:HAS_MULTIMEDIA]->(mediaNode)
            )

            // Crear o actualizar críticas del mito o leyenda
            WITH mythLegend, $criticism AS criticismData
            FOREACH (crit IN CASE WHEN size(criticismData) > 0 THEN criticismData ELSE [] END |
                MERGE (criticism:Criticism {title: crit.title, fichaId: $id})
                ON CREATE SET 
                    criticism.type = COALESCE(crit.type, 'No hay información'), 
                    criticism.author = COALESCE(crit.author, 'No hay información'), 
                    criticism.publicationDate = COALESCE(crit.publicationDate, 'No hay información'), 
                    criticism.link = COALESCE(crit.link, 'No hay información'), 
                    criticism.bibliographicReference = COALESCE(crit.bibliographicReference, 'No hay información'), 
                    criticism.description = COALESCE(crit.description, 'No hay información'), 
                    criticism.text = COALESCE(crit.text, 'No hay información')
                ON MATCH SET 
                    criticism.type = COALESCE(crit.type, 'No hay información'), 
                    criticism.author = COALESCE(crit.author, 'No hay información'), 
                    criticism.publicationDate = COALESCE(crit.publicationDate, 'No hay información'), 
                    criticism.link = COALESCE(crit.link, 'No hay información'), 
                    criticism.bibliographicReference = COALESCE(crit.bibliographicReference, 'No hay información'), 
                    criticism.description = COALESCE(crit.description, 'No hay información'), 
                    criticism.text = COALESCE(crit.text, 'No hay información')
                MERGE (criticism)-[:CRITICIZES_ABOUT]->(mythLegend)
                
                // Crear o actualizar multimedia de las críticas si multimedia no es vacío
                FOREACH (critMedia IN CASE WHEN crit.multimedia IS NOT NULL AND size(crit.multimedia) > 0 THEN crit.multimedia ELSE [] END |
                    MERGE (critMediaNode:Multimedia {link: critMedia.link, fichaId: $id})
                    ON CREATE SET 
                        critMediaNode.type = COALESCE(critMedia.type, 'No hay información'), 
                        critMediaNode.description = COALESCE(critMedia.description, 'No hay información'), 
                        critMediaNode.title = COALESCE(critMedia.title, 'No hay información')
                    ON MATCH SET 
                        critMediaNode.type = COALESCE(critMedia.type, 'No hay información'), 
                        critMediaNode.description = COALESCE(critMedia.description, 'No hay información'), 
                        critMediaNode.title = COALESCE(critMedia.title, 'No hay información')
                    MERGE (criticism)-[:HAS_MULTIMEDIA]->(critMediaNode)
                )
            )
            `,
        mythLegendData,
      )
      .run();
  }

  async encodeWorkDescription(): Promise<void> {
    return;
  }
}
