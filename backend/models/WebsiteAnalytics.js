const mongoose = require('mongoose');

const websiteAnalyticsSchema = new mongoose.Schema({
  _id: {
    type: String,
    default: 'website'
  },
  totalViews: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

module.exports = mongoose.model('WebsiteAnalytics', websiteAnalyticsSchema);
