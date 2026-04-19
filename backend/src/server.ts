import { createServer } from 'http';
import app from './app';
import { env } from './config/env';
import { connectDB } from './config/db';
import { initSockets } from './sockets';
import { initCronJobs } from './services/cron.service';
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [new winston.transports.Console()],
});

const httpServer = createServer(app);

async function startServer() {
  // 1. Connect to Database
  await connectDB();

  // 2. Initialize Sockets
  initSockets(httpServer);

  // 3. Start Cron Jobs
  initCronJobs();

  // 4. Listen
  httpServer.listen(env.PORT, () => {
    logger.info(`Server running in ${env.NODE_ENV} mode on port ${env.PORT}`);
  });
}

startServer().catch((error) => {
  logger.error('Failed to start server:', error);
  process.exit(1);
});
