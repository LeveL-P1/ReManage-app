# ReManage

ReManage is the separate Expo mobile application for residents and guards.

## Requirements

- Node.js LTS
- npm

## Local setup

```powershell
npm install
Copy-Item .env.example .env.local
npm start
```

Set `EXPO_PUBLIC_API_BASE_URL` in `.env.local` to the HTTP or HTTPS origin of the ReManage backend.

## Checks

```powershell
npm test
npm run typecheck
npm run lint
```

## API boundary

The mobile application depends on the dedicated `/api/mobile/v1` API provided by the existing ReManage backend.

This repository contains no backend implementation and no legacy API implementation.
