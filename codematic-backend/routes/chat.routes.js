const express = require('express');
const { chatWithAI } = require('../controllers/chat.controller');
const { authenticate } = require('../middlewares/auth.middleware');

const router = express.Router();

router.post('/', authenticate, chatWithAI);

module.exports = router;
