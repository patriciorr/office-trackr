import mongoose from 'mongoose';
import {afterAll, afterEach, beforeAll} from '@jest/globals';

beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_URI as string);
});

afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const name of Object.keys(collections)) {
    await collections[name].deleteMany({});
  }
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
});
