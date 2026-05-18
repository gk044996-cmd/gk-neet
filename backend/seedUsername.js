require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const seedUsernames = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const users = await User.find({ username: { $exists: false } });
    console.log(`Found ${users.length} users without username`);

    for (let i = 0; i < users.length; i++) {
      const user = users[i];
      let baseUsername = user.email.split('@')[0];
      let newUsername = baseUsername;
      
      // Ensure unique
      let exists = await User.findOne({ username: { $regex: new RegExp(`^${newUsername}$`, 'i') } });
      let counter = 1;
      while (exists) {
        newUsername = `${baseUsername}${counter}`;
        exists = await User.findOne({ username: { $regex: new RegExp(`^${newUsername}$`, 'i') } });
        counter++;
      }
      
      user.username = newUsername;
      await user.save();
      console.log(`Assigned username ${newUsername} to ${user.email}`);
    }
    
    // Create/update indexes
    await User.syncIndexes();
    console.log('Indexes synced');
    
    console.log('Username seeding completed');
  } catch (err) {
    console.error('Error seeding usernames:', err);
  } finally {
    mongoose.connection.close();
  }
};

seedUsernames();
