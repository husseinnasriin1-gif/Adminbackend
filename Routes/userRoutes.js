const express = require('express');
const router = express.Router();
const userController = require('../controller/userController');

router.get('/', userController.getAllUsers);
router.get('/stats', userController.getUserStats);
router.post('/', userController.createUser);
router.delete('/:id', userController.deleteUser);

// 🆕 Listen for PUT updates targeting http://localhost:8080/api/users/:id
router.put('/:id', userController.updateUser);

module.exports = router;
