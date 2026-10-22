const WebsiteAnalytics = require('../models/WebsiteAnalytics');

exports.recordPageView = async (req, res) => {
  try {
    const analytics = await WebsiteAnalytics.findOneAndUpdate(
      { _id: 'website' },
      { $inc: { totalViews: 1 } },
      { new: true, upsert: true, setDefaultsOnInsert: false }
    );

    res.json({ totalViews: analytics.totalViews });
  } catch (error) {
    console.error('Error recording website page view:', error);
    res.status(500).json({ error: 'Unable to record website page view' });
  }
};
