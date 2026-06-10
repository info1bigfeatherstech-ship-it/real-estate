const express = require('express');

const router = express.Router();

router.get('/', (_req, res) => {
  res.status(501).json({
    success: false,
    message: 'User API endpoints are not implemented yet',
  });
});

module.exports = router;
