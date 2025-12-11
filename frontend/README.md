# MediConnect Frontend - Placeholder

This is the Next.js frontend for the MediConnect healthcare platform.

## Structure

```
frontend/
├── public/              # Static assets
├── pages/              # Next.js pages
│   ├── auth/          # Login/Register pages
│   └── dashboard/     # Dashboard pages
├── components/        # Reusable React components
├── hooks/            # Custom React hooks
├── lib/              # Utilities and helpers
├── styles/           # CSS/styling
└── types/            # TypeScript types
```

## Development

```bash
npm install
npm run dev
```

Frontend will be available at `http://localhost:3000`

## Features to Implement

- Patient login/registration
- Doctor login/registration
- Patient dashboard (view upcoming appointments)
- Doctor dashboard (add clinical notes)
- JWT token management
- API integration with backend
- Protected routes
- Error handling

## Environment Variables

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

## Testing

```bash
npm run test
npm run test:watch
```
