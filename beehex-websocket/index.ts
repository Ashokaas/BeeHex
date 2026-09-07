import { startHeartbeat, startServer } from './src/server';

const server = startServer();
startHeartbeat();
console.log(`WebSocket server started on port ${server.port}`);
