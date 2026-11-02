# MailCraft AI — REST API Documentation
**Developer:** Harsh Kumar  
**Base URL:** `http://localhost:5005/api` (or proxied via `/api` in Vite)  
**Content-Type:** `application/json`  

---

## 1. Authentication Endpoints

### `POST /auth/register`
Creates a new user account and returns a JWT token.
* **Request Body:**
```json
{
  "email": "harsh@example.com",
  "password": "Password123!",
  "fullName": "Harsh Kumar",
  "jobTitle": "Software Engineering Student"
}
```
* **Success Response (201 Created):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "c6a28795-4dbb-4d40-b472-cf6226ff3cf6",
    "email": "harsh@example.com",
    "fullName": "Harsh Kumar",
    "jobTitle": "Software Engineering Student",
    "defaultSenderName": "Harsh Kumar",
    "createdAt": "2026-11-02T08:50:00.000Z"
  }
}
```

### `POST /auth/login`
Authenticates existing credentials.
* **Request Body:**
```json
{
  "email": "harsh@example.com",
  "password": "Password123!"
}
```
* **Success Response (200 OK):** Returns `{ token, user }`.

### `GET /auth/me`
Fetches authenticated user profile.
* **Header:** `Authorization: Bearer <token>`
* **Success Response (200 OK):** Returns `{ user: { id, email, fullName, jobTitle, defaultSenderName, settings } }`.

---

## 2. AI Email Drafting Endpoints

### `POST /emails/draft`
Generates a complete, tailored email draft.
* **Header:** `Authorization: Bearer <token>` (Optional)
* **Request Body:**
```json
{
  "recipient": "Professor",
  "purpose": "Assignment extension",
  "context": "Fever since yesterday, doctor advised 2 days rest, request extension until Friday 5 PM.",
  "tone": "Professional",
  "length": "Medium",
  "senderName": "Harsh Kumar",
  "additionalInstructions": "Mention attached medical certificate"
}
```
* **Success Response (200 OK):**
```json
{
  "subject": "Request for Assignment Deadline Extension - Harsh Kumar",
  "greeting": "Dear Professor [Last Name],",
  "body": "I hope this email finds you well. I am writing to formally communicate regarding assignment extension...\n\nTo provide the relevant context: Fever since yesterday...",
  "closing": "Warm regards,",
  "senderName": "Harsh Kumar",
  "generationId": "d04a6018-8f85-4ae2-a279-d125dbb277d0",
  "isDemoMode": true,
  "aiModel": "MailCraft NLP Engine (Demo Mode)"
}
```

### `POST /emails/refine`
Performs targeted transformation on an existing draft.
* **Request Body:**
```json
{
  "currentDraft": {
    "subject": "Meeting Request",
    "greeting": "Hi Team,",
    "body": "Paragraph 1\n\nParagraph 2\n\nParagraph 3",
    "closing": "Best,",
    "senderName": "Harsh Kumar"
  },
  "action": "makeShorter"
}
```
* **Actions Supported:** `makeShorter`, `makeLonger`, `improveProfessionalism`, `changeTone`, `customInstruction`.

### `POST /emails/save`
Saves an email draft to the user's PostgreSQL database.
* **Header:** `Authorization: Bearer <token>`
* **Request Body:**
```json
{
  "title": "Assignment Extension Draft",
  "subject": "Request for Assignment Deadline Extension",
  "recipient": "Professor",
  "purpose": "Assignment extension",
  "context": "Medical leave",
  "tone": "Professional",
  "body": "Dear Professor Sharma, please find my assignment attached...",
  "tags": ["college", "urgent"],
  "isPinned": false
}
```

### `GET /emails/drafts`
Retrieves user drafts with search, filtering, and pagination.
* **Query Params:** `search`, `recipient`, `purpose`, `page`, `limit`.

---

## 3. AI Email Review Endpoints

### `POST /reviews/analyze`
Performs a 5-dimensional audit on an existing email and generates a rewritten version.
* **Header:** `Authorization: Bearer <token>` (Optional)
* **Request Body:**
```json
{
  "originalEmail": "hey prof,\ni wanna ask for extension for the assignment asap cuz i was sick untill yesterday and couldn't finish it thx\nharsh",
  "recipient": "Professor",
  "purpose": "Assignment extension",
  "context": "Medical leave for 2 days",
  "desiredTone": "Professional"
}
```
* **Success Response (200 OK):**
```json
{
  "overallScore": 88,
  "grammarScore": 90,
  "professionalismScore": 85,
  "contextScore": 90,
  "toneScore": 85,
  "clarityScore": 92,
  "detectedTone": "Casual / Friendly",
  "identifiedMistakes": [
    {
      "id": "grammar-1",
      "type": "grammar",
      "original": "i",
      "suggestion": "I",
      "explanation": "Capitalize the personal pronoun 'I'.",
      "severity": "medium"
    },
    {
      "id": "prof-greeting",
      "type": "professionalism",
      "original": "hey prof,",
      "suggestion": "Dear Professor,",
      "explanation": "Casual greetings like 'Hey' are inappropriate when addressing a Professor.",
      "severity": "high"
    }
  ],
  "suggestions": [
    "Elevate salutation: Use 'Dear Professor' instead of casual openers.",
    "Eliminate texting abbreviations ('asap', 'wanna', 'thx')."
  ],
  "improvedEmail": "Dear Professor,\n\nI hope this email finds you well...\n\nSincerely,\nHarsh Kumar",
  "reviewId": "e158652f-1033-4f9e-a864-ffec834466b0",
  "isDemoMode": true,
  "aiModel": "MailCraft NLP Review Engine (Demo Mode)"
}
```

### `GET /reviews/stats`
Returns aggregated live analytics calculated from PostgreSQL records for the user's dashboard.

---

## 4. User Preferences & AI Status

### `GET /users/ai-status`
Returns active AI provider status:
```json
{
  "activeProvider": "MailCraft NLP Engine (Demo Mode)",
  "isDemoMode": true,
  "hasCustomKey": false
}
```

### `PUT /users/settings`
Updates preferences: `{ theme, defaultTone, defaultRecipient, defaultLength, customApiKey, useDemoMode }`.
