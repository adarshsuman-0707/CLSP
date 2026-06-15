/**
 * Seed script to add sample support messages to the database
 * Run with: node seedSupportMessages.js
 */

require('dotenv').config();
require('./db/connect.js');
const SupportMessage = require('./models/SupportMessage.js');

const sampleMessages = [
  {
    senderName: "Rahul Kumar",
    senderEmail: "rahul.kumar@example.com",
    subject: "Issue with service booking",
    message: "I tried to book a plumbing service but the payment failed. Can you help me resolve this issue? My booking ID was #12345.",
    status: "pending",
  },
  {
    senderName: "Priya Sharma",
    senderEmail: "priya.sharma@example.com",
    subject: "Vendor verification delay",
    message: "I submitted my vendor verification documents 5 days ago but haven't received any update. Please check the status.",
    status: "pending",
  },
  {
    senderName: "Amit Patel",
    senderEmail: "amit.patel@example.com",
    subject: "Refund request",
    message: "The service provider cancelled my booking at the last minute. I need a refund for payment ID #PAY789. Please process this urgently.",
    status: "pending",
  },
  {
    senderName: "Sneha Reddy",
    senderEmail: "sneha.reddy@example.com",
    subject: "Account access issue",
    message: "I'm unable to login to my account. It says 'Account blocked'. I haven't violated any terms. Please help me regain access.",
    status: "replied",
    replyText: "Hello Sneha, we've reviewed your account and found it was blocked by mistake. Your account has been unblocked. You can now login normally. We apologize for the inconvenience.",
    repliedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
  },
  {
    senderName: "Vikram Singh",
    senderEmail: "vikram.singh@example.com",
    subject: "Service quality complaint",
    message: "The electrician who came to my house was unprofessional and did not complete the work properly. I want to file a formal complaint.",
    status: "pending",
  },
  {
    senderName: "Anjali Gupta",
    senderEmail: "anjali.gupta@example.com",
    subject: "Feature request",
    message: "It would be great if you could add a feature to schedule recurring services (like monthly cleaning). This would be very helpful for regular customers.",
    status: "replied",
    replyText: "Thank you for your suggestion, Anjali! We're currently working on a recurring booking feature and it will be available in the next update. We'll notify you once it's live.",
    repliedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
  },
  {
    senderName: "Deepak Verma",
    senderEmail: "deepak.verma@example.com",
    subject: "Payment not reflecting",
    message: "I made a payment of ₹1500 yesterday but it's still showing as pending in my bookings. The amount has been deducted from my bank account.",
    status: "pending",
  },
  {
    senderName: "Kavita Joshi",
    senderEmail: "kavita.joshi@example.com",
    subject: "Unable to upload profile picture",
    message: "Every time I try to upload my profile picture, I get an error saying 'Upload failed'. I've tried different images but same issue.",
    status: "pending",
  },
];

async function seedSupportMessages() {
  try {
    console.log('🌱 Starting to seed support messages...');

    // Clear existing messages (optional - comment out if you want to keep existing data)
    // await SupportMessage.deleteMany({});
    // console.log('✅ Cleared existing support messages');

    // Insert sample messages
    const inserted = await SupportMessage.insertMany(sampleMessages);
    console.log(`✅ Successfully inserted ${inserted.length} support messages`);

    // Show summary
    const pending = await SupportMessage.countDocuments({ status: 'pending' });
    const replied = await SupportMessage.countDocuments({ status: 'replied' });
    console.log(`\n📊 Summary:`);
    console.log(`   - Pending: ${pending}`);
    console.log(`   - Replied: ${replied}`);
    console.log(`   - Total: ${pending + replied}`);

    console.log('\n✨ Seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding support messages:', error);
    process.exit(1);
  }
}

// Run the seed function
seedSupportMessages();
