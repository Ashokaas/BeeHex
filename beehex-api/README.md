# beehex-api

The API uses PostgreSQL for persistence. With the local defaults, it connects to
`localhost:5432`, database `beehex_db`, user `postgres`, and password `postgres`.

The `users` and `games` tables, indexes, and JSONB columns are created
automatically on startup. Override the defaults with these environment variables:

```env
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=beehex_db
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
COOKIE_SECURE=false
# COOKIE_DOMAIN=beehex.fr (production only)
# DATABASE_URL can be used instead of the individual settings.
```

## Structure

- `index.ts`: initialisation de la base et démarrage du serveur.
- `src/app.ts`: configuration Express et montage des routeurs.
- `src/routes/users.ts`: inscription, connexion et gestion du compte.
- `src/routes/games.ts`: création, clôture et historique des parties.
- `src/middleware/auth.ts`: authentification JWT et clé du serveur de jeu.
- `src/db.ts`: pool PostgreSQL et création du schéma.
- `src/config.ts`, `src/types.ts`, `src/utils.ts`: configuration, types et fonctions partagées.

To install dependencies:

```bash
bun install
```

To run:

```bash
bun run index.ts
```

This project was created using `bun init` in bun v1.2.22. [Bun](https://bun.com) is a fast all-in-one JavaScript runtime.
