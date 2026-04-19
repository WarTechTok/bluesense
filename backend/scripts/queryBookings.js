const mongoose = require('mongoose');

// Connection string from .env
const MONGO_URI = 'mongodb+srv://poolUser:poolUser123@poolcluster.brghuqk.mongodb.net/bluesense?appName=PoolCluster';

// Define Booking schema inline
const bookingSchema = new mongoose.Schema({
  customerName: String,
  status: String,
  totalAmount: Number,
  downpayment: Number,
  paymentStatus: String,
  package: String,
  session: String,
  pax: Number,
  oasis: String,
  bookingDate: Date,
  bookingNumber: Number,
  paymentMethod: String
}, { timestamps: true });

const Booking = mongoose.model('Booking', bookingSchema);

async function queryBookings() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('Connected successfully!\n');

    // Query all bookings
    const bookings = await Booking.find({}).sort({ createdAt: -1 });
    
    console.log('==============================================');
    console.log('ALL BOOKINGS IN DATABASE');
    console.log('==============================================\n');
    
    if (bookings.length === 0) {
      console.log('No bookings found in database.');
      await mongoose.disconnect();
      return;
    }

    // Display each booking
    console.log('DETAILED BOOKINGS:');
    console.log('-------------------------------------------');
    bookings.forEach((booking, index) => {
      console.log(\\n\. \\);
      console.log(\   Booking #: \\);
      console.log(\   Status: \\);
      console.log(\   Total Amount: PHP \\);
      console.log(\   Down Payment: PHP \\);
      console.log(\   Payment Status: \\);
      console.log(\   Package: \\);
      console.log(\   Session: \\);
      console.log(\   Pax: \\);
      console.log(\   Oasis: \\);
      console.log(\   Booking Date: \\);
      console.log(\   Payment Method: \\);
    });

    // Breakdown by status
    console.log('\n\n==============================================');
    console.log('BREAKDOWN BY STATUS');
    console.log('==============================================');
    
    const statusBreakdown = {};
    const statusAmounts = {};
    
    bookings.forEach(booking => {
      const status = booking.status;
      statusBreakdown[status] = (statusBreakdown[status] || 0) + 1;
      statusAmounts[status] = (statusAmounts[status] || 0) + booking.totalAmount;
    });

    let totalAmount = 0;
    Object.keys(statusBreakdown).forEach(status => {
      const count = statusBreakdown[status];
      const amount = statusAmounts[status];
      totalAmount += amount;
      console.log(\\: \ booking(s) - PHP \\);
    });

    console.log(\\nTOTAL: PHP \\);

    // Breakdown by payment status
    console.log('\n==============================================');
    console.log('BREAKDOWN BY PAYMENT STATUS');
    console.log('==============================================');
    
    const paymentBreakdown = {};
    const paymentAmounts = {};
    
    bookings.forEach(booking => {
      const pStatus = booking.paymentStatus;
      paymentBreakdown[pStatus] = (paymentBreakdown[pStatus] || 0) + 1;
      paymentAmounts[pStatus] = (paymentAmounts[pStatus] || 0) + booking.totalAmount;
    });

    Object.keys(paymentBreakdown).forEach(pStatus => {
      const count = paymentBreakdown[pStatus];
      const amount = paymentAmounts[pStatus];
      console.log(\\: \ booking(s) - PHP \\);
    });

    // Summary
    console.log('\n==============================================');
    console.log('SUMMARY');
    console.log('==============================================');
    console.log(\Total Bookings: \\);
    console.log(\Total Amount: PHP \\);
    console.log(\Average per Booking: PHP \\);

    await mongoose.disconnect();
    console.log('\nDatabase disconnected.');
    
  } catch (error) {
    console.error('Error:', error.message);
    await mongoose.disconnect();
    process.exit(1);
  }
}

queryBookings();
