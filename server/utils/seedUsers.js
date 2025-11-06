require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const { logger } = require('./logger');

const seedUsers = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    logger.info('Connected to MongoDB');

    // Clear existing users
    await User.deleteMany({});
    logger.info('Cleared existing users');

    // Create seed users
    const users = [
      {
        email: 'admin@example.com',
        password: 'Admin123!',
        firstName: 'Admin',
        lastName: 'User',
        displayName: 'Admin User',
        role: 'admin',
        isEmailVerified: true,
        metadata: {
          signupSource: 'seed',
        },
      },
      {
        email: 'user@example.com',
        password: 'User123!',
        firstName: 'Regular',
        lastName: 'User',
        displayName: 'Regular User',
        role: 'user',
        isEmailVerified: true,
        metadata: {
          signupSource: 'seed',
        },
      },
    ];

    await User.insertMany(users);
    logger.info(`Seeded ${users.length} users successfully`);

    mongoose.connection.close();
    logger.info('Database connection closed');
  } catch (error) {
    logger.error('Seed error:', error);
    process.exit(1);
  }
};

seedUsers();
