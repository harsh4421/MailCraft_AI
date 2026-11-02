import request from 'supertest';
import app from '../src/app';
import { DemoAIProvider } from '../src/services/ai/demoProvider';
import { detectPurposeContextConflict } from '../src/utils/conflictDetector';
import { extractContextFacts, normalizeTokens } from '../src/utils/languageCleaner';
import { validateAndRepairDraft } from '../src/utils/outputValidator';

describe('MailCraft AI Regression & Quality Test Suite', () => {
  const demoProvider = new DemoAIProvider();

  describe('1. Exact Defect Reproduction & Purpose-Context Conflict', () => {
    it('should detect conflict when purpose is "Assignment extension" but context is "i unwelll not able to come twoo dyss"', async () => {
      const res = await request(app)
        .post('/api/emails/draft')
        .send({
          recipient: 'Professor',
          purpose: 'Assignment extension',
          tone: 'Professional',
          length: 'Medium',
          context: 'i unwelll not able to come twoo dyss',
          senderName: 'Harsh Kumar',
        });

      expect(res.status).toBe(200);
      expect(res.body.needsClarification).toBe(true);
      expect(res.body.clarificationMessage).toContain('two-day absence');
      expect(res.body.clarificationMessage).toContain('Do you want to request leave or an assignment extension?');
      expect(res.body.clarificationOptions).toHaveLength(2);
      expect(res.body.clarificationOptions[0].label).toBe('Request leave');
      expect(res.body.clarificationOptions[1].label).toBe('Request an extension');
      expect(res.body.isDemoMode).toBe(true);
    });

    it('should generate exact acceptable leave email when user resolves to "Leave request"', async () => {
      const res = await request(app)
        .post('/api/emails/draft')
        .send({
          recipient: 'Professor',
          purpose: 'Assignment extension',
          tone: 'Professional',
          length: 'Medium',
          context: 'i unwelll not able to come twoo dyss',
          senderName: 'Harsh Kumar',
          confirmedPurpose: 'Leave request',
        });

      expect(res.status).toBe(200);
      expect(res.body.needsClarification).toBeFalsy();
      expect(res.body.subject).toBe('Request for Two Days of Leave');
      expect(res.body.greeting).toBe('Dear Professor,');
      expect(res.body.body).toContain('I am unwell and will be unable to attend for two days.');
      expect(res.body.body).toContain('I would appreciate your approval for this absence.');
      expect(res.body.body).toContain('Thank you for your understanding.');
      expect(res.body.closing).toBe('Sincerely,');
      expect(res.body.senderName).toBe('Harsh Kumar');

      // Assert complete elimination of placeholders & universal filler
      expect(res.body.subject).not.toContain('[Course Name]');
      expect(res.body.greeting).not.toContain('[Last Name]');
      expect(res.body.body).not.toContain('prepared the prerequisites');
      expect(res.body.body).not.toContain('pending matters remain organized');
      expect(res.body.body).not.toContain('i unwelll not able to come twoo dyss');
      expect(res.body.body).not.toContain('To provide the relevant context:');
    });

    it('should generate relevant extension email when user confirms "Assignment extension"', async () => {
      const res = await request(app)
        .post('/api/emails/draft')
        .send({
          recipient: 'Professor',
          purpose: 'Assignment extension',
          tone: 'Professional',
          length: 'Medium',
          context: 'i unwelll not able to come twoo dyss',
          senderName: 'Harsh Kumar',
          confirmedPurpose: 'Assignment extension',
        });

      expect(res.status).toBe(200);
      expect(res.body.needsClarification).toBeFalsy();
      expect(res.body.subject).toBe('Request for Assignment Deadline Extension - Harsh Kumar');
      expect(res.body.greeting).toBe('Dear Professor,');
      expect(res.body.body).toContain('I am unwell and will be unable to attend for two days.');
      expect(res.body.body).toContain('request a brief extension on my upcoming assignment.');
      expect(res.body.subject).not.toContain('[Course Name]');
      expect(res.body.greeting).not.toContain('[Last Name]');
    });
  });

  describe('2. Language Normalization & Hinglish Transformation', () => {
    it('should normalize typos, shorthand, and broken grammar', () => {
      const normalized = normalizeTokens('i unwelll not able to come twoo dyss teh untill');
      expect(normalized).toContain('unwell');
      expect(normalized).toContain('two');
      expect(normalized).toContain('days');
      expect(normalized).toContain('the');
      expect(normalized).toContain('until');
    });

    it('should transform Hinglish terms into clean professional facts', () => {
      const facts = extractContextFacts('kal nahi aa paunga tabiyat kharab hai do din chutti');
      expect(facts.hasAbsence).toBe(true);
      expect(facts.durationDays).toBe(2);
      expect(facts.cleanText).toContain('I am unwell');
      expect(facts.cleanText).toContain('two days');
    });

    it('should preserve facts faithfully without inventing dates or certificates', () => {
      const facts = extractContextFacts('have fever since yesterday need 3 days rest');
      expect(facts.hasAbsence).toBe(true);
      expect(facts.durationDays).toBe(3);
      expect(facts.duration).toBe('three days');
      // Should not hallucinate doctor name or diagnosis not in context
      expect(facts.cleanText).not.toContain('Dr.');
      expect(facts.cleanText).not.toContain('hospitalization');
    });
  });

  describe('3. Elimination of Unresolved Placeholders & Output Validation', () => {
    it('should repair [Last Name] and bracketed course names automatically', () => {
      const input = {
        subject: 'Request for Extension - [Course Name] - Harsh Kumar',
        greeting: 'Dear Professor [Last Name],',
        body: 'I am requesting an extension.\n\nI have carefully prepared the prerequisites and would welcome the opportunity to discuss any feedback or questions you might have.',
        closing: 'Sincerely,',
        senderName: 'Harsh Kumar',
        isDemoMode: true,
        aiModel: 'Demo',
      };

      const result = validateAndRepairDraft(input, 'Harsh Kumar');
      expect(result.isValid).toBe(true);
      expect(result.repairedResult.greeting).toBe('Dear Professor,');
      expect(result.repairedResult.subject).toBe('Request for Extension - Harsh Kumar');
      expect(result.repairedResult.body).not.toContain('prepared the prerequisites');
    });

    it('should replace [Your Name] placeholder with sender name fallback', () => {
      const input = {
        subject: 'Leave Request',
        greeting: 'Dear Professor,',
        body: 'I am unwell today.',
        closing: 'Sincerely,',
        senderName: '[Your Name]',
        isDemoMode: true,
        aiModel: 'Demo',
      };

      const result = validateAndRepairDraft(input, 'Harsh Kumar');
      expect(result.isValid).toBe(true);
      expect(result.repairedResult.senderName).toBe('Harsh Kumar');
    });

    it('should detect residual unrepairable placeholders as validation failure', () => {
      const input = {
        subject: 'Meeting with [Unknown Entity XYZ]',
        greeting: 'Dear Professor,',
        body: 'Please see [Attachment 99].',
        closing: 'Sincerely,',
        senderName: 'Harsh Kumar',
        isDemoMode: true,
        aiModel: 'Demo',
      };

      const result = validateAndRepairDraft(input);
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0]).toContain('Unresolved placeholders detected');
    });
  });

  describe('4. Purpose-Adaptive Organization', () => {
    it('should generate meeting request without leave boilerplate', async () => {
      const draft = await demoProvider.draftEmail({
        recipient: 'Client',
        purpose: 'Meeting request',
        tone: 'Formal',
        length: 'Short',
        context: 'Need 20 minutes sync to review sprint deliverables',
        senderName: 'Harsh Kumar',
      });

      expect(draft.subject).toContain('Meeting Request');
      expect(draft.greeting).toMatch(/Client/i);
      expect(draft.body).toContain('15–20 minute discussion');
      expect(draft.body).not.toContain('leave');
      expect(draft.body).not.toContain('prerequisites');
      expect(draft.body).not.toContain('all pending matters remain organized');
    });

    it('should generate job application with professional interest and no leave context', async () => {
      const draft = await demoProvider.draftEmail({
        recipient: 'HR',
        purpose: 'Job application',
        tone: 'Confident',
        length: 'Medium',
        context: 'Applying for full stack engineer role with React and Node.js expertise',
        senderName: 'Harsh Kumar',
      });

      expect(draft.subject).toBe('Job Application - Harsh Kumar');
      expect(draft.greeting).toBe('Dear Hiring Manager,');
      expect(draft.body).toContain('strong interest in the opportunity');
      expect(draft.body).toContain('discuss my background');
      expect(draft.body).not.toContain('prerequisites');
    });
  });

  describe('5. Honest Demo Mode Identity', () => {
    it('should clearly indicate demo engine and deterministic mode', async () => {
      const res = await request(app)
        .post('/api/emails/draft')
        .send({
          recipient: 'Professor',
          purpose: 'Leave request',
          tone: 'Professional',
          length: 'Short',
          context: 'Will be unable to attend classes today due to fever',
          senderName: 'Harsh Kumar',
        });

      expect(res.status).toBe(200);
      expect(res.body.isDemoMode).toBe(true);
      expect(res.body.aiModel).toBe('MailCraft Deterministic Engine');
    });
  });
});
