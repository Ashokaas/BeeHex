# beehex-websocket

Serveur WebSocket Bun pour le matchmaking et les parties Hex.

## Structure

- `index.ts`: point d'entrée minimal.
- `src/server.ts`: serveur Bun et traitement des messages WebSocket.
- `src/game-instance.ts`: règles et état d'une partie Hex.
- `src/matchmaking.ts`: files d'attente, salons et gestion des connexions.
- `src/api-client.ts`: communication avec l'API BeeHex.
- `src/auth.ts`: authentification JWT des connexions.
- `src/protocol.ts`: validation et sérialisation des paquets.
- `src/state.ts`: état mémoire partagé du serveur.
- `src/config.ts`, `src/types.ts`, `src/utils.ts`: configuration, types et utilitaires.

To install dependencies:

```bash
bun install
```

To run:

```bash
bun run index.ts
```

Le websocket écoute par défaut sur le port `3002`. Sa configuration peut être
modifiée avec ces variables :

```env
WEBSOCKET_PORT=3002

API_PROTOCOL=http
API_HOST=localhost
API_PORT=3001
```

`DATABASE_ADDRESS` reste accepté pour fournir directement l'URL complète de
l'API, par exemple `DATABASE_ADDRESS=http://127.0.0.1:3001`. Cette variable est
prioritaire sur `API_PROTOCOL`, `API_HOST` et `API_PORT`.

This project was created using `bun init` in bun v1.2.22. [Bun](https://bun.com) is a fast all-in-one JavaScript runtime.
