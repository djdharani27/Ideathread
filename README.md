# IdeaThreads

IdeaThreads is a conversational idea discussion platform for ideathons, hackathons, and closed groups. Users sign in with Google, start idea rooms, and reply in real time inside each thread.

## Stack

- Next.js App Router
- JavaScript only
- Firebase Authentication
- Cloud Firestore
- Tailwind CSS v4

## Main Data Model

### `ideas`

- `id`
- `userId`
- `authorName`
- `authorEmail`
- `authorPhotoURL`
- `title`
- `description`
- `createdAt`

### `messages`

- `id`
- `ideaId`
- `userId`
- `userName`
- `userPhotoURL`
- `text`
- `createdAt`

## Setup

1. Install dependencies:

```bash
npm install
```

2. Copy `.env.local.example` to `.env.local`.
3. Add your Firebase Web App config values.
4. Enable Google sign-in in Firebase Authentication.
5. Create Firestore and apply the rules from `firestore.rules`.
6. Run locally:

```bash
npm run dev
```

## Notes

- The app keeps the existing Firebase client setup and protected routes.
- Each idea becomes a live room powered by Firestore `onSnapshot`.
- Unauthenticated users are redirected to `/` for protected pages.
