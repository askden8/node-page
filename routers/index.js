const express = require('express');
const router = express.Router();

const ctrlHome = require('../controllers/index');
const ctrlLogin = require('../controllers/login');
const ctrlContact = require('../controllers/contact');
const ctrlMywork = require('../controllers/mywork');

router.get('/', ctrlHome.getIndex);
router.post('/', ctrlHome.sendData);

router.get('/login', ctrlLogin.getLogin());
router.get('/mywork.js', ctrlMywork.getMywork());

module.exports = router;