const express = require('express');
const router = express.Router();
const settingsController = require('../controller/settingsController');

// Define distinct endpoints mapping your settings view layout panels
router.get('/me', settingsController.getSettingsProfile);
router.put('/update-profile', settingsController.updateProfileData);
router.put('/update-password', settingsController.updateAccountPassword);
router.delete('/purge-account', settingsController.purgeAccountSelf);

module.exports = router;
