import request from 'supertest';
import app from '../src/app';
import prisma from '../src/config/prisma';

describe('MailCraft AI API Test Suite', () => {
  const testEmail = `harsh_test_${Date.now()}@example.com`;
  const testPassword = 'Password123!';
  let authToken = '';
  let userId = '';
  let createdDraftId = '';
  let createdReviewId = '';

  afterAll(async () => {
    // Cleanup test user and cascaded records
    if (userId) {
      await prisma.user.delete({ where: { id: userId } }).catch(() => {});
    }
    await prisma.$disconnect();
  });

  describe('Health Check', () => {
    it('GET /api/health should return 200 with service and author details', async () => {
      const res = await request(app).get('/api/health');
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('healthy');
      expect(res.body.author).toBe('Harsh Kumar');
    });
  });

  describe('Authentication Flow', () => {
    it('POST /api/auth/register should create a new user account', async () => {
      const res = await request(app).post('/api/auth/register').send({
        email: testEmail,
        password: testPassword,
        fullName: 'Harsh Kumar',
        jobTitle: 'Software Engineer & AI Enthusiast',
      });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('token');
      expect(res.body.user.email).toBe(testEmail.toLowerCase());
      expect(res.body.user.fullName).toBe('Harsh Kumar');

      authToken = res.body.token;
      userId = res.body.user.id;
    });

    it('POST /api/auth/register should reject duplicate email', async () => {
      const res = await request(app).post('/api/auth/register').send({
        email: testEmail,
        password: testPassword,
        fullName: 'Duplicate Harsh',
      });

      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/already exists/i);
    });

    it('POST /api/auth/login should authenticate with valid credentials', async () => {
      const res = await request(app).post('/api/auth/login').send({
        email: testEmail,
        password: testPassword,
      });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('token');
      expect(res.body.user.email).toBe(testEmail.toLowerCase());
    });

    it('POST /api/auth/login should reject invalid credentials', async () => {
      const res = await request(app).post('/api/auth/login').send({
        email: testEmail,
        password: 'wrong_password',
      });

      expect(res.status).toBe(401);
    });

    it('GET /api/auth/me should return current user profile', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.user.email).toBe(testEmail.toLowerCase());
      expect(res.body.user.fullName).toBe('Harsh Kumar');
    });
  });

  describe('AI Email Drafting Module', () => {
    it('POST /api/emails/draft should generate structured professional email', async () => {
      const res = await request(app)
        .post('/api/emails/draft')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          recipient: 'Professor',
          purpose: 'Assignment extension',
          context: 'Facing severe fever since yesterday, doctor advised 2 days bed rest. Need extension until Friday.',
          tone: 'Professional',
          length: 'Medium',
          senderName: 'Harsh Kumar',
        });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('subject');
      expect(res.body).toHaveProperty('greeting');
      expect(res.body).toHaveProperty('body');
      expect(res.body).toHaveProperty('closing');
      expect(res.body.senderName).toBe('Harsh Kumar');
      expect(res.body.subject).toMatch(/Extension|Assignment/i);
      expect(res.body.greeting).toMatch(/Professor/i);
    });

    it('POST /api/emails/refine should refine existing email text (makeShorter)', async () => {
      const res = await request(app)
        .post('/api/emails/refine')
        .send({
          currentDraft: {
            subject: 'Meeting Request',
            greeting: 'Hi Team,',
            body: 'Paragraph 1\n\nParagraph 2\n\nParagraph 3',
            closing: 'Best,',
            senderName: 'Harsh Kumar',
          },
          action: 'makeShorter',
        });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('body');
    });

    it('POST /api/emails/save should persist email draft to PostgreSQL database', async () => {
      const res = await request(app)
        .post('/api/emails/save')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Extension Request Draft',
          subject: 'Request for Assignment Extension',
          recipient: 'Professor',
          purpose: 'Assignment extension',
          context: 'Medical leave',
          tone: 'Professional',
          body: 'Dear Professor, please find my assignment attached.',
          tags: ['college', 'urgent'],
          isPinned: true,
        });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('id');
      expect(res.body.title).toBe('Extension Request Draft');
      expect(res.body.isPinned).toBe(true);
      createdDraftId = res.body.id;
    });

    it('GET /api/emails/drafts should list drafts with search and filters', async () => {
      const res = await request(app)
        .get('/api/emails/drafts?search=Extension')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.drafts.length).toBeGreaterThan(0);
      expect(res.body.pagination.total).toBeGreaterThan(0);
    });

    it('PUT /api/emails/:id should update saved draft', async () => {
      const res = await request(app)
        .put(`/api/emails/${createdDraftId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Updated Extension Request Draft',
        });

      expect(res.status).toBe(200);
      expect(res.body.title).toBe('Updated Extension Request Draft');
    });
  });

  describe('AI Email Review Module', () => {
    it('POST /api/reviews/analyze should analyze email, detect mistakes, compute scores, and provide improved version', async () => {
      const unpolishedEmail = `hey professor\n\ni wanna ask for extension for teh assignment asap because i was sick untill yesterday and could not finish it thx\n\nharsh`;

      const res = await request(app)
        .post('/api/reviews/analyze')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          originalEmail: unpolishedEmail,
          recipient: 'Professor',
          purpose: 'Assignment extension',
          desiredTone: 'Professional',
        });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('overallScore');
      expect(res.body).toHaveProperty('grammarScore');
      expect(res.body).toHaveProperty('professionalismScore');
      expect(res.body).toHaveProperty('identifiedMistakes');
      expect(res.body.identifiedMistakes.length).toBeGreaterThan(0);
      expect(res.body).toHaveProperty('improvedEmail');
      expect(res.body.improvedEmail).toMatch(/Dear Professor/i);
      expect(res.body).toHaveProperty('reviewId');
      createdReviewId = res.body.reviewId;
    });

    it('GET /api/reviews should fetch user reviews list', async () => {
      const res = await request(app)
        .get('/api/reviews')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.reviews.length).toBeGreaterThan(0);
    });

    it('GET /api/reviews/stats should calculate real database dashboard metrics', async () => {
      const res = await request(app)
        .get('/api/reviews/stats')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.totalDrafts).toBeGreaterThanOrEqual(1);
      expect(res.body.totalReviews).toBeGreaterThanOrEqual(1);
      expect(res.body).toHaveProperty('avgOverallScore');
      expect(res.body).toHaveProperty('scoreBreakdown');
    });
  });

  describe('Security and Deletion', () => {
    it('DELETE /api/emails/:id should remove draft from database', async () => {
      const res = await request(app)
        .delete(`/api/emails/${createdDraftId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('GET /api/emails/:id should return 404 for deleted draft', async () => {
      const res = await request(app)
        .get(`/api/emails/${createdDraftId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(404);
    });

    it('Protected routes should reject unauthenticated requests', async () => {
      const res = await request(app).get('/api/emails/drafts');
      expect(res.status).toBe(401);
    });
  });
});
