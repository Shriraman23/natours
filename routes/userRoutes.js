const express = require('express');
const userController = require('./../controllers/userController.js');
const authController = require('./../controllers/authController.js');

const router = express.Router();

// SignUp User

router.post('/signup', authController.signup);
router.post('/login', authController.login);

// Routing Users

router
  .route('/')
  .get(userController.getAllUsers)
  .post(userController.postUser);
router
  .route('/:id?')
  .get(userController.getUserById)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

module.exports = router;
