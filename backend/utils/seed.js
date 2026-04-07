const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Category = require('../models/Category.model');
const User = require('../models/User.model');

dotenv.config();

const categories = [
  { name: 'Conference', description: 'Professional conferences and summits', icon: '🎤', color: '#6366f1' },
  { name: 'Workshop', description: 'Hands-on learning workshops', icon: '🔧', color: '#8b5cf6' },
  { name: 'Seminar', description: 'Educational seminars and lectures', icon: '📚', color: '#06b6d4' },
  { name: 'Networking', description: 'Professional networking events', icon: '🤝', color: '#10b981' },
  { name: 'Concert', description: 'Music concerts and performances', icon: '🎵', color: '#f43f5e' },
  { name: 'Sports', description: 'Sports events and tournaments', icon: '⚽', color: '#f97316' },
  { name: 'Exhibition', description: 'Art and trade exhibitions', icon: '🎨', color: '#ec4899' },
  { name: 'Charity', description: 'Charity and fundraising events', icon: '❤️', color: '#ef4444' },
  { name: 'Technology', description: 'Tech meetups and hackathons', icon: '💻', color: '#3b82f6' },
  { name: 'Food & Drink', description: 'Food festivals and tastings', icon: '🍕', color: '#eab308' },
  { name: 'Health & Wellness', description: 'Health and wellness events', icon: '🧘', color: '#14b8a6' },
  { name: 'Education', description: 'Educational events and courses', icon: '🎓', color: '#a855f7' },
  { name: 'Business', description: 'Business meetings and corporate events', icon: '💼', color: '#64748b' },
  { name: 'Social', description: 'Social gatherings and parties', icon: '🎉', color: '#d946ef' },
  { name: 'Other', description: 'Other events', icon: '📅', color: '#78716c' }
];

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Seed categories
    await Category.deleteMany({});
    let count = 0;
    for (const cat of categories) {
      // compute slug like model pre-save does
      const slug = cat.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      await Category.create({ ...cat, slug });
      count++;
    }
    console.log(`${count} categories seeded`);

    // Create admin user
    const adminExists = await User.findOne({ email: 'admin@eventrix.com' });
    if (!adminExists) {
      await User.create({
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@eventrix.com',
        password: 'Admin@123456',
        role: 'admin',
        isEmailVerified: true,
        authProvider: 'local'
      });
      console.log('Admin user created (admin@eventrix.com / Admin@123456)');
    }

    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

seedDatabase();
