const express = require('express');
const router = express.Router();
const {
  createCategory,
  getCategories,
  getCategory,
  updateCategory,
  deleteCategory
} = require('../controllers/category.controller');
const { protect, authorize } = require('../middleware/auth.middleware');
const { categoryValidation } = require('../middleware/validation.middleware');

// Public routes
router.get('/', getCategories);
router.get('/:id', getCategory);

// Admin routes
router.post('/', protect, authorize('admin'), categoryValidation, createCategory);
router.put('/:id', protect, authorize('admin'), categoryValidation, updateCategory);
router.delete('/:id', protect, authorize('admin'), deleteCategory);

module.exports = router;
