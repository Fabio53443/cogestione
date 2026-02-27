# Cogestione
Una piattaforma per gestire la cogestione scolastica! 

## Developing

Once you've created a project and installed dependencies with `npm install` (or `pnpm install` or `yarn`), start a development server:

Database configuration
`DATABASE_URL=postgres://user:password@localhost:5432/cogestione`

JWT Secret for authentication tokens
`JWT_SECRET=your-secret-key-here`

Login method for students: "email" (default) or "google"
`LOGIN_METHOD=email`

Google OAuth configuration (required if LOGIN_METHOD=google)
`GOOGLE_CLIENT_ID=your-google-client-id`
`GOOGLE_CLIENT_SECRET=your-google-client-secret`

Allowed Google Workspace domain (optional, restricts login to this domain), Leave empty to allow any Google account
`GOOGLE_ALLOWED_DOMAIN=example.edu`

Cloudflare Pages URL (required for Google OAuth callback)
`CF_PAGES_URL=http://localhost:5173`
