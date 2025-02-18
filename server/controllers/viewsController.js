const viewsService = require('../services/viewsService');

exports.getPopularProducts = async (req, res) => {
  const limit = parseInt(req.query.limit) || 10; // 기본 10개
  const response = await viewsService.getPopularProducts(limit);
  res.status(response.success ? 200 : 500).json(response);
};
