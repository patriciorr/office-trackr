import dotenv from 'dotenv';
import {logger} from './config/logger';
import mongoose from 'mongoose';
import {createServer} from 'http';
import {initSocket} from './sockets';
import app from './app';
import {bootstrapUsers} from './bootstrapUsers';

dotenv.config();

const PORT = process.env.PORT || 5000;
const mongoUri = process.env.MONGO_URI;
if (!mongoUri || !process.env.JWT_SECRET) {
  throw new Error('MONGO_URI and JWT_SECRET are required');
}

const server = createServer(app);
initSocket(server);

mongoose
  .connect(mongoUri, {dbName: process.env.MONGO_DB_NAME})
  .then(async () => {
    await bootstrapUsers();
    server.listen(PORT, () => logger.info(`Server running on port ${PORT}`));
  })
  .catch(async err => {
    logger.error('Server startup failed:', err);
    await mongoose.disconnect();
    process.exitCode = 1;
  });
