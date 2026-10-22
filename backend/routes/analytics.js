const express = require('express');
const analyticsController = require('../controllers/analyticsController');

const router = express.Router();

router.post('/page-view', analyticsController.recordPageView);

module.exports = router;
