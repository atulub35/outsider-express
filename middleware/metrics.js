const metricsService = require('../services/metricsService');

const trackRequest = (req, res, next) => {
    metricsService.trackRequest();
    next();
};

module.exports = {
    trackRequest
};

