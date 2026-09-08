import dotenv from 'dotenv';
import {logger} from './config/logger';
import mongoose from 'mongoose';
import {createServer} from 'http';
import {initSocket} from './sockets';
import app from './app';

dotenv.config();

const PORT = process.env.PORT || 5000;

const server = createServer(app);
initSocket(server);

mongoose
  .connect(process.env.MONGO_URI as string)
  .then(() => {
    server.listen(PORT, () => logger.info(`Server running on port ${PORT}`));
  })
  .catch(err => logger.error('DB connection error:', err));
