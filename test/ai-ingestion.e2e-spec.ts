import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { AiController } from '../src/ai/ai.controller';
import { AiModule } from '../src/ai/ai.module';
import { CardsController } from '../src/cards/cards.controller';
import { CardsService } from '../src/cards/cards.service';
import { IngestionController } from '../src/ingestion/ingestion.controller';
import { IngestionService } from '../src/ingestion/ingestion.service';
import { ConfigModule } from '@nestjs/config';
import { EnvConfiguration } from '../src/config/env.config';

jest.mock('@nestjs/passport', () => ({
  AuthGuard: () =>
    class MockAuthGuard {
      canActivate(context: any) {
        const request = context.switchToHttp().getRequest();
        const authHeader = request.headers.authorization ?? '';
        if (!authHeader.startsWith('Bearer ')) {
          return false;
        }
        request.user = {
          _id: 'test-user',
          roles: ['researcher'],
        };
        return true;
      }
    },
}));

describe('AI + Ingestion (e2e)', () => {
  let app: INestApplication;
  const cardsStore = new Map<string, any>();
  let cardSequence = 1;

  const mockCardsService = {
    createCard: jest.fn((dto: any) => {
      const id = `card-${cardSequence++}`;
      const card = {
        _id: id,
        type: dto.type,
        title: dto.title,
        status: 'PENDING_EDIT',
      };
      cardsStore.set(id, card);
      return card;
    }),
    findAllPendingReviewCards: jest.fn(() =>
      Array.from(cardsStore.values()).filter(
        (card) => card.status === 'PENDING_REVIEW',
      ),
    ),
  };

  const mockIngestionService = {
    autoOrchestrate: jest.fn(
      (
        type: string,
        id: string,
        payload: Record<string, unknown>,
        options?: { autoReview?: boolean },
      ) => {
        const card = cardsStore.get(id);
        if (card && options?.autoReview) {
          card.status = 'PENDING_REVIEW';
        }
        return { id };
      },
    ),
  };

  beforeAll(async () => {
    process.env.AI_TEST_MODE = 'true';
    process.env.AI_PROVIDER = 'ollama';
    process.env.OLLAMA_BASE_URL = 'http://localhost:11434';

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ isGlobal: true, load: [EnvConfiguration] }),
        AiModule,
      ],
      controllers: [IngestionController, CardsController],
      providers: [
        {
          provide: IngestionService,
          useValue: mockIngestionService,
        },
        {
          provide: CardsService,
          useValue: mockCardsService,
        },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
      }),
    );
    await app.init();
  });

  beforeEach(() => {
    cardsStore.clear();
    cardSequence = 1;
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /api/ai/health responds with JWT', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/ai/health')
      .set('Authorization', 'Bearer test-token')
      .expect(200);

    expect(response.body).toEqual(
      expect.objectContaining({
        defaultProvider: 'ollama',
        geminiConfigured: false,
        ollamaConfigured: true,
        ollamaReachable: false,
      }),
    );
  });

  it('POST /api/ai/test returns providerUsed and output', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/ai/test')
      .set('Authorization', 'Bearer test-token')
      .send({ prompt: 'hola', provider: 'ollama' })
      .expect(201);

    expect(response.body).toEqual(
      expect.objectContaining({
        providerUsed: 'ollama',
        output: '[ai-test:ollama] hola',
      }),
    );
    expect(response.body.latencyMs).toBeGreaterThanOrEqual(0);
  });

  it('POST /api/cards -> auto-orchestrate updates status', async () => {
    const createResponse = await request(app.getHttpServer())
      .post('/api/cards')
      .send({
        type: 'AuthorCard',
        title: 'Gabriela Mistral',
        createdBy: '507f1f77bcf86cd799439011',
        assignedEditors: ['507f1f77bcf86cd799439012'],
        assignedReviewers: ['507f1f77bcf86cd799439013'],
      })
      .expect(201);

    const cardId = createResponse.body._id;

    await request(app.getHttpServer())
      .post(`/api/ingestion/AuthorCard/${cardId}/auto-orchestrate`)
      .set('Authorization', 'Bearer test-token')
      .set('x-ai-provider', 'ollama')
      .send({
        options: { autoReview: true },
        payload: { fullName: 'Gabriela Mistral' },
      })
      .expect(201);

    const pendingReview = await request(app.getHttpServer())
      .get('/api/cards/status/pending-review')
      .expect(200);

    expect(pendingReview.body).toEqual(
      expect.arrayContaining([expect.objectContaining({ _id: cardId })]),
    );
  });
});
