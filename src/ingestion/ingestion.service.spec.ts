import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { IngestionService } from './ingestion.service';
import { CardReadinessService } from './services/card-readiness.service';
import { CardsService } from '../cards/cards.service';
import { Card } from '../cards/entities/card.entity';
import { IngestionCardType } from './dto/ingestion-worksheet.dto';

describe('IngestionService', () => {
  let service: IngestionService;
  let cardsService: CardsService;

  const cardsServiceMock = {
    createCard: jest.fn(),
    saveAuthorCardContent: jest.fn(),
    saveAnthologyCardContent: jest.fn(),
    saveMagazineCardContent: jest.fn(),
    saveGroupingCardContent: jest.fn(),
  };

  const readinessServiceMock = {
    getMissingFieldsForReview: jest.fn().mockReturnValue([]),
    getMissingFieldsForUpload: jest.fn().mockReturnValue([]),
  };

  const cardModelMock = {
    findById: jest.fn(),
    find: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        IngestionService,
        { provide: CardsService, useValue: cardsServiceMock },
        { provide: CardReadinessService, useValue: readinessServiceMock },
        { provide: getModelToken(Card.name), useValue: cardModelMock },
      ],
    }).compile();

    service = module.get<IngestionService>(IngestionService);
    cardsService = module.get<CardsService>(CardsService);
  });

  it('creates worksheet and saves author payload with normalization', async () => {
    const createdCard = { _id: 'card-id' };
    cardsServiceMock.createCard.mockResolvedValue(createdCard);
    cardsServiceMock.saveAuthorCardContent.mockResolvedValue({ ok: true });

    await service.createWorksheet({
      type: IngestionCardType.AuthorCard,
      title: 'Autor',
      createdBy: '507f1f77bcf86cd799439011',
    });

    expect(cardsService.createCard).toHaveBeenCalledWith({
      type: IngestionCardType.AuthorCard,
      title: 'Autor',
      createdBy: '507f1f77bcf86cd799439011',
      assignedEditors: [],
      assignedReviewers: [],
    });

    await service.saveByType(IngestionCardType.AuthorCard, 'card-id', {
      fullName: 'Autor',
      works: [
        {
          title: 'Obra',
          publicationPlace: { city: 'Bogotá', printing: 'Imprenta X' },
          editions: [
            {
              publicationPlace: { city: 'Bogotá', printing: 'Imprenta Y' },
            },
          ],
        },
      ],
    });

    expect(cardsService.saveAuthorCardContent).toHaveBeenCalledWith(
      'card-id',
      expect.objectContaining({
        works: [
          {
            title: 'Obra',
            publicationPlace: {
              city: 'Bogotá',
              printingHouse: 'Imprenta X',
            },
            editions: [
              {
                publicationPlace: {
                  city: 'Bogotá',
                  printingHouse: 'Imprenta Y',
                },
              },
            ],
          },
        ],
      }),
    );
  });

  it('normalizes magazine publicationPlace.printing into printingHouse', async () => {
    cardsServiceMock.saveMagazineCardContent.mockResolvedValue({ ok: true });

    await service.saveByType(IngestionCardType.MagazineCard, 'card-id', {
      magazineTitle: 'Revista',
      publicationPlace: {
        city: 'Medellín',
        printing: 'Imprenta Z',
      },
    });

    expect(cardsService.saveMagazineCardContent).toHaveBeenCalledWith(
      'card-id',
      {
        magazineTitle: 'Revista',
        publicationPlace: {
          city: 'Medellín',
          printingHouse: 'Imprenta Z',
        },
      },
    );
  });
});
