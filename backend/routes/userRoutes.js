const express = require('express');
const userController = require('./../controllers/userController');
const authController = require('./../controllers/authController');
const multerController = require('./../controllers/multerController');

const router = express.Router();

router.get('/read', userController.readFile);
router.post('/write', userController.writeToFile);
router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.get('/', userController.getAllUsers);
router
  .route('/:id')
  .get(userController.getUser)
  .delete(userController.deleteUser);

// Protect all routes after this middleware
router.use(authController.protect);

router.put(
  '/upload-profile',
  userController.getMe,
  multerController.uploadPhoto,
  userController.updateMe
);
router.put('/updateMe', userController.getMe, userController.updateMe);

module.exports = router;
