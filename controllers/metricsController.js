const metricsService = require('../services/metricsService');

const getMetrics = (req, res) => {
    const metrics = metricsService.getMetrics();
    res.json(metrics);
};

module.exports = {
    getMetrics
};

