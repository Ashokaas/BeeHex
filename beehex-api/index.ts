import { app } from './src/app';
import { config } from './src/config';
import { initializeDatabase } from './src/db';

initializeDatabase()
  .then(() => {
    app.listen(config.port, () => {
      console.log(`API server started on port ${config.port}`);
    });
  })
  .catch(error => {
    console.error('Could not initialize PostgreSQL database', error);
    process.exit(1);
  });
