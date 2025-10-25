// Quick script to reset all user usage counts
const mongoose = require('mongoose');

const MONGODB_URI = 'mongodb+srv://phild0g:!Ps3107801916@mathnotationai.drcwzid.mongodb.net/mathnotation?retryWrites=true&w=majority';

const UserSchema = new mongoose.Schema({
  userId: String,
  email: String,
  usage: {
    today: Number,
    lastResetDate: String
  },
  subscription: {
    status: String
  }
});

const User = mongoose.model('User', UserSchema);

mongoose.connect(MONGODB_URI).then(async () => {
  console.log('✅ Connected to MongoDB');

  const today = new Date().toISOString().split('T')[0];

  // Show current state
  const users = await User.find({});
  console.log('\n📊 Current state:');
  for (const user of users) {
    console.log(`  User ${user.userId}: ${user.usage.today}/10 (last reset: ${user.usage.lastResetDate})`);
  }

  // Reset all usage
  const result = await User.updateMany(
    {},
    {
      $set: {
        'usage.today': 0,
        'usage.lastResetDate': today
      }
    }
  );

  console.log(`\n✅ Reset usage for ${result.modifiedCount} users`);

  // Show new state
  const usersAfter = await User.find({});
  console.log('\n📊 After reset:');
  for (const user of usersAfter) {
    console.log(`  User ${user.userId}: ${user.usage.today}/10 (last reset: ${user.usage.lastResetDate})`);
  }

  await mongoose.disconnect();
  console.log('\n✅ Done!');
  process.exit(0);
}).catch(err => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
