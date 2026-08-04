const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer;

jest.setTimeout(60000);

beforeAll(async () => {
    process.env.NODE_ENV = 'test';
    process.env.JWT_SECRET = process.env.JWT_SECRET || 'test_secret';
    process.env.JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1d';

    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();

    await mongoose.connect(uri);
});

afterEach(async () => {
    const collections = mongoose.connection.collections;
    const clearPromises = Object.values(collections).map((collection) => collection.deleteMany({}));
    await Promise.all(clearPromises);
});

afterAll(async () => {
    await mongoose.disconnect();
    if (mongoServer) {
        await mongoServer.stop();
    }
});
